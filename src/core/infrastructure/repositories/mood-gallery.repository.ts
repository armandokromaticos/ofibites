import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../database/prisma/prisma.service";
import { IMoodGalleryRepository } from "../../domain/repositories/mood-gallery.repository.interface";
import { MoodGalleryEntity } from "../../domain/entities/mood-gallery.entity";

@Injectable()
export class MoodGalleryRepository implements IMoodGalleryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(entity: MoodGalleryEntity): Promise<MoodGalleryEntity> {
    const record = await this.prisma.moodGallery.create({
      data: entity.toPrismaCreate(),
    });
    return MoodGalleryEntity.fromPrisma(record);
  }

  async findUnique(
    args: Prisma.MoodGalleryFindUniqueArgs,
  ): Promise<MoodGalleryEntity | null> {
    const record = await this.prisma.moodGallery.findUnique(args);
    return record ? MoodGalleryEntity.fromPrisma(record) : null;
  }

  async findMany(
    args?: Prisma.MoodGalleryFindManyArgs,
  ): Promise<{ data: MoodGalleryEntity[]; total?: number }> {
    const rows = await this.prisma.moodGallery.findMany(args);
    const data = rows.map((row) => MoodGalleryEntity.fromPrisma(row));

    const hasPagination =
      typeof args?.skip === "number" || typeof args?.take === "number";
    if (hasPagination) {
      const total = await this.prisma.moodGallery.count({ where: args?.where });
      return { data, total };
    }
    return { data };
  }

  async update(args: Prisma.MoodGalleryUpdateArgs): Promise<MoodGalleryEntity> {
    const record = await this.prisma.moodGallery.update(args);
    return MoodGalleryEntity.fromPrisma(record);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.moodGallery.delete({ where: { id } });
  }

  async exists(args: Prisma.MoodGalleryCountArgs): Promise<boolean> {
    const count = await this.prisma.moodGallery.count(args);
    return count > 0;
  }

  async findAllActive(section?: string): Promise<MoodGalleryEntity[]> {
    const records = await this.prisma.moodGallery.findMany({
      where: {
        isActive: true,
        ...(section ? { section } : {}),
      },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    });
    return records.map((record) => MoodGalleryEntity.fromPrisma(record));
  }
}
