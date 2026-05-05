import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { IProductSizeRepository } from "../../../domain/repositories/product-size.repository.interface";
import { PRODUCT_SIZE_REPOSITORY } from "../../../domain/repositories/product-size.repository.interface";
import type { IProductRepository } from "../../../domain/repositories/product.repository.interface";
import { PRODUCT_REPOSITORY } from "../../../domain/repositories/product.repository.interface";
import { recalculateProductStock } from "./recalculate-product-stock";

@Injectable()
export class DeleteProductSizeUseCase {
  constructor(
    @Inject(PRODUCT_SIZE_REPOSITORY)
    private readonly productSizeRepository: IProductSizeRepository,
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const existing = await this.productSizeRepository.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException(`Product size with id "${id}" not found`);
    }

    await this.productSizeRepository.delete(id);
    await recalculateProductStock(
      existing.productId,
      this.productSizeRepository,
      this.productRepository,
    );
  }
}
