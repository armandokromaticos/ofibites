import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import type { ISectionRepository } from "../../../domain/repositories/section.repository.interface";
import {
  SECTION_FULL_INCLUDE,
  SECTION_REPOSITORY,
} from "../../../domain/repositories/section.repository.interface";
import { UpdateSectionDto } from "../../dto/sections/update-section.dto";
import { SectionEntity } from "../../../domain/entities/section.entity";

@Injectable()
export class UpdateSectionUseCase {
  constructor(
    @Inject(SECTION_REPOSITORY)
    private readonly sectionRepository: ISectionRepository,
  ) {}

  async execute(id: string, dto: UpdateSectionDto): Promise<SectionEntity> {
    const hasUpdates = Object.values(dto).some((value) => value !== undefined);
    if (!hasUpdates) {
      throw new BadRequestException("No fields provided for update");
    }
    const existing = await this.sectionRepository.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Section with id ${id} not found`);
    }

    const data: Prisma.SectionUpdateInput = {};
    if (dto.nameEs !== undefined) data.nameEs = dto.nameEs;
    if (dto.nameEn !== undefined) data.nameEn = dto.nameEn;
    if (dto.slug !== undefined) data.slug = dto.slug.trim().toLowerCase();
    if (dto.order !== undefined) data.order = dto.order;
    if (dto.isActive !== undefined) data.isActive = dto.isActive;

    return this.sectionRepository.update({
      where: { id },
      data,
      include: SECTION_FULL_INCLUDE,
    });
  }
}
