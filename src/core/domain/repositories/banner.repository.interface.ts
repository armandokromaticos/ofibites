import { Prisma } from "@prisma/client";
import { BannerEntity } from "../entities/banner.entity";

export const BANNER_REPOSITORY = Symbol("BANNER_REPOSITORY");

export interface IBannerRepository {
  create(entity: BannerEntity): Promise<BannerEntity>;
  findUnique(args: Prisma.BannerFindUniqueArgs): Promise<BannerEntity | null>;
  findMany(
    args?: Prisma.BannerFindManyArgs,
  ): Promise<{ data: BannerEntity[]; total?: number }>;
  update(args: Prisma.BannerUpdateArgs): Promise<BannerEntity>;
  delete(id: string): Promise<void>;
  exists(args: Prisma.BannerCountArgs): Promise<boolean>;

  // Helper de dominio: filtra activos por fecha de visibilidad
  findAllActive(section?: string): Promise<BannerEntity[]>;
}
