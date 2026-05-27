import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { IProductRepository } from "../../domain/repositories/product.repository.interface";
import { PRODUCT_REPOSITORY } from "../../domain/repositories/product.repository.interface";
import type { IProductSizeRepository } from "../../domain/repositories/product-size.repository.interface";
import { PRODUCT_SIZE_REPOSITORY } from "../../domain/repositories/product-size.repository.interface";
import type { IProductModifierRepository } from "../../domain/repositories/product-modifier.repository.interface";
import { PRODUCT_MODIFIER_REPOSITORY } from "../../domain/repositories/product-modifier.repository.interface";
import type { IProductModifierGroupRepository } from "../../domain/repositories/product-modifier-group.repository.interface";
import { PRODUCT_MODIFIER_GROUP_REPOSITORY } from "../../domain/repositories/product-modifier-group.repository.interface";
import type { IComboRepository } from "../../domain/repositories/combo.repository.interface";
import { COMBO_REPOSITORY } from "../../domain/repositories/combo.repository.interface";

export interface LineItemInput {
  productId: string;
  productSizeId?: string | null;
  comboId?: string | null;
  quantity: number;
  modifiers?: { modifierId: string }[];
}

export interface PricedModifier {
  modifierId: string;
  priceAdjustment: number;
}

export interface PricedLineItem {
  unitPrice: number;
  subtotal: number;
  modifiers: PricedModifier[];
}

/**
 * Valida y cotiza una línea (producto + tamaño/combo + modificadores) contra el
 * catálogo actual. Lo usan tanto la creación de órdenes (precio congelado en la
 * orden) como el carrito (recalculado en cada lectura).
 */
@Injectable()
export class LineItemPricingService {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
    @Inject(PRODUCT_SIZE_REPOSITORY)
    private readonly productSizeRepository: IProductSizeRepository,
    @Inject(PRODUCT_MODIFIER_REPOSITORY)
    private readonly productModifierRepository: IProductModifierRepository,
    @Inject(PRODUCT_MODIFIER_GROUP_REPOSITORY)
    private readonly productModifierGroupRepository: IProductModifierGroupRepository,
    @Inject(COMBO_REPOSITORY)
    private readonly comboRepository: IComboRepository,
  ) {}

  async priceLineItem(input: LineItemInput): Promise<PricedLineItem> {
    if (input.comboId && input.productSizeId) {
      throw new BadRequestException(
        "comboId and productSizeId cannot both be provided",
      );
    }

    const product = await this.productRepository.findUnique({
      where: { id: input.productId },
    });
    if (!product) {
      throw new NotFoundException(
        `Product with id ${input.productId} not found`,
      );
    }

    let unitPrice: number;

    if (input.comboId) {
      const combo = await this.comboRepository.findUnique({
        where: { id: input.comboId },
      });
      if (!combo) {
        throw new NotFoundException(`Combo with id ${input.comboId} not found`);
      }
      unitPrice = combo.price;
    } else if (input.productSizeId) {
      const size = await this.productSizeRepository.findUnique({
        where: { id: input.productSizeId },
      });
      if (!size) {
        throw new NotFoundException(
          `ProductSize with id ${input.productSizeId} not found`,
        );
      }
      if (size.productId !== input.productId) {
        throw new BadRequestException(
          `ProductSize ${input.productSizeId} does not belong to product ${input.productId}`,
        );
      }
      unitPrice = size.price;
    } else {
      unitPrice = product.basePrice;
    }

    const modifiers: PricedModifier[] = [];
    let modifierTotal = 0;

    const inputModifiers = input.modifiers ?? [];
    if (inputModifiers.length > 0) {
      const modifierIds = inputModifiers.map((modifier) => modifier.modifierId);
      const sizePricesMap = input.productSizeId
        ? await this.productModifierRepository.findSizePricesBatch(
            modifierIds,
            input.productSizeId,
          )
        : new Map<string, number>();

      for (const modInput of inputModifiers) {
        const modifier = await this.productModifierRepository.findUnique({
          where: { id: modInput.modifierId },
        });
        if (!modifier) {
          throw new NotFoundException(
            `ProductModifier with id ${modInput.modifierId} not found`,
          );
        }
        const group = await this.productModifierGroupRepository.findUnique({
          where: { id: modifier.groupId },
        });
        if (!group || group.productId !== input.productId) {
          throw new BadRequestException(
            `ProductModifier ${modInput.modifierId} does not belong to product ${input.productId}`,
          );
        }
        if (modifier.sizeRestricted && input.productSizeId) {
          if (!sizePricesMap.has(modInput.modifierId)) {
            throw new BadRequestException(
              `Modifier ${modInput.modifierId} is not available for the selected size`,
            );
          }
        }
        const adj =
          sizePricesMap.get(modInput.modifierId) ?? modifier.priceAdjustment;
        modifierTotal += adj;
        modifiers.push({
          modifierId: modInput.modifierId,
          priceAdjustment: adj,
        });
      }
    }

    const subtotal =
      Math.round((unitPrice + modifierTotal) * input.quantity * 100) / 100;

    return { unitPrice, subtotal, modifiers };
  }
}
