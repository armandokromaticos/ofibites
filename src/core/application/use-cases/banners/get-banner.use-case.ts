import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { IBannerRepository } from "../../../domain/repositories/banner.repository.interface";
import { BANNER_REPOSITORY } from "../../../domain/repositories/banner.repository.interface";
import { BannerEntity } from "../../../domain/entities/banner.entity";

@Injectable()
export class GetBannerUseCase {
  constructor(
    @Inject(BANNER_REPOSITORY)
    private readonly bannerRepository: IBannerRepository,
  ) {}

  async execute(id: string): Promise<BannerEntity> {
    const banner = await this.bannerRepository.findUnique({ where: { id } });
    if (!banner) {
      throw new NotFoundException(`Banner with id ${id} not found`);
    }
    return banner;
  }
}
