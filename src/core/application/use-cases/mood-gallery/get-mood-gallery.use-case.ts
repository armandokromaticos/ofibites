import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { IMoodGalleryRepository } from "../../../domain/repositories/mood-gallery.repository.interface";
import { MOOD_GALLERY_REPOSITORY } from "../../../domain/repositories/mood-gallery.repository.interface";
import { MoodGalleryEntity } from "../../../domain/entities/mood-gallery.entity";

@Injectable()
export class GetMoodGalleryUseCase {
  constructor(
    @Inject(MOOD_GALLERY_REPOSITORY)
    private readonly moodGalleryRepository: IMoodGalleryRepository,
  ) {}

  async execute(id: string): Promise<MoodGalleryEntity> {
    const item = await this.moodGalleryRepository.findUnique({
      where: { id },
    });
    if (!item) {
      throw new NotFoundException(`MoodGallery with id ${id} not found`);
    }
    return item;
  }
}
