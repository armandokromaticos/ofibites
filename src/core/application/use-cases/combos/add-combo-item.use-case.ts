import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { IComboRepository } from "../../../domain/repositories/combo.repository.interface";
import { COMBO_REPOSITORY } from "../../../domain/repositories/combo.repository.interface";
import type { IProductRepository } from "../../../domain/repositories/product.repository.interface";
import { PRODUCT_REPOSITORY } from "../../../domain/repositories/product.repository.interface";
import { AddComboItemDto } from "../../dto/combos/add-combo-item.dto";
import { ComboEntity } from "../../../domain/entities/combo.entity";

@Injectable()
export class AddComboItemUseCase {
  constructor(
    @Inject(COMBO_REPOSITORY)
    private readonly comboRepository: IComboRepository,
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(comboId: string, dto: AddComboItemDto): Promise<ComboEntity> {
    const combo = await this.comboRepository.findUnique({
      where: { id: comboId },
      include: { items: true },
    });
    if (!combo) {
      throw new NotFoundException(`Combo with id ${comboId} not found`);
    }

    const product = await this.productRepository.findUnique({
      where: { id: dto.productId },
    });
    if (!product) {
      throw new NotFoundException(`Product with id ${dto.productId} not found`);
    }

    const alreadyExists = combo.items?.some(
      (item) => item.productId === dto.productId,
    );
    if (alreadyExists) {
      throw new ConflictException(
        `Product ${dto.productId} already exists in combo ${comboId}`,
      );
    }

    return this.comboRepository.addItem(
      comboId,
      dto.productId,
      dto.quantity ?? 1,
      dto.sortOrder ?? 0,
    );
  }
}
