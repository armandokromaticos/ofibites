import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { randomUUID } from "crypto";
import { extname } from "node:path";
import type { IMoodGalleryRepository } from "../../../domain/repositories/mood-gallery.repository.interface";
import { MOOD_GALLERY_REPOSITORY } from "../../../domain/repositories/mood-gallery.repository.interface";
import { SupabaseService } from "../../../infrastructure/supabase/supabase.service";
import { MoodGalleryEntity } from "../../../domain/entities/mood-gallery.entity";

const BUCKET = "mood-gallery-images";

export interface UploadFileInput {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
}

@Injectable()
export class UploadMoodGalleryImageUseCase {
  private readonly logger = new Logger(UploadMoodGalleryImageUseCase.name);

  constructor(
    @Inject(MOOD_GALLERY_REPOSITORY)
    private readonly moodGalleryRepository: IMoodGalleryRepository,
    private readonly supabaseService: SupabaseService,
  ) {}

  async execute(
    moodGalleryId: string,
    field: "imageUrl" | "imageMobileUrl",
    file: UploadFileInput,
  ): Promise<MoodGalleryEntity> {
    const existing = await this.moodGalleryRepository.findUnique({
      where: { id: moodGalleryId },
    });
    if (!existing) {
      throw new NotFoundException(
        `MoodGallery with id ${moodGalleryId} not found`,
      );
    }

    const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type: ${file.mimetype}. Allowed: ${allowedMimeTypes.join(", ")}`,
      );
    }

    const extFromName = extname(file.originalname || "")
      .replace(".", "")
      .toLowerCase();
    const extFromMime =
      file.mimetype === "image/png"
        ? "png"
        : file.mimetype === "image/webp"
          ? "webp"
          : "jpg";
    const nameAllowed = ["jpg", "jpeg", "png", "webp"].includes(extFromName);
    const mimeAligned =
      extFromName === extFromMime ||
      (extFromMime === "jpg" && extFromName === "jpeg");
    const ext = nameAllowed && mimeAligned ? extFromName : extFromMime;
    const filePath = `${moodGalleryId}/${randomUUID()}.${ext}`;

    const oldUrl =
      field === "imageUrl" ? existing.imageUrl : existing.imageMobileUrl;

    // Upload new file first to avoid leaving DB pointing to a deleted file
    const publicUrl = await this.supabaseService.uploadFile(
      BUCKET,
      filePath,
      file.buffer,
      file.mimetype,
    );

    if (!publicUrl) {
      throw new BadRequestException(
        `Upload succeeded but no public URL was returned for mood-gallery ${moodGalleryId}`,
      );
    }

    try {
      const updated = await this.moodGalleryRepository.update({
        where: { id: moodGalleryId },
        data: { [field]: publicUrl },
      });

      // Best-effort cleanup of old file after successful update
      if (oldUrl) {
        try {
          const pathFromUrl = oldUrl.split("/").slice(-2).join("/");
          if (pathFromUrl.startsWith(`${moodGalleryId}/`)) {
            await this.supabaseService.deleteFile(BUCKET, pathFromUrl);
          }
        } catch (error) {
          this.logger.warn(
            `Failed to delete old ${field} for mood-gallery ${moodGalleryId}: ${error}`,
          );
        }
      }

      return updated;
    } catch (error) {
      // Rollback: delete the newly uploaded file if DB update failed
      try {
        await this.supabaseService.deleteFile(BUCKET, filePath);
      } catch (rollbackError) {
        this.logger.warn(
          `Failed to rollback uploaded file ${filePath} for mood-gallery ${moodGalleryId}: ${rollbackError}`,
        );
      }
      throw error;
    }
  }
}
