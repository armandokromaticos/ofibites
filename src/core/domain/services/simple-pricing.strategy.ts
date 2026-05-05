import { Inject, Injectable } from "@nestjs/common";
import { Money } from "../value-objects/money.vo";
import {
  PricingContext,
  PricingStrategy,
} from "../interfaces/pricing-strategy.interface";
import { PRODUCT_REPOSITORY } from "../repositories/product.repository.interface";
import type { IProductRepository } from "../repositories/product.repository.interface";
import { EntityNotFoundException } from "../exceptions";

/**
 * Simple pricing strategy that returns the base price of the product.
 * Size and modifier pricing will be handled at order calculation time.
 */
@Injectable()
export class SimplePricingStrategy implements PricingStrategy {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}

  async getProductPrice(
    productId: string,
    context: PricingContext,
  ): Promise<Money> {
    void context; // Reserved for future use (size/modifier pricing)

    const product = await this.productRepository.findUnique({
      where: { id: productId },
    });
    if (!product) {
      throw new EntityNotFoundException("Product", productId);
    }

    return Money.create(product.basePrice);
  }
}
