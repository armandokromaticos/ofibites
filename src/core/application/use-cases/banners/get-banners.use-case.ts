import { Inject, Injectable } from "@nestjs/common";
import type { IBannerRepository } from "../../../domain/repositories/banner.repository.interface";
import { BANNER_REPOSITORY } from "../../../domain/repositories/banner.repository.interface";
import { BannerEntity } from "../../../domain/entities/banner.entity";

@Injectable()
export class GetBannersUseCase {
  constructor(
    @Inject(BANNER_REPOSITORY)
    private readonly bannerRepository: IBannerRepository,
  ) {}

  async execute(
    section?: string,
    activeOnly?: boolean,
  ): Promise<BannerEntity[]> {
    if (activeOnly) {
      return this.bannerRepository.findAllActive(section);
    }
    const where = section ? { section } : undefined;
    const { data } = await this.bannerRepository.findMany({
      where,
      orderBy: { order: "asc" },
    });
    return data;
  }
}
