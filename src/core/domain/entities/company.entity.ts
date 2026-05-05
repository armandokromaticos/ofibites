import { Company as PrismaCompany } from "@prisma/client";
import { PaymentTerm } from "../enums/payment-term.enum";

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
}
