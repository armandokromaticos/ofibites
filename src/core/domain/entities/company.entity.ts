import { Company as PrismaCompany, Prisma } from "@prisma/client";

export interface CreateCompanyParams {
  legalName: string;
  taxId: string;
  email?: string | null;
  phone?: string | null;
  fiscalName?: string | null;
  fiscalAddress?: string | null;
  creditDays?: number;
  isActive?: boolean;
}

export class CompanyEntity {
  id: string;
  legalName: string;
  taxId: string;
  email: string | null;
  phone: string | null;
  fiscalName: string | null;
  fiscalAddress: string | null;
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
    entity.fiscalName = prisma.fiscalName;
    entity.fiscalAddress = prisma.fiscalAddress;
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
    entity.fiscalName = params.fiscalName?.trim() || null;
    entity.fiscalAddress = params.fiscalAddress?.trim() || null;
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
      fiscalName: this.fiscalName,
      fiscalAddress: this.fiscalAddress,
      creditDays: this.creditDays,
      isActive: this.isActive,
    };
  }
}
