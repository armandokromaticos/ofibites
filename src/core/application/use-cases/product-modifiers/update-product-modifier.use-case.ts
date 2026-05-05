import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import type { IProductModifierRepository } from "../../../domain/repositories/product-modifier.repository.interface";
import {
  PRODUCT_MODIFIER_FULL_INCLUDE,
  PRODUCT_MODIFIER_REPOSITORY,
} from "../../../domain/repositories/product-modifier.repository.interface";
import { UpdateProductModifierDto } from "../../dto/product-modifiers/update-product-modifier.dto";
import { ProductModifierEntity } from "../../../domain/entities/product-modifier.entity";

@Injectable()
export class UpdateProductModifierUseCase {
  constructor(
    @Inject(PRODUCT_MODIFIER_REPOSITORY)
    private readonly repository: IProductModifierRepository,
  ) {}

  async execute(
    id: string,
    dto: UpdateProductModifierDto,
  ): Promise<ProductModifierEntity> {
    const hasUpdates = Object.values(dto).some((value) => value !== undefined);
    if (!hasUpdates) {
      throw new BadRequestException("No fields provided for update");
    }
    const existing = await this.repository.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Modifier with id "${id}" not found`);
    }

    const data: Prisma.ProductModifierUpdateInput = {};
    if (dto.nameEs !== undefined) data.nameEs = dto.nameEs;
    if (dto.nameEn !== undefined) data.nameEn = dto.nameEn;
    if (dto.priceAdjustment !== undefined) {
      data.priceAdjustment = new Prisma.Decimal(dto.priceAdjustment);
    }
    if (dto.isDefault !== undefined) data.isDefault = dto.isDefault;
    if (dto.isActive !== undefined) data.isActive = dto.isActive;
    if (dto.sizeRestricted !== undefined) {
      data.sizeRestricted = dto.sizeRestricted;
    }
    if (dto.sortOrder !== undefined) data.sortOrder = dto.sortOrder;

    return this.repository.update({
      where: { id },
      data,
      include: PRODUCT_MODIFIER_FULL_INCLUDE,
    });
  }
}
