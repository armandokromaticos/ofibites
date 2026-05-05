import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { randomUUID } from "crypto";
import { extname } from "node:path";
import type { IBannerRepository } from "../../../domain/repositories/banner.repository.interface";
import { BANNER_REPOSITORY } from "../../../domain/repositories/banner.repository.interface";
import { SupabaseService } from "../../../infrastructure/supabase/supabase.service";
import { BannerEntity } from "../../../domain/entities/banner.entity";

const BUCKET = "banner-images";

export interface UploadFileInput {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
}

@Injectable()
export class UploadBannerImageUseCase {
  private readonly logger = new Logger(UploadBannerImageUseCase.name);

  constructor(
    @Inject(BANNER_REPOSITORY)
    private readonly bannerRepository: IBannerRepository,
    private readonly supabaseService: SupabaseService,
  ) {}

  async execute(
    bannerId: string,
    field: "imageUrl" | "imageMobileUrl",
    file: UploadFileInput,
  ): Promise<BannerEntity> {
    const existing = await this.bannerRepository.findUnique({
      where: { id: bannerId },
    });
    if (!existing) {
      throw new NotFoundException(`Banner with id ${bannerId} not found`);
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
    const filePath = `${bannerId}/${randomUUID()}.${ext}`;

    const oldUrl =
      field === "imageUrl" ? existing.imageUrl : existing.imageMobileUrl;
    if (oldUrl) {
      try {
        const pathFromUrl = oldUrl.split("/").slice(-2).join("/");
        await this.supabaseService.deleteFile(BUCKET, pathFromUrl);
      } catch (error) {
        this.logger.warn(
          `Failed to delete old ${field} for banner ${bannerId}: ${error}`,
        );
      }
    }

    const publicUrl = await this.supabaseService.uploadFile(
      BUCKET,
      filePath,
      file.buffer,
      file.mimetype,
    );

    if (!publicUrl) {
      throw new BadRequestException(
        `Upload succeeded but no public URL was returned for banner ${bannerId}`,
      );
    }

    return this.bannerRepository.update({
      where: { id: bannerId },
      data: { [field]: publicUrl },
    });
  }
}
