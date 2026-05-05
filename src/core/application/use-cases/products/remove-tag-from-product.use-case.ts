import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import type { IProductRepository } from "../../../domain/repositories/product.repository.interface";
import { PRODUCT_REPOSITORY } from "../../../domain/repositories/product.repository.interface";

@Injectable()
export class RemoveTagFromProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(productId: string, tagId: string): Promise<void> {
    const existing = await this.productRepository.findUnique({
      where: { id: productId },
    });
    if (!existing) {
      throw new NotFoundException(`Product with id ${productId} not found`);
    }
    try {
      await this.productRepository.removeTag(productId, tagId);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        throw new NotFoundException(
          `Tag ${tagId} is not assigned to product ${productId}`,
        );
      }
      throw error;
    }
  }
}
