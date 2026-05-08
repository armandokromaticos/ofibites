import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { randomUUID } from "crypto";
import { extname } from "node:path";
import type { IAgencyCardRepository } from "../../../domain/repositories/agency-card.repository.interface";
import { AGENCY_CARD_REPOSITORY } from "../../../domain/repositories/agency-card.repository.interface";
import { SupabaseService } from "../../../infrastructure/supabase/supabase.service";
import { AgencyCardEntity } from "../../../domain/entities/agency-card.entity";

const BUCKET = "agency-card-images";

export interface UploadFileInput {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
}

@Injectable()
export class UploadAgencyCardImageUseCase {
  private readonly logger = new Logger(UploadAgencyCardImageUseCase.name);

  constructor(
    @Inject(AGENCY_CARD_REPOSITORY)
    private readonly repository: IAgencyCardRepository,
    private readonly supabaseService: SupabaseService,
  ) {}

  async execute(
    cardId: string,
    file: UploadFileInput,
  ): Promise<AgencyCardEntity> {
    const existing = await this.repository.findUnique({
      where: { id: cardId },
    });
    if (!existing) {
      throw new NotFoundException(`Agency card with id ${cardId} not found`);
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
    const filePath = `${cardId}/${randomUUID()}.${ext}`;

    const publicUrl = await this.supabaseService.uploadFile(
      BUCKET,
      filePath,
      file.buffer,
      file.mimetype,
    );

    const updated = await this.repository.update({
      where: { id: cardId },
      data: { imageUrl: publicUrl },
    });

    if (existing.imageUrl) {
      try {
        const pathFromUrl = existing.imageUrl.split("/").slice(-2).join("/");
        await this.supabaseService.deleteFile(BUCKET, pathFromUrl);
      } catch (error) {
        this.logger.warn(
          `Failed to delete old image for agency card ${cardId}: ${error}`,
        );
      }
    }

    return updated;
  }
}
