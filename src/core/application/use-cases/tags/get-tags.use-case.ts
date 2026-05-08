import { Inject, Injectable } from "@nestjs/common";
import type { ITagRepository } from "../../../domain/repositories/tag.repository.interface";
import { TAG_REPOSITORY } from "../../../domain/repositories/tag.repository.interface";
import { TagEntity } from "../../../domain/entities/tag.entity";

@Injectable()
export class GetTagsUseCase {
  constructor(
    @Inject(TAG_REPOSITORY)
    private readonly tagRepository: ITagRepository,
  ) {}

  async execute(): Promise<TagEntity[]> {
    const { data } = await this.tagRepository.findMany({
      orderBy: { createdAt: "desc" },
    });
    return data;
  }
}
