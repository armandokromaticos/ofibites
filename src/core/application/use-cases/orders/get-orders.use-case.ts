import { ForbiddenException, Inject, Injectable } from "@nestjs/common";
import type { IOrderRepository } from "../../../domain/repositories/order.repository.interface";
import { ORDER_REPOSITORY } from "../../../domain/repositories/order.repository.interface";
import type { OrderVisibilityFilter } from "../../../domain/repositories/order.repository.interface";
import type { ICompanyMemberRepository } from "../../../domain/repositories/company-member.repository.interface";
import { COMPANY_MEMBER_REPOSITORY } from "../../../domain/repositories/company-member.repository.interface";
import type { ICompanyKamRepository } from "../../../domain/repositories/company-kam.repository.interface";
import { COMPANY_KAM_REPOSITORY } from "../../../domain/repositories/company-kam.repository.interface";
import { OrderEntity } from "../../../domain/entities/order.entity";
import { Role } from "../../../domain/enums/role.enum";

const PLATFORM_FULL_ACCESS_ROLES: ReadonlySet<Role> = new Set([
  Role.SUPER_ADMIN,
  Role.OPS_ADMIN,
  Role.FINANCE_ADMIN,
  Role.OPERATOR,
]);

@Injectable()
export class GetOrdersUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
    @Inject(COMPANY_MEMBER_REPOSITORY)
    private readonly companyMemberRepository: ICompanyMemberRepository,
    @Inject(COMPANY_KAM_REPOSITORY)
    private readonly companyKamRepository: ICompanyKamRepository,
  ) {}

  async execute(
    userId: string,
    userRole: Role,
    companyIdFilter?: string,
  ): Promise<OrderEntity[]> {
    const visibility = await this.resolveVisibility(
      userId,
      userRole,
      companyIdFilter,
    );
    return this.orderRepository.findVisible({ visibility });
  }

  private async resolveVisibility(
    userId: string,
    userRole: Role,
    companyIdFilter: string | undefined,
  ): Promise<OrderVisibilityFilter> {
    if (companyIdFilter) {
      await this.assertCompanyAccess(userId, userRole, companyIdFilter);
      return { type: "byCompany", companyId: companyIdFilter };
    }

    if (PLATFORM_FULL_ACCESS_ROLES.has(userRole)) {
      return { type: "all" };
    }

    if (userRole === Role.KAM) {
      const companyIds =
        await this.companyKamRepository.findCompanyIdsByUserId(userId);
      return { type: "byCompanies", companyIds };
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
    if (PLATFORM_FULL_ACCESS_ROLES.has(userRole)) {
      return;
    }

    if (userRole === Role.KAM) {
      const isAssigned = await this.companyKamRepository.isAssignedToCompany(
        userId,
        companyId,
      );
      if (!isAssigned) {
        throw new ForbiddenException(
          "No estás asignado como KAM de esta empresa",
        );
      }
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
