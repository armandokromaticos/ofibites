import { Prisma } from "@prisma/client";
import { ProductEntity } from "../entities/product.entity";

export const PRODUCT_REPOSITORY = Symbol("PRODUCT_REPOSITORY");

export const PRODUCT_FULL_INCLUDE = {
  sizes: true,
  modifierGroups: {
    include: {
      modifiers: {
        include: {
          tags: { include: { tag: true } },
          sizePrices: true,
        },
      },
    },
  },
  tags: { include: { tag: true } },
} as const satisfies Prisma.ProductInclude;

export interface IProductRepository {
  create(entity: ProductEntity): Promise<ProductEntity>;
  findUnique(args: Prisma.ProductFindUniqueArgs): Promise<ProductEntity | null>;
  findMany(
    args?: Prisma.ProductFindManyArgs,
  ): Promise<{ data: ProductEntity[]; total?: number }>;
  update(args: Prisma.ProductUpdateArgs): Promise<ProductEntity>;
  delete(id: string): Promise<void>;
  exists(args: Prisma.ProductCountArgs): Promise<boolean>;

  // Helpers de dominio
  assignTags(productId: string, tagIds: string[]): Promise<ProductEntity>;
  removeTag(productId: string, tagId: string): Promise<void>;
}
