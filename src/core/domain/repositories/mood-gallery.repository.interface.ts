import { Prisma } from "@prisma/client";
import { MoodGalleryEntity } from "../entities/mood-gallery.entity";

export const MOOD_GALLERY_REPOSITORY = Symbol("MOOD_GALLERY_REPOSITORY");

export interface IMoodGalleryRepository {
  create(entity: MoodGalleryEntity): Promise<MoodGalleryEntity>;
  findUnique(
    args: Prisma.MoodGalleryFindUniqueArgs,
  ): Promise<MoodGalleryEntity | null>;
  findMany(
    args?: Prisma.MoodGalleryFindManyArgs,
  ): Promise<{ data: MoodGalleryEntity[]; total?: number }>;
  update(args: Prisma.MoodGalleryUpdateArgs): Promise<MoodGalleryEntity>;
  delete(id: string): Promise<void>;
  exists(args: Prisma.MoodGalleryCountArgs): Promise<boolean>;

  findAllActive(section?: string): Promise<MoodGalleryEntity[]>;
}
