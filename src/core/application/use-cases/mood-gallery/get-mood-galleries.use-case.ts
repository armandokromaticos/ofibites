import { Inject, Injectable } from "@nestjs/common";
import type { IMoodGalleryRepository } from "../../../domain/repositories/mood-gallery.repository.interface";
import { MOOD_GALLERY_REPOSITORY } from "../../../domain/repositories/mood-gallery.repository.interface";
import { MoodGalleryEntity } from "../../../domain/entities/mood-gallery.entity";

@Injectable()
export class GetMoodGalleriesUseCase {
  constructor(
    @Inject(MOOD_GALLERY_REPOSITORY)
    private readonly moodGalleryRepository: IMoodGalleryRepository,
  ) {}

  async execute(
    section?: string,
    activeOnly?: boolean,
  ): Promise<MoodGalleryEntity[]> {
    if (activeOnly) {
      return this.moodGalleryRepository.findAllActive(section);
    }
    const where = section ? { section } : undefined;
    const { data } = await this.moodGalleryRepository.findMany({
      where,
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    });
    return data;
  }
}
