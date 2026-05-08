import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import type { IProductRepository } from "../../../domain/repositories/product.repository.interface";
import { PRODUCT_REPOSITORY } from "../../../domain/repositories/product.repository.interface";
import { ProductEntity } from "../../../domain/entities/product.entity";

@Injectable()
export class AssignTagsToProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(productId: string, tagIds: string[]): Promise<ProductEntity> {
    const existing = await this.productRepository.findUnique({
      where: { id: productId },
    });
    if (!existing) {
      throw new NotFoundException(`Product with id ${productId} not found`);
    }
    try {
      return await this.productRepository.assignTags(productId, tagIds);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2003"
      ) {
        throw new BadRequestException("One or more tag IDs are invalid");
      }
      throw error;
    }
  }
}
