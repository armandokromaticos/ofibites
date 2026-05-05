import { Inject, Injectable } from "@nestjs/common";
import type { IProductModifierGroupRepository } from "../../../domain/repositories/product-modifier-group.repository.interface";
import { PRODUCT_MODIFIER_GROUP_REPOSITORY } from "../../../domain/repositories/product-modifier-group.repository.interface";
import { ProductModifierGroupEntity } from "../../../domain/entities/product-modifier-group.entity";

@Injectable()
export class GetProductModifierGroupsUseCase {
  constructor(
    @Inject(PRODUCT_MODIFIER_GROUP_REPOSITORY)
    private readonly repository: IProductModifierGroupRepository,
  ) {}

  async execute(productId: string): Promise<ProductModifierGroupEntity[]> {
    const { data } = await this.repository.findMany({
      where: { productId },
      orderBy: { sortOrder: "asc" },
    });
    return data;
  }
}
