import { Inject, Injectable } from "@nestjs/common";
import type { IAgencyCardRepository } from "../../../domain/repositories/agency-card.repository.interface";
import { AGENCY_CARD_REPOSITORY } from "../../../domain/repositories/agency-card.repository.interface";
import { AgencyCardEntity } from "../../../domain/entities/agency-card.entity";

@Injectable()
export class GetAgencyCardsUseCase {
  constructor(
    @Inject(AGENCY_CARD_REPOSITORY)
    private readonly repository: IAgencyCardRepository,
  ) {}

  async execute(activeFilter?: boolean): Promise<AgencyCardEntity[]> {
    const where =
      activeFilter === undefined ? undefined : { isActive: activeFilter };
    const { data } = await this.repository.findMany({
      where,
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });
    return data;
  }
}
