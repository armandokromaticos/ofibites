import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { IProductModifierRepository } from "../../../domain/repositories/product-modifier.repository.interface";
import { PRODUCT_MODIFIER_REPOSITORY } from "../../../domain/repositories/product-modifier.repository.interface";
import type { IProductModifierGroupRepository } from "../../../domain/repositories/product-modifier-group.repository.interface";
import { PRODUCT_MODIFIER_GROUP_REPOSITORY } from "../../../domain/repositories/product-modifier-group.repository.interface";
import { CreateProductModifierDto } from "../../dto/product-modifiers/create-product-modifier.dto";
import { ProductModifierEntity } from "../../../domain/entities/product-modifier.entity";

@Injectable()
export class CreateProductModifierUseCase {
  constructor(
    @Inject(PRODUCT_MODIFIER_REPOSITORY)
    private readonly repository: IProductModifierRepository,
    @Inject(PRODUCT_MODIFIER_GROUP_REPOSITORY)
    private readonly groupRepository: IProductModifierGroupRepository,
  ) {}

  async execute(
    groupId: string,
    dto: CreateProductModifierDto,
  ): Promise<ProductModifierEntity> {
    const group = await this.groupRepository.findUnique({
      where: { id: groupId },
    });
    if (!group) {
      throw new NotFoundException(
        `Modifier group with id "${groupId}" not found`,
      );
    }
    const entity = ProductModifierEntity.fromCreateDto(groupId, dto);
    return this.repository.create(entity);
  }
}
