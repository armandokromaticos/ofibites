import { CompanyAddress as PrismaCompanyAddress } from "@prisma/client";

export class CompanyAddressEntity {
  id: string;
  companyId: string;
  label: string;
  line1: string;
  line2: string | null;
  reference: string | null;
  city: string;
  state: string | null;
  country: string;
  zip: string | null;
  isBilling: boolean;
  isShipping: boolean;
  createdAt: Date;
  updatedAt: Date;

  static fromPrisma(prisma: PrismaCompanyAddress): CompanyAddressEntity {
    const entity = new CompanyAddressEntity();
    entity.id = prisma.id;
    entity.companyId = prisma.companyId;
    entity.label = prisma.label;
    entity.line1 = prisma.line1;
    entity.line2 = prisma.line2;
    entity.reference = prisma.reference;
    entity.city = prisma.city;
    entity.state = prisma.state;
    entity.country = prisma.country;
    entity.zip = prisma.zip;
    entity.isBilling = prisma.isBilling;
    entity.isShipping = prisma.isShipping;
    entity.createdAt = prisma.createdAt;
    entity.updatedAt = prisma.updatedAt;
    return entity;
  }
}
