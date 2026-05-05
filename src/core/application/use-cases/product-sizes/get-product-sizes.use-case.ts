import { Inject, Injectable } from "@nestjs/common";
import type { IProductSizeRepository } from "../../../domain/repositories/product-size.repository.interface";
import { PRODUCT_SIZE_REPOSITORY } from "../../../domain/repositories/product-size.repository.interface";
import { ProductSizeEntity } from "../../../domain/entities/product-size.entity";

@Injectable()
export class GetProductSizesUseCase {
  constructor(
    @Inject(PRODUCT_SIZE_REPOSITORY)
    private readonly productSizeRepository: IProductSizeRepository,
  ) {}

  async execute(productId: string): Promise<ProductSizeEntity[]> {
    const { data } = await this.productSizeRepository.findMany({
      where: { productId },
      orderBy: { sortOrder: "asc" },
    });
    return data;
  }
}
