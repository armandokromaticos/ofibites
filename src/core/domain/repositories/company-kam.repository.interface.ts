export const COMPANY_KAM_REPOSITORY = Symbol("COMPANY_KAM_REPOSITORY");

export interface ICompanyKamRepository {
  findCompanyIdsByUserId(userId: string): Promise<string[]>;
  isAssignedToCompany(userId: string, companyId: string): Promise<boolean>;
}
