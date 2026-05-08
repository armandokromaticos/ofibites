import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { ITagRepository } from "../../../domain/repositories/tag.repository.interface";
import { TAG_REPOSITORY } from "../../../domain/repositories/tag.repository.interface";

@Injectable()
export class DeleteTagUseCase {
  constructor(
    @Inject(TAG_REPOSITORY)
    private readonly tagRepository: ITagRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const existing = await this.tagRepository.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Tag with id ${id} not found`);
    }
    await this.tagRepository.delete(id);
  }
}
