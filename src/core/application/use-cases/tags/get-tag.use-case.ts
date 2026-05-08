import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { ITagRepository } from "../../../domain/repositories/tag.repository.interface";
import { TAG_REPOSITORY } from "../../../domain/repositories/tag.repository.interface";
import { TagEntity } from "../../../domain/entities/tag.entity";

@Injectable()
export class GetTagUseCase {
  constructor(
    @Inject(TAG_REPOSITORY)
    private readonly tagRepository: ITagRepository,
  ) {}

  async execute(id: string): Promise<TagEntity> {
    const tag = await this.tagRepository.findUnique({ where: { id } });
    if (!tag) {
      throw new NotFoundException(`Tag with id ${id} not found`);
    }
    return tag;
  }
}
