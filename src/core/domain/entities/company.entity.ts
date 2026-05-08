import { Company as PrismaCompany, Prisma } from "@prisma/client";
import { PaymentTerm } from "../enums/payment-term.enum";

export interface CreateCompanyParams {
  legalName: string;
  taxId: string;
  email?: string | null;
  phone?: string | null;
  paymentTerm?: PaymentTerm;
  isActive?: boolean;
}

export class CompanyEntity {
  id: string;
  legalName: string;
  taxId: string;
  email: string | null;
  phone: string | null;
  paymentTerm: PaymentTerm;
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
    if (
      !Object.values(PaymentTerm).includes(prisma.paymentTerm as PaymentTerm)
    ) {
      throw new Error(`Invalid paymentTerm value: ${prisma.paymentTerm}`);
    }
    entity.paymentTerm = prisma.paymentTerm as PaymentTerm;
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
    entity.paymentTerm = params.paymentTerm ?? PaymentTerm.CASH;
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
      paymentTerm: this.paymentTerm,
      isActive: this.isActive,
    };
  }
}
