import { Inject, Injectable, Logger, NotFoundException } from "@nestjs/common";
import type { IMoodGalleryRepository } from "../../../domain/repositories/mood-gallery.repository.interface";
import { MOOD_GALLERY_REPOSITORY } from "../../../domain/repositories/mood-gallery.repository.interface";
import { DeleteMoodGalleryImageUseCase } from "./delete-mood-gallery-image.use-case";

@Injectable()
export class DeleteMoodGalleryUseCase {
  private readonly logger = new Logger(DeleteMoodGalleryUseCase.name);

  constructor(
    @Inject(MOOD_GALLERY_REPOSITORY)
    private readonly moodGalleryRepository: IMoodGalleryRepository,
    private readonly deleteMoodGalleryImageUseCase: DeleteMoodGalleryImageUseCase,
  ) {}

  async execute(id: string): Promise<void> {
    const item = await this.moodGalleryRepository.findUnique({
      where: { id },
    });
    if (!item) {
      throw new NotFoundException(`MoodGallery with id ${id} not found`);
    }

    const { imageUrl, imageMobileUrl } = item;

    // DB-first: delete the row so it's no longer accessible
    await this.moodGalleryRepository.delete(id);

    // Best-effort storage cleanup
    const urls = [imageUrl, imageMobileUrl].filter(Boolean) as string[];
    await Promise.allSettled(
      urls.map((url) =>
        this.deleteMoodGalleryImageUseCase.deleteFromStorage(url, id),
      ),
    );
  }
}
