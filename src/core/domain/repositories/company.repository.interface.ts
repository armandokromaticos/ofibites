import { Prisma } from "@prisma/client";
import { CompanyEntity } from "../entities/company.entity";

export const COMPANY_REPOSITORY = Symbol("COMPANY_REPOSITORY");

export interface ICompanyRepository {
  create(entity: CompanyEntity): Promise<CompanyEntity>;
  findUnique(args: Prisma.CompanyFindUniqueArgs): Promise<CompanyEntity | null>;
  findMany(
    args?: Prisma.CompanyFindManyArgs,
  ): Promise<{ data: CompanyEntity[]; total?: number }>;
  update(args: Prisma.CompanyUpdateArgs): Promise<CompanyEntity>;
  delete(id: string): Promise<void>;
  exists(args: Prisma.CompanyCountArgs): Promise<boolean>;
}
