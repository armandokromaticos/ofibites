import { Prisma } from "@prisma/client";
import { CompanyRegistrationRequestEntity } from "../entities/company-registration-request.entity";

export const COMPANY_REGISTRATION_REQUEST_REPOSITORY = Symbol(
  "COMPANY_REGISTRATION_REQUEST_REPOSITORY",
);

export interface ICompanyRegistrationRequestRepository {
  create(
    entity: CompanyRegistrationRequestEntity,
  ): Promise<CompanyRegistrationRequestEntity>;
  findUnique(
    args: Prisma.CompanyRegistrationRequestFindUniqueArgs,
  ): Promise<CompanyRegistrationRequestEntity | null>;
  findMany(
    args?: Prisma.CompanyRegistrationRequestFindManyArgs,
  ): Promise<{ data: CompanyRegistrationRequestEntity[]; total?: number }>;
  update(
    args: Prisma.CompanyRegistrationRequestUpdateArgs,
  ): Promise<CompanyRegistrationRequestEntity>;
  delete(id: string): Promise<void>;
  exists(args: Prisma.CompanyRegistrationRequestCountArgs): Promise<boolean>;
}
