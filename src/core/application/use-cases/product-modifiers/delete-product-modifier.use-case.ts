import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { IProductModifierRepository } from "../../../domain/repositories/product-modifier.repository.interface";
import { PRODUCT_MODIFIER_REPOSITORY } from "../../../domain/repositories/product-modifier.repository.interface";
import type { IProductModifierGroupRepository } from "../../../domain/repositories/product-modifier-group.repository.interface";
import { PRODUCT_MODIFIER_GROUP_REPOSITORY } from "../../../domain/repositories/product-modifier-group.repository.interface";

@Injectable()
export class DeleteProductModifierUseCase {
  constructor(
    @Inject(PRODUCT_MODIFIER_REPOSITORY)
    private readonly modifierRepository: IProductModifierRepository,
    @Inject(PRODUCT_MODIFIER_GROUP_REPOSITORY)
    private readonly groupRepository: IProductModifierGroupRepository,
  ) {}

  async execute(
    productId: string,
    groupId: string,
    modifierId: string,
  ): Promise<void> {
    const group = await this.groupRepository.findUnique({
      where: { id: groupId },
    });
    if (!group || group.productId !== productId) {
      throw new NotFoundException(
        `Modifier group with id ${groupId} not found for product ${productId}`,
      );
    }

    const modifier = await this.modifierRepository.findUnique({
      where: { id: modifierId },
    });
    if (!modifier || modifier.groupId !== groupId) {
      throw new NotFoundException(
        `Modifier with id ${modifierId} not found in group ${groupId}`,
      );
    }

    try {
      await this.modifierRepository.delete(modifierId);
    } catch (error: unknown) {
      if (
        error instanceof Object &&
        "code" in error &&
        error.code === "P2003"
      ) {
        throw new ConflictException(
          `Modifier with id ${modifierId} cannot be deleted because it is being used in orders`,
        );
      }
      throw error;
    }
  }
}
