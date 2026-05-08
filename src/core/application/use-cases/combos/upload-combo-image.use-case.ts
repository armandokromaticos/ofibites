import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { randomUUID } from "crypto";
import { extname } from "node:path";
import type { IComboRepository } from "../../../domain/repositories/combo.repository.interface";
import {
  COMBO_FULL_INCLUDE,
  COMBO_REPOSITORY,
} from "../../../domain/repositories/combo.repository.interface";
import { SupabaseService } from "../../../infrastructure/supabase/supabase.service";
import { ComboEntity } from "../../../domain/entities/combo.entity";

const BUCKET = "combo-images";

export interface UploadFileInput {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
}

@Injectable()
export class UploadComboImageUseCase {
  private readonly logger = new Logger(UploadComboImageUseCase.name);

  constructor(
    @Inject(COMBO_REPOSITORY)
    private readonly comboRepository: IComboRepository,
    private readonly supabaseService: SupabaseService,
  ) {}

  async execute(comboId: string, file: UploadFileInput): Promise<ComboEntity> {
    const existing = await this.comboRepository.findUnique({
      where: { id: comboId },
    });
    if (!existing) {
      throw new NotFoundException(`Combo with id ${comboId} not found`);
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
    const filePath = `${comboId}/${randomUUID()}.${ext}`;

    // Delete old image if exists to prevent storage bloat
    if (existing.image) {
      try {
        // Extract relative path from full Supabase public URL
        // URL format: https://<project>.supabase.co/storage/v1/object/public/<bucket>/<path>
        const pathFromUrl = existing.image.split("/").slice(-2).join("/");
        await this.supabaseService.deleteFile(BUCKET, pathFromUrl);
      } catch (error) {
        this.logger.warn(
          `Failed to delete old image for combo ${comboId}: ${error}`,
        );
      }
    }

    const publicUrl = await this.supabaseService.uploadFile(
      BUCKET,
      filePath,
      file.buffer,
      file.mimetype,
    );

    return this.comboRepository.update({
      where: { id: comboId },
      data: { image: publicUrl },
      include: COMBO_FULL_INCLUDE,
    });
  }
}
