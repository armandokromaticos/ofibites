import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { ISectionRepository } from "../../../domain/repositories/section.repository.interface";
import {
  SECTION_FULL_INCLUDE,
  SECTION_REPOSITORY,
} from "../../../domain/repositories/section.repository.interface";
import { SectionEntity } from "../../../domain/entities/section.entity";

@Injectable()
export class GetSectionBySlugUseCase {
  constructor(
    @Inject(SECTION_REPOSITORY)
    private readonly sectionRepository: ISectionRepository,
  ) {}

  async execute(slug: string): Promise<SectionEntity> {
    const normalizedSlug = slug.trim().toLowerCase();
    const section = await this.sectionRepository.findUnique({
      where: { slug: normalizedSlug },
      include: SECTION_FULL_INCLUDE,
    });
    if (!section) {
      throw new NotFoundException(
        `Section with slug "${normalizedSlug}" not found`,
      );
    }
    return section;
  }
}
