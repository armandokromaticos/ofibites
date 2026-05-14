import { SetMetadata } from "@nestjs/common";
import { Role } from "../../../core/domain/enums/role.enum";
import { CompanyRole } from "../../../core/domain/enums/company-role.enum";

export const PLATFORM_OR_COMPANY_ROLE_KEY = "platformOrCompanyRole";

export interface PlatformOrCompanyRoleOptions {
  platformRoles: Role[];
  companyRoles: CompanyRole[];
}

export const PlatformOrCompanyRole = (options: PlatformOrCompanyRoleOptions) =>
  SetMetadata(PLATFORM_OR_COMPANY_ROLE_KEY, options);
