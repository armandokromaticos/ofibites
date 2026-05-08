import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import type { IProductModifierRepository } from "../../../domain/repositories/product-modifier.repository.interface";
import { PRODUCT_MODIFIER_REPOSITORY } from "../../../domain/repositories/product-modifier.repository.interface";
import type { IProductModifierGroupRepository } from "../../../domain/repositories/product-modifier-group.repository.interface";
import { PRODUCT_MODIFIER_GROUP_REPOSITORY } from "../../../domain/repositories/product-modifier-group.repository.interface";

@Injectable()
export class AssignTagsToModifierUseCase {
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
    tagIds: string[],
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
      await this.modifierRepository.assignTags(modifierId, tagIds);
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
