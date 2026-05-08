import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { IProductModifierGroupRepository } from "../../../domain/repositories/product-modifier-group.repository.interface";
import { PRODUCT_MODIFIER_GROUP_REPOSITORY } from "../../../domain/repositories/product-modifier-group.repository.interface";
import type { IProductRepository } from "../../../domain/repositories/product.repository.interface";
import { PRODUCT_REPOSITORY } from "../../../domain/repositories/product.repository.interface";

@Injectable()
export class DeleteProductModifierGroupUseCase {
  constructor(
    @Inject(PRODUCT_MODIFIER_GROUP_REPOSITORY)
    private readonly groupRepository: IProductModifierGroupRepository,
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(productId: string, groupId: string): Promise<void> {
    const product = await this.productRepository.findUnique({
      where: { id: productId },
    });
    if (!product) {
      throw new NotFoundException(`Product with id ${productId} not found`);
    }

    const group = await this.groupRepository.findUnique({
      where: { id: groupId },
    });
    if (!group || group.productId !== productId) {
      throw new NotFoundException(
        `Modifier group with id ${groupId} not found for product ${productId}`,
      );
    }

    try {
      await this.groupRepository.delete(groupId);
    } catch (error: unknown) {
      if (
        error instanceof Object &&
        "code" in error &&
        error.code === "P2003"
      ) {
        throw new ConflictException(
          `Modifier group with id ${groupId} cannot be deleted because it has modifiers being used in orders`,
        );
      }
      throw error;
    }
  }
}
