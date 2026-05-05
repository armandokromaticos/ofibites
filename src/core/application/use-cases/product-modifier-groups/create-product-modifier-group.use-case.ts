import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { IProductModifierGroupRepository } from "../../../domain/repositories/product-modifier-group.repository.interface";
import { PRODUCT_MODIFIER_GROUP_REPOSITORY } from "../../../domain/repositories/product-modifier-group.repository.interface";
import type { IProductRepository } from "../../../domain/repositories/product.repository.interface";
import { PRODUCT_REPOSITORY } from "../../../domain/repositories/product.repository.interface";
import { CreateProductModifierGroupDto } from "../../dto/product-modifier-groups/create-product-modifier-group.dto";
import { ProductModifierGroupEntity } from "../../../domain/entities/product-modifier-group.entity";

@Injectable()
export class CreateProductModifierGroupUseCase {
  constructor(
    @Inject(PRODUCT_MODIFIER_GROUP_REPOSITORY)
    private readonly repository: IProductModifierGroupRepository,
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(
    productId: string,
    dto: CreateProductModifierGroupDto,
  ): Promise<ProductModifierGroupEntity> {
    const product = await this.productRepository.findUnique({
      where: { id: productId },
    });
    if (!product) {
      throw new NotFoundException(`Product with id "${productId}" not found`);
    }
    const entity = ProductModifierGroupEntity.fromCreateDto(productId, dto);
    return this.repository.create(entity);
  }
}
