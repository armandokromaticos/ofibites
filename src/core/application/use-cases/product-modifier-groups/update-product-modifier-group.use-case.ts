import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import type { IProductModifierGroupRepository } from "../../../domain/repositories/product-modifier-group.repository.interface";
import { PRODUCT_MODIFIER_GROUP_REPOSITORY } from "../../../domain/repositories/product-modifier-group.repository.interface";
import { UpdateProductModifierGroupDto } from "../../dto/product-modifier-groups/update-product-modifier-group.dto";
import { ProductModifierGroupEntity } from "../../../domain/entities/product-modifier-group.entity";

@Injectable()
export class UpdateProductModifierGroupUseCase {
  constructor(
    @Inject(PRODUCT_MODIFIER_GROUP_REPOSITORY)
    private readonly repository: IProductModifierGroupRepository,
  ) {}

  async execute(
    id: string,
    dto: UpdateProductModifierGroupDto,
  ): Promise<ProductModifierGroupEntity> {
    const hasUpdates = Object.values(dto).some((value) => value !== undefined);
    if (!hasUpdates) {
      throw new BadRequestException("No fields provided for update");
    }
    const existing = await this.repository.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Modifier group with id "${id}" not found`);
    }
    const minSelect = dto.minSelect ?? existing.minSelect;
    const maxSelect = dto.maxSelect ?? existing.maxSelect;
    if (minSelect > maxSelect) {
      throw new BadRequestException(
        "minSelect must be less than or equal to maxSelect",
      );
    }

    const data: Prisma.ProductModifierGroupUpdateInput = {};
    if (dto.nameEs !== undefined) data.nameEs = dto.nameEs;
    if (dto.nameEn !== undefined) data.nameEn = dto.nameEn;
    if (dto.descriptionEs !== undefined) data.descriptionEs = dto.descriptionEs;
    if (dto.descriptionEn !== undefined) data.descriptionEn = dto.descriptionEn;
    if (dto.minSelect !== undefined) data.minSelect = dto.minSelect;
    if (dto.maxSelect !== undefined) data.maxSelect = dto.maxSelect;
    if (dto.sortOrder !== undefined) data.sortOrder = dto.sortOrder;

    return this.repository.update({ where: { id }, data });
  }
}
