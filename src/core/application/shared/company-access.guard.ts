import { ForbiddenException } from "@nestjs/common";
import type { ICompanyMemberRepository } from "../../domain/repositories/company-member.repository.interface";
import { Role } from "../../domain/enums/role.enum";
import { PLATFORM_FULL_ACCESS_ROLES } from "./platform-roles.constants";

export interface CompanyAccessDeps {
  companyMemberRepository: ICompanyMemberRepository;
}

/**
 * Asegura que el caller tiene acceso a la empresa indicada.
 * - SUPER_ADMIN/OPS_ADMIN: acceso global.
 * - CLIENT: debe ser CompanyMember activo.
 * - OPERATOR / cualquier otro rol: forbidden.
 */
export async function assertCompanyAccess(
  callerUserId: string,
  callerRole: Role,
  companyId: string,
  deps: CompanyAccessDeps,
): Promise<void> {
  if (PLATFORM_FULL_ACCESS_ROLES.has(callerRole)) {
    return;
  }

  if (callerRole === Role.CLIENT) {
    const member =
      await deps.companyMemberRepository.findActiveByUserAndCompany(
        callerUserId,
        companyId,
      );
    if (!member) {
      throw new ForbiddenException("No tienes acceso a esta empresa");
    }
    return;
  }

  throw new ForbiddenException("No tienes acceso a esta empresa");
}
