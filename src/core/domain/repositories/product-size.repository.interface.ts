import { Prisma } from "@prisma/client";
import { ProductSizeEntity } from "../entities/product-size.entity";

export const PRODUCT_SIZE_REPOSITORY = Symbol("PRODUCT_SIZE_REPOSITORY");

export interface IProductSizeRepository {
  create(entity: ProductSizeEntity): Promise<ProductSizeEntity>;
  findUnique(
    args: Prisma.ProductSizeFindUniqueArgs,
  ): Promise<ProductSizeEntity | null>;
  findMany(
    args?: Prisma.ProductSizeFindManyArgs,
  ): Promise<{ data: ProductSizeEntity[]; total?: number }>;
  update(args: Prisma.ProductSizeUpdateArgs): Promise<ProductSizeEntity>;
  delete(id: string): Promise<void>;
  exists(args: Prisma.ProductSizeCountArgs): Promise<boolean>;
}
