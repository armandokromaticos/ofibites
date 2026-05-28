import { ForbiddenException, Inject, Injectable } from "@nestjs/common";
import type { ICompanyMemberRepository } from "../../domain/repositories/company-member.repository.interface";
import { COMPANY_MEMBER_REPOSITORY } from "../../domain/repositories/company-member.repository.interface";
import type { OrderVisibilityFilter } from "../../domain/repositories/order.repository.interface";
import { Role } from "../../domain/enums/role.enum";
import { PLATFORM_ORDER_READ_ROLES } from "../shared/platform-roles.constants";

/**
 * Resuelve qué órdenes puede ver un usuario según su rol global y, opcionalmente,
 * una empresa concreta. Reutilizado por el listado de órdenes y los dashboards.
 */
@Injectable()
export class OrderVisibilityResolver {
  constructor(
    @Inject(COMPANY_MEMBER_REPOSITORY)
    private readonly companyMemberRepository: ICompanyMemberRepository,
  ) {}

  async resolve(
    userId: string,
    userRole: Role,
    companyIdFilter?: string,
  ): Promise<OrderVisibilityFilter> {
    if (companyIdFilter) {
      await this.assertCompanyAccess(userId, userRole, companyIdFilter);
      return { type: "byCompany", companyId: companyIdFilter };
    }

    if (PLATFORM_ORDER_READ_ROLES.has(userRole)) {
      return { type: "all" };
    }

    // Role.CLIENT (default)
    const companyIds =
      await this.companyMemberRepository.findActiveCompanyIdsByUserId(userId);
    return { type: "byUserOrCompanies", userId, companyIds };
  }

  private async assertCompanyAccess(
    userId: string,
    userRole: Role,
    companyId: string,
  ): Promise<void> {
    if (PLATFORM_ORDER_READ_ROLES.has(userRole)) {
      return;
    }

    const member =
      await this.companyMemberRepository.findActiveByUserAndCompany(
        userId,
        companyId,
      );
    if (!member) {
      throw new ForbiddenException("No perteneces a esta empresa");
    }
  }
}
