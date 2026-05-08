import { Injectable } from "@nestjs/common";
import { PrismaService } from "../database/prisma/prisma.service";
import { ICompanyKamRepository } from "../../domain/repositories/company-kam.repository.interface";

@Injectable()
export class CompanyKamRepository implements ICompanyKamRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findCompanyIdsByUserId(userId: string): Promise<string[]> {
    const rows = await this.prisma.companyKam.findMany({
      where: { userId },
      select: { companyId: true },
    });
    return rows.map((row) => row.companyId);
  }

  async isAssignedToCompany(
    userId: string,
    companyId: string,
  ): Promise<boolean> {
    const found = await this.prisma.companyKam.findUnique({
      where: { companyId_userId: { companyId, userId } },
      select: { companyId: true },
    });
    return Boolean(found);
  }
}
