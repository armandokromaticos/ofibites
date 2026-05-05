import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import type { IBannerRepository } from "../../../domain/repositories/banner.repository.interface";
import { BANNER_REPOSITORY } from "../../../domain/repositories/banner.repository.interface";
import { SupabaseService } from "../../../infrastructure/supabase/supabase.service";
import { BannerEntity } from "../../../domain/entities/banner.entity";

const BUCKET = "banner-images";

@Injectable()
export class DeleteBannerImageUseCase {
  private readonly logger = new Logger(DeleteBannerImageUseCase.name);

  constructor(
    @Inject(BANNER_REPOSITORY)
    private readonly bannerRepository: IBannerRepository,
    private readonly supabaseService: SupabaseService,
  ) {}

  async execute(
    bannerId: string,
    field: "imageUrl" | "imageMobileUrl",
  ): Promise<BannerEntity> {
    const existing = await this.bannerRepository.findUnique({
      where: { id: bannerId },
    });
    if (!existing) {
      throw new NotFoundException(`Banner with id ${bannerId} not found`);
    }

    const currentUrl =
      field === "imageUrl" ? existing.imageUrl : existing.imageMobileUrl;

    if (!currentUrl) {
      throw new BadRequestException(
        `Banner does not have a ${field} to delete`,
      );
    }

    // DB-first: clear the field so the banner no longer references the file
    const updated = await this.bannerRepository.update({
      where: { id: bannerId },
      data: { [field]: null },
    });

    // Best-effort storage cleanup
    try {
      const pathFromUrl = currentUrl.split("/").slice(-2).join("/");
      await this.supabaseService.deleteFile(BUCKET, pathFromUrl);
    } catch (error) {
      this.logger.warn(
        `Failed to delete ${field} from storage for banner ${bannerId}: ${error}`,
      );
    }

    return updated;
  }

  /**
   * Storage-only cleanup — does NOT modify the banner DB record.
   * Used by DeleteBannerUseCase before deleting the entire row.
   */
  async deleteFromStorage(imageUrl: string, bannerId: string): Promise<void> {
    try {
      const pathFromUrl = imageUrl.split("/").slice(-2).join("/");
      await this.supabaseService.deleteFile(BUCKET, pathFromUrl);
    } catch (error) {
      this.logger.warn(
        `Failed to delete image from storage for banner ${bannerId}: ${error}`,
      );
    }
  }
}
