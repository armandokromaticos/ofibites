import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { ISectionRepository } from "../../../domain/repositories/section.repository.interface";
import { SECTION_REPOSITORY } from "../../../domain/repositories/section.repository.interface";

@Injectable()
export class RemoveItemFromSectionUseCase {
  constructor(
    @Inject(SECTION_REPOSITORY)
    private readonly sectionRepository: ISectionRepository,
  ) {}

  async execute(sectionId: string, itemId: string): Promise<void> {
    const existing = await this.sectionRepository.findUnique({
      where: { id: sectionId },
    });
    if (!existing) {
      throw new NotFoundException(`Section with id ${sectionId} not found`);
    }
    const deleted = await this.sectionRepository.removeItem(sectionId, itemId);
    if (deleted === 0) {
      throw new NotFoundException(
        `Item ${itemId} not found in section ${sectionId}`,
      );
    }
  }
}
