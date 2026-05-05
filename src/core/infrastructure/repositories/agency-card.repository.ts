import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../database/prisma/prisma.service";
import { IAgencyCardRepository } from "../../domain/repositories/agency-card.repository.interface";
import { AgencyCardEntity } from "../../domain/entities/agency-card.entity";

@Injectable()
export class AgencyCardRepository implements IAgencyCardRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(entity: AgencyCardEntity): Promise<AgencyCardEntity> {
    const card = await this.prisma.agencyCard.create({
      data: entity.toPrismaCreate(),
    });
    return AgencyCardEntity.fromPrisma(card);
  }

  async findUnique(
    args: Prisma.AgencyCardFindUniqueArgs,
  ): Promise<AgencyCardEntity | null> {
    const card = await this.prisma.agencyCard.findUnique(args);
    return card ? AgencyCardEntity.fromPrisma(card) : null;
  }

  async findMany(
    args?: Prisma.AgencyCardFindManyArgs,
  ): Promise<{ data: AgencyCardEntity[]; total?: number }> {
    const rows = await this.prisma.agencyCard.findMany(args);
    const data = rows.map((row) => AgencyCardEntity.fromPrisma(row));

    const hasPagination =
      typeof args?.skip === "number" || typeof args?.take === "number";
    if (hasPagination) {
      const total = await this.prisma.agencyCard.count({ where: args?.where });
      return { data, total };
    }
    return { data };
  }

  async update(args: Prisma.AgencyCardUpdateArgs): Promise<AgencyCardEntity> {
    const card = await this.prisma.agencyCard.update(args);
    return AgencyCardEntity.fromPrisma(card);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.agencyCard.delete({ where: { id } });
  }

  async exists(args: Prisma.AgencyCardCountArgs): Promise<boolean> {
    const count = await this.prisma.agencyCard.count(args);
    return count > 0;
  }
}
