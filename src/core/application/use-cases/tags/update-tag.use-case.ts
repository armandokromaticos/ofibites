import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import type { ITagRepository } from "../../../domain/repositories/tag.repository.interface";
import { TAG_REPOSITORY } from "../../../domain/repositories/tag.repository.interface";
import { UpdateTagDto } from "../../dto/tags/update-tag.dto";
import { TagEntity } from "../../../domain/entities/tag.entity";

@Injectable()
export class UpdateTagUseCase {
  constructor(
    @Inject(TAG_REPOSITORY)
    private readonly tagRepository: ITagRepository,
  ) {}

  async execute(id: string, dto: UpdateTagDto): Promise<TagEntity> {
    const hasUpdates = Object.values(dto).some((value) => value !== undefined);
    if (!hasUpdates) {
      throw new BadRequestException("No fields provided for update");
    }
    const existing = await this.tagRepository.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Tag with id ${id} not found`);
    }

    const data: Prisma.TagUpdateInput = {};
    if (dto.nameEs !== undefined) data.nameEs = dto.nameEs;
    if (dto.nameEn !== undefined) data.nameEn = dto.nameEn;
    if (dto.isActive !== undefined) data.isActive = dto.isActive;

    return this.tagRepository.update({ where: { id }, data });
  }
}
