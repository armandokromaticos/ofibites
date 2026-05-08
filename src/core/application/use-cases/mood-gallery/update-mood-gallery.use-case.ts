import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import type { IMoodGalleryRepository } from "../../../domain/repositories/mood-gallery.repository.interface";
import { MOOD_GALLERY_REPOSITORY } from "../../../domain/repositories/mood-gallery.repository.interface";
import { UpdateMoodGalleryDto } from "../../dto/mood-gallery/update-mood-gallery.dto";
import { MoodGalleryEntity } from "../../../domain/entities/mood-gallery.entity";

@Injectable()
export class UpdateMoodGalleryUseCase {
  constructor(
    @Inject(MOOD_GALLERY_REPOSITORY)
    private readonly moodGalleryRepository: IMoodGalleryRepository,
  ) {}

  async execute(
    id: string,
    dto: UpdateMoodGalleryDto,
  ): Promise<MoodGalleryEntity> {
    const existing = await this.moodGalleryRepository.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException(`MoodGallery with id ${id} not found`);
    }

    const data: Prisma.MoodGalleryUpdateInput = {};

    if (dto.title !== undefined) data.title = dto.title;
    if (dto.imageUrl !== undefined) data.imageUrl = dto.imageUrl;
    if (dto.imageMobileUrl !== undefined) {
      data.imageMobileUrl = dto.imageMobileUrl;
    }
    if (dto.altEs !== undefined) {
      if (dto.altEs === null) {
        throw new BadRequestException("altEs cannot be null");
      }
      data.altEs = dto.altEs;
    }
    if (dto.altEn !== undefined) {
      if (dto.altEn === null) {
        throw new BadRequestException("altEn cannot be null");
      }
      data.altEn = dto.altEn;
    }
    if (dto.section !== undefined) data.section = dto.section;
    if (dto.order !== undefined) data.order = dto.order;
    if (dto.isActive !== undefined) data.isActive = dto.isActive;

    try {
      return await this.moodGalleryRepository.update({
        where: { id },
        data,
      });
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        throw new NotFoundException(`MoodGallery with id ${id} not found`);
      }
      throw error;
    }
  }
}
