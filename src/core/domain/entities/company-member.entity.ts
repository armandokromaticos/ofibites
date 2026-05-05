import { CompanyMember as PrismaCompanyMember } from "@prisma/client";
import { CompanyRole } from "../enums/company-role.enum";

export class CompanyMemberEntity {
  id: string;
  userId: string;
  companyId: string;
  role: CompanyRole;
  position: string | null;
  branchId: string | null;
  departmentId: string | null;
  canPayInvoices: boolean;
  isActive: boolean;
  lastSeenAt: Date | null;
  createdAt: Date;
  updatedAt: Date;

  static fromPrisma(prisma: PrismaCompanyMember): CompanyMemberEntity {
    const entity = new CompanyMemberEntity();
    entity.id = prisma.id;
    entity.userId = prisma.userId;
    entity.companyId = prisma.companyId;
    if (!Object.values(CompanyRole).includes(prisma.role as CompanyRole)) {
      throw new Error(`Invalid CompanyRole value: ${prisma.role}`);
    }
    entity.role = prisma.role as CompanyRole;
    entity.position = prisma.position;
    entity.branchId = prisma.branchId;
    entity.departmentId = prisma.departmentId;
    entity.canPayInvoices = prisma.canPayInvoices;
    entity.isActive = prisma.isActive;
    entity.lastSeenAt = prisma.lastSeenAt;
    entity.createdAt = prisma.createdAt;
    entity.updatedAt = prisma.updatedAt;
    return entity;
  }
}
