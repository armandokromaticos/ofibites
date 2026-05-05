import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import type { IMoodGalleryRepository } from "../../../domain/repositories/mood-gallery.repository.interface";
import { MOOD_GALLERY_REPOSITORY } from "../../../domain/repositories/mood-gallery.repository.interface";
import { SupabaseService } from "../../../infrastructure/supabase/supabase.service";
import { MoodGalleryEntity } from "../../../domain/entities/mood-gallery.entity";

const BUCKET = "mood-gallery-images";

@Injectable()
export class DeleteMoodGalleryImageUseCase {
  private readonly logger = new Logger(DeleteMoodGalleryImageUseCase.name);

  constructor(
    @Inject(MOOD_GALLERY_REPOSITORY)
    private readonly moodGalleryRepository: IMoodGalleryRepository,
    private readonly supabaseService: SupabaseService,
  ) {}

  async execute(
    moodGalleryId: string,
    field: "imageUrl" | "imageMobileUrl",
  ): Promise<MoodGalleryEntity> {
    const existing = await this.moodGalleryRepository.findUnique({
      where: { id: moodGalleryId },
    });
    if (!existing) {
      throw new NotFoundException(
        `MoodGallery with id ${moodGalleryId} not found`,
      );
    }

    const currentUrl =
      field === "imageUrl" ? existing.imageUrl : existing.imageMobileUrl;

    if (!currentUrl) {
      throw new BadRequestException(
        `MoodGallery does not have a ${field} to delete`,
      );
    }

    // DB-first: clear the field so the record no longer references the file
    const updated = await this.moodGalleryRepository.update({
      where: { id: moodGalleryId },
      data: { [field]: null },
    });

    // Best-effort storage cleanup
    try {
      const pathFromUrl = currentUrl.split("/").slice(-2).join("/");
      if (!pathFromUrl.startsWith(`${moodGalleryId}/`)) {
        this.logger.warn(
          `Refusing to delete ${field} for mood-gallery ${moodGalleryId}: path "${pathFromUrl}" does not belong to this entry`,
        );
      } else {
        await this.supabaseService.deleteFile(BUCKET, pathFromUrl);
      }
    } catch (error) {
      this.logger.warn(
        `Failed to delete ${field} from storage for mood-gallery ${moodGalleryId}: ${error}`,
      );
    }

    return updated;
  }

  /**
   * Storage-only cleanup — does NOT modify the DB record.
   * Used by DeleteMoodGalleryUseCase before deleting the entire row.
   */
  async deleteFromStorage(
    imageUrl: string,
    moodGalleryId: string,
  ): Promise<void> {
    try {
      const pathFromUrl = imageUrl.split("/").slice(-2).join("/");
      if (!pathFromUrl.startsWith(`${moodGalleryId}/`)) {
        this.logger.warn(
          `Refusing to delete image for mood-gallery ${moodGalleryId}: path "${pathFromUrl}" does not belong to this entry`,
        );
        return;
      }
      await this.supabaseService.deleteFile(BUCKET, pathFromUrl);
    } catch (error) {
      this.logger.warn(
        `Failed to delete image from storage for mood-gallery ${moodGalleryId}: ${error}`,
      );
    }
  }
}
