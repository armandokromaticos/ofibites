import { Prisma } from "@prisma/client";
import { CompanyAddressEntity } from "../entities/company-address.entity";

export const COMPANY_ADDRESS_REPOSITORY = Symbol("COMPANY_ADDRESS_REPOSITORY");

export interface ICompanyAddressRepository {
  create(entity: CompanyAddressEntity): Promise<CompanyAddressEntity>;
  findUnique(
    args: Prisma.CompanyAddressFindUniqueArgs,
  ): Promise<CompanyAddressEntity | null>;
  findMany(
    args?: Prisma.CompanyAddressFindManyArgs,
  ): Promise<{ data: CompanyAddressEntity[]; total?: number }>;
  update(
    args: Prisma.CompanyAddressUpdateArgs,
  ): Promise<CompanyAddressEntity>;
  delete(id: string): Promise<void>;
  exists(args: Prisma.CompanyAddressCountArgs): Promise<boolean>;

  // Helper de dominio: marcar otra dirección como única de billing en una transacción
  setSingleBilling(
    companyId: string,
    targetId: string,
  ): Promise<void>;
}
