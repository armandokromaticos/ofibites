import { CompanyKam as PrismaCompanyKam } from "@prisma/client";

export class CompanyKamEntity {
  companyId: string;
  userId: string;
  assignedAt: Date;

  static fromPrisma(prisma: PrismaCompanyKam): CompanyKamEntity {
    const entity = new CompanyKamEntity();
    entity.companyId = prisma.companyId;
    entity.userId = prisma.userId;
    entity.assignedAt = prisma.assignedAt;
    return entity;
  }
}
