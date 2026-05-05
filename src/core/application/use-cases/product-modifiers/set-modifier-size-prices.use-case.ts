import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { IProductModifierRepository } from "../../../domain/repositories/product-modifier.repository.interface";
import { PRODUCT_MODIFIER_REPOSITORY } from "../../../domain/repositories/product-modifier.repository.interface";
import type { IProductModifierGroupRepository } from "../../../domain/repositories/product-modifier-group.repository.interface";
import { PRODUCT_MODIFIER_GROUP_REPOSITORY } from "../../../domain/repositories/product-modifier-group.repository.interface";
import type { IProductSizeRepository } from "../../../domain/repositories/product-size.repository.interface";
import { PRODUCT_SIZE_REPOSITORY } from "../../../domain/repositories/product-size.repository.interface";
import { SetModifierSizePricesDto } from "../../dto/product-modifiers/set-modifier-size-prices.dto";

@Injectable()
export class SetModifierSizePricesUseCase {
  constructor(
    @Inject(PRODUCT_MODIFIER_REPOSITORY)
    private readonly modifierRepository: IProductModifierRepository,
    @Inject(PRODUCT_MODIFIER_GROUP_REPOSITORY)
    private readonly groupRepository: IProductModifierGroupRepository,
    @Inject(PRODUCT_SIZE_REPOSITORY)
    private readonly sizeRepository: IProductSizeRepository,
  ) {}

  async execute(
    productId: string,
    groupId: string,
    modifierId: string,
    dto: SetModifierSizePricesDto,
  ): Promise<void> {
    const group = await this.groupRepository.findUnique({
      where: { id: groupId },
    });
    if (!group || group.productId !== productId) {
      throw new NotFoundException(
        `Modifier group with id ${groupId} not found for product ${productId}`,
      );
    }

    const modifier = await this.modifierRepository.findUnique({
      where: { id: modifierId },
    });
    if (!modifier || modifier.groupId !== groupId) {
      throw new NotFoundException(
        `Modifier with id ${modifierId} not found in group ${groupId}`,
      );
    }

    // Validate no duplicate productSizeIds
    const sizeIdCounts = new Map<string, number>();
    for (const entry of dto.sizePrices) {
      sizeIdCounts.set(
        entry.productSizeId,
        (sizeIdCounts.get(entry.productSizeId) ?? 0) + 1,
      );
    }
    const duplicates = [...sizeIdCounts.entries()]
      .filter(([, count]) => count > 1)
      .map(([id]) => id);
    if (duplicates.length > 0) {
      throw new BadRequestException(
        `Duplicate productSizeId(s): ${duplicates.join(", ")}`,
      );
    }

    // Validate all size IDs belong to the same product
    const { data: productSizes } = await this.sizeRepository.findMany({
      where: { productId },
    });
    const validSizeIds = new Set(productSizes.map((s) => s.id));

    for (const entry of dto.sizePrices) {
      if (!validSizeIds.has(entry.productSizeId)) {
        throw new BadRequestException(
          `ProductSize ${entry.productSizeId} does not belong to product ${productId}`,
        );
      }
    }

    await this.modifierRepository.setSizePrices(
      modifierId,
      dto.sizePrices.map((sizePrice) => ({
        productSizeId: sizePrice.productSizeId,
        priceAdjustment: sizePrice.priceAdjustment,
      })),
    );
  }
}
