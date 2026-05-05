import { Prisma } from "@prisma/client";
import { ProductModifierGroupEntity } from "../entities/product-modifier-group.entity";

export const PRODUCT_MODIFIER_GROUP_REPOSITORY = Symbol(
  "PRODUCT_MODIFIER_GROUP_REPOSITORY",
);

export interface IProductModifierGroupRepository {
  create(
    entity: ProductModifierGroupEntity,
  ): Promise<ProductModifierGroupEntity>;
  findUnique(
    args: Prisma.ProductModifierGroupFindUniqueArgs,
  ): Promise<ProductModifierGroupEntity | null>;
  findMany(
    args?: Prisma.ProductModifierGroupFindManyArgs,
  ): Promise<{ data: ProductModifierGroupEntity[]; total?: number }>;
  update(
    args: Prisma.ProductModifierGroupUpdateArgs,
  ): Promise<ProductModifierGroupEntity>;
  delete(id: string): Promise<void>;
  exists(args: Prisma.ProductModifierGroupCountArgs): Promise<boolean>;
}
