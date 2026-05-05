import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { IAgencyCardRepository } from "../../../domain/repositories/agency-card.repository.interface";
import { AGENCY_CARD_REPOSITORY } from "../../../domain/repositories/agency-card.repository.interface";
import { AgencyCardEntity } from "../../../domain/entities/agency-card.entity";

@Injectable()
export class GetAgencyCardUseCase {
  constructor(
    @Inject(AGENCY_CARD_REPOSITORY)
    private readonly repository: IAgencyCardRepository,
  ) {}

  async execute(id: string): Promise<AgencyCardEntity> {
    const card = await this.repository.findUnique({ where: { id } });
    if (!card) {
      throw new NotFoundException(`Agency card with id ${id} not found`);
    }
    return card;
  }
}
