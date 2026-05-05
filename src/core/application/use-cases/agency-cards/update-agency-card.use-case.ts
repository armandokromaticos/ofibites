import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import type { IAgencyCardRepository } from "../../../domain/repositories/agency-card.repository.interface";
import { AGENCY_CARD_REPOSITORY } from "../../../domain/repositories/agency-card.repository.interface";
import { UpdateAgencyCardDto } from "../../dto/agency-cards/update-agency-card.dto";
import { AgencyCardEntity } from "../../../domain/entities/agency-card.entity";

@Injectable()
export class UpdateAgencyCardUseCase {
  constructor(
    @Inject(AGENCY_CARD_REPOSITORY)
    private readonly repository: IAgencyCardRepository,
  ) {}

  async execute(
    id: string,
    dto: UpdateAgencyCardDto,
  ): Promise<AgencyCardEntity> {
    const existing = await this.repository.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Agency card with id ${id} not found`);
    }

    const data: Prisma.AgencyCardUpdateInput = {};

    if (dto.title !== undefined) data.title = dto.title;
    if (dto.location !== undefined) data.location = dto.location;
    if (dto.lodgingType !== undefined) data.lodgingType = dto.lodgingType;
    if (dto.distance !== undefined) data.distance = dto.distance;
    if (dto.email !== undefined) data.email = dto.email;
    if (dto.phone !== undefined) data.phone = dto.phone;
    if (dto.socialHandle !== undefined) data.socialHandle = dto.socialHandle;
    if (dto.facebookUrl !== undefined) data.facebookUrl = dto.facebookUrl;
    if (dto.instagramUrl !== undefined) data.instagramUrl = dto.instagramUrl;
    if (dto.tiktokUrl !== undefined) data.tiktokUrl = dto.tiktokUrl;
    if (dto.order !== undefined) data.order = dto.order;
    if (dto.isActive !== undefined) data.isActive = dto.isActive;

    return this.repository.update({ where: { id }, data });
  }
}
