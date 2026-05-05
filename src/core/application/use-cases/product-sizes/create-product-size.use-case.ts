import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { IProductSizeRepository } from "../../../domain/repositories/product-size.repository.interface";
import { PRODUCT_SIZE_REPOSITORY } from "../../../domain/repositories/product-size.repository.interface";
import type { IProductRepository } from "../../../domain/repositories/product.repository.interface";
import { PRODUCT_REPOSITORY } from "../../../domain/repositories/product.repository.interface";
import { CreateProductSizeDto } from "../../dto/product-sizes/create-product-size.dto";
import { ProductSizeEntity } from "../../../domain/entities/product-size.entity";
import { recalculateProductStock } from "./recalculate-product-stock";

@Injectable()
export class CreateProductSizeUseCase {
  constructor(
    @Inject(PRODUCT_SIZE_REPOSITORY)
    private readonly productSizeRepository: IProductSizeRepository,
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(
    productId: string,
    dto: CreateProductSizeDto,
  ): Promise<ProductSizeEntity> {
    const product = await this.productRepository.findUnique({
      where: { id: productId },
    });
    if (!product) {
      throw new NotFoundException(`Product with id "${productId}" not found`);
    }
    const entity = ProductSizeEntity.fromCreateDto(productId, dto);
    const created = await this.productSizeRepository.create(entity);

    await recalculateProductStock(
      productId,
      this.productSizeRepository,
      this.productRepository,
    );

    return created;
  }
}
