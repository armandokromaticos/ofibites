import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { IBannerRepository } from "../../../domain/repositories/banner.repository.interface";
import { BANNER_REPOSITORY } from "../../../domain/repositories/banner.repository.interface";
import { DeleteBannerImageUseCase } from "./delete-banner-image.use-case";

@Injectable()
export class DeleteBannerUseCase {
  constructor(
    @Inject(BANNER_REPOSITORY)
    private readonly bannerRepository: IBannerRepository,
    private readonly deleteBannerImageUseCase: DeleteBannerImageUseCase,
  ) {}

  async execute(id: string): Promise<void> {
    const banner = await this.bannerRepository.findUnique({ where: { id } });
    if (!banner) {
      throw new NotFoundException(`Banner with id ${id} not found`);
    }

    // Storage-only cleanup before deleting the DB row
    if (banner.imageUrl) {
      await this.deleteBannerImageUseCase.deleteFromStorage(
        banner.imageUrl,
        id,
      );
    }
    if (banner.imageMobileUrl) {
      await this.deleteBannerImageUseCase.deleteFromStorage(
        banner.imageMobileUrl,
        id,
      );
    }

    await this.bannerRepository.delete(id);
  }
}
