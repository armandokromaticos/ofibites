import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { IProductRepository } from "../../../domain/repositories/product.repository.interface";
import {
  PRODUCT_FULL_INCLUDE,
  PRODUCT_REPOSITORY,
} from "../../../domain/repositories/product.repository.interface";
import { ProductEntity } from "../../../domain/entities/product.entity";

@Injectable()
export class GetProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(id: string): Promise<ProductEntity> {
    const product = await this.productRepository.findUnique({
      where: { id },
      include: PRODUCT_FULL_INCLUDE,
    });
    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }
    return product;
  }
}
