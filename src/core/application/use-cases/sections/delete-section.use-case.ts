import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { ISectionRepository } from "../../../domain/repositories/section.repository.interface";
import { SECTION_REPOSITORY } from "../../../domain/repositories/section.repository.interface";

@Injectable()
export class DeleteSectionUseCase {
  constructor(
    @Inject(SECTION_REPOSITORY)
    private readonly sectionRepository: ISectionRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const existing = await this.sectionRepository.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Section with id ${id} not found`);
    }
    await this.sectionRepository.delete(id);
  }
}
