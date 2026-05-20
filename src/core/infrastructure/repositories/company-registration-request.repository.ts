import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../database/prisma/prisma.service";
import { ICompanyRegistrationRequestRepository } from "../../domain/repositories/company-registration-request.repository.interface";
import { CompanyRegistrationRequestEntity } from "../../domain/entities/company-registration-request.entity";

@Injectable()
export class CompanyRegistrationRequestRepository implements ICompanyRegistrationRequestRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    entity: CompanyRegistrationRequestEntity,
  ): Promise<CompanyRegistrationRequestEntity> {
    const row = await this.prisma.companyRegistrationRequest.create({
      data: entity.toPrismaCreate(),
    });
    return CompanyRegistrationRequestEntity.fromPrisma(row);
  }

  async findUnique(
    args: Prisma.CompanyRegistrationRequestFindUniqueArgs,
  ): Promise<CompanyRegistrationRequestEntity | null> {
    const row = await this.prisma.companyRegistrationRequest.findUnique(args);
    return row ? CompanyRegistrationRequestEntity.fromPrisma(row) : null;
  }

  async findMany(
    args?: Prisma.CompanyRegistrationRequestFindManyArgs,
  ): Promise<{ data: CompanyRegistrationRequestEntity[]; total?: number }> {
    const rows = await this.prisma.companyRegistrationRequest.findMany(args);
    const data = rows.map((row) =>
      CompanyRegistrationRequestEntity.fromPrisma(row),
    );

    const hasPagination =
      typeof args?.skip === "number" || typeof args?.take === "number";
    if (hasPagination) {
      const total = await this.prisma.companyRegistrationRequest.count({
        where: args?.where,
      });
      return { data, total };
    }
    return { data };
  }

  async update(
    args: Prisma.CompanyRegistrationRequestUpdateArgs,
  ): Promise<CompanyRegistrationRequestEntity> {
    const row = await this.prisma.companyRegistrationRequest.update(args);
    return CompanyRegistrationRequestEntity.fromPrisma(row);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.companyRegistrationRequest.delete({ where: { id } });
  }

  async exists(
    args: Prisma.CompanyRegistrationRequestCountArgs,
  ): Promise<boolean> {
    const count = await this.prisma.companyRegistrationRequest.count(args);
    return count > 0;
  }
}
