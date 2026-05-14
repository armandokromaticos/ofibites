import { Company as PrismaCompany, Prisma } from "@prisma/client";

export interface CreateCompanyParams {
  legalName: string;
  taxId: string;
  email?: string | null;
  phone?: string | null;
  creditDays?: number;
  isActive?: boolean;
}

export class CompanyEntity {
  id: string;
  legalName: string;
  taxId: string;
  email: string | null;
  phone: string | null;
  creditDays: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  static fromPrisma(prisma: PrismaCompany): CompanyEntity {
    const entity = new CompanyEntity();
    entity.id = prisma.id;
    entity.legalName = prisma.legalName;
    entity.taxId = prisma.taxId;
    entity.email = prisma.email;
    entity.phone = prisma.phone;
    entity.creditDays = prisma.creditDays;
    entity.isActive = prisma.isActive;
    entity.createdAt = prisma.createdAt;
    entity.updatedAt = prisma.updatedAt;
    return entity;
  }

  static fromCreateParams(params: CreateCompanyParams): CompanyEntity {
    const entity = new CompanyEntity();
    entity.id = "";
    entity.legalName = params.legalName.trim();
    entity.taxId = params.taxId.trim();
    entity.email = params.email ?? null;
    entity.phone = params.phone ?? null;
    entity.creditDays = params.creditDays ?? 0;
    entity.isActive = params.isActive ?? true;
    entity.createdAt = new Date();
    entity.updatedAt = new Date();
    return entity;
  }

  toPrismaCreate(): Prisma.CompanyCreateInput {
    return {
      legalName: this.legalName,
      taxId: this.taxId,
      email: this.email,
      phone: this.phone,
      creditDays: this.creditDays,
      isActive: this.isActive,
    };
  }
}
