import { CompanyMember as PrismaCompanyMember, Prisma } from "@prisma/client";
import { CompanyRole } from "../enums/company-role.enum";

export interface CreateCompanyMemberParams {
  userId: string;
  companyId: string;
  role: CompanyRole;
  position?: string | null;
  branchId?: string | null;
  departmentId?: string | null;
  canPayInvoices?: boolean;
  isActive?: boolean;
}

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

  static fromCreateParams(
    params: CreateCompanyMemberParams,
  ): CompanyMemberEntity {
    const entity = new CompanyMemberEntity();
    entity.id = "";
    entity.userId = params.userId;
    entity.companyId = params.companyId;
    entity.role = params.role;
    entity.position = params.position ?? null;
    entity.branchId = params.branchId ?? null;
    entity.departmentId = params.departmentId ?? null;
    entity.canPayInvoices = params.canPayInvoices ?? false;
    entity.isActive = params.isActive ?? true;
    entity.lastSeenAt = null;
    entity.createdAt = new Date();
    entity.updatedAt = new Date();
    return entity;
  }

  toPrismaCreate(): Prisma.CompanyMemberCreateInput {
    return {
      user: { connect: { id: this.userId } },
      company: { connect: { id: this.companyId } },
      role: this.role,
      position: this.position,
      branch: this.branchId
        ? {
            connect: {
              companyId_id: { companyId: this.companyId, id: this.branchId },
            },
          }
        : undefined,
      department: this.departmentId
        ? {
            connect: {
              companyId_id: {
                companyId: this.companyId,
                id: this.departmentId,
              },
            },
          }
        : undefined,
      canPayInvoices: this.canPayInvoices,
      isActive: this.isActive,
    };
  }
}
