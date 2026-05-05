import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import type { ISectionRepository } from "../../../domain/repositories/section.repository.interface";
import { SECTION_REPOSITORY } from "../../../domain/repositories/section.repository.interface";
import { AddSectionItemDto } from "../../dto/sections/add-section-item.dto";
import { SectionEntity } from "../../../domain/entities/section.entity";

@Injectable()
export class AddItemToSectionUseCase {
  constructor(
    @Inject(SECTION_REPOSITORY)
    private readonly sectionRepository: ISectionRepository,
  ) {}

  async execute(
    sectionId: string,
    dto: AddSectionItemDto,
  ): Promise<SectionEntity> {
    const existing = await this.sectionRepository.findUnique({
      where: { id: sectionId },
    });
    if (!existing) {
      throw new NotFoundException(`Section with id ${sectionId} not found`);
    }
    try {
      return await this.sectionRepository.addItem(
        sectionId,
        dto.productId ?? null,
        dto.comboId ?? null,
        dto.order,
      );
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2003") {
          throw new BadRequestException(
            "The referenced product or combo does not exist",
          );
        }
        if (error.code === "P2002") {
          throw new BadRequestException(
            "This product or combo is already in this section",
          );
        }
      }
      throw error;
    }
  }
}
