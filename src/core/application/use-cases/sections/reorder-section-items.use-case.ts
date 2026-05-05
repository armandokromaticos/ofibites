import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { ISectionRepository } from "../../../domain/repositories/section.repository.interface";
import { SECTION_REPOSITORY } from "../../../domain/repositories/section.repository.interface";
import { ReorderSectionItemsDto } from "../../dto/sections/reorder-section-items.dto";
import { SectionEntity } from "../../../domain/entities/section.entity";

@Injectable()
export class ReorderSectionItemsUseCase {
  constructor(
    @Inject(SECTION_REPOSITORY)
    private readonly sectionRepository: ISectionRepository,
  ) {}

  async execute(
    sectionId: string,
    dto: ReorderSectionItemsDto,
  ): Promise<SectionEntity> {
    const existing = await this.sectionRepository.findUnique({
      where: { id: sectionId },
    });
    if (!existing) {
      throw new NotFoundException(`Section with id ${sectionId} not found`);
    }
    try {
      return await this.sectionRepository.reorderItems(sectionId, dto.items);
    } catch (error) {
      if (error instanceof Error && error.message.includes("do not belong")) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }
}
