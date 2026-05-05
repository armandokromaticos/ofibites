import { Inject, Injectable } from "@nestjs/common";
import type { IProductRepository } from "../../../domain/repositories/product.repository.interface";
import {
  PRODUCT_FULL_INCLUDE,
  PRODUCT_REPOSITORY,
} from "../../../domain/repositories/product.repository.interface";
import { ProductEntity } from "../../../domain/entities/product.entity";

@Injectable()
export class GetProductsUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(tagId?: string): Promise<ProductEntity[]> {
    const where = tagId ? { tags: { some: { tagId } } } : undefined;
    const { data } = await this.productRepository.findMany({
      where,
      include: PRODUCT_FULL_INCLUDE,
    });
    return data;
  }
}
