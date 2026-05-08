import { Prisma } from "@prisma/client";
import { AgencyCardEntity } from "../entities/agency-card.entity";

export const AGENCY_CARD_REPOSITORY = Symbol("AGENCY_CARD_REPOSITORY");

export interface IAgencyCardRepository {
  create(entity: AgencyCardEntity): Promise<AgencyCardEntity>;
  findUnique(
    args: Prisma.AgencyCardFindUniqueArgs,
  ): Promise<AgencyCardEntity | null>;
  findMany(
    args?: Prisma.AgencyCardFindManyArgs,
  ): Promise<{ data: AgencyCardEntity[]; total?: number }>;
  update(args: Prisma.AgencyCardUpdateArgs): Promise<AgencyCardEntity>;
  delete(id: string): Promise<void>;
  exists(args: Prisma.AgencyCardCountArgs): Promise<boolean>;
}
