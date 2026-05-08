import { ForbiddenException, Inject, Injectable } from "@nestjs/common";
import type { IUserRepository } from "../../../domain/repositories/user.repository.interface";
import { USER_REPOSITORY } from "../../../domain/repositories/user.repository.interface";
import type { ICompanyMemberRepository } from "../../../domain/repositories/company-member.repository.interface";
import { COMPANY_MEMBER_REPOSITORY } from "../../../domain/repositories/company-member.repository.interface";
import type { ICompanyKamRepository } from "../../../domain/repositories/company-kam.repository.interface";
import { COMPANY_KAM_REPOSITORY } from "../../../domain/repositories/company-kam.repository.interface";
import { UserEntity } from "../../../domain/entities/user.entity";
import { Role } from "../../../domain/enums/role.enum";

const PLATFORM_FULL_ACCESS_ROLES: ReadonlySet<Role> = new Set([
  Role.SUPER_ADMIN,
  Role.OPS_ADMIN,
  Role.FINANCE_ADMIN,
]);

@Injectable()
export class GetUsersUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(COMPANY_MEMBER_REPOSITORY)
    private readonly companyMemberRepository: ICompanyMemberRepository,
    @Inject(COMPANY_KAM_REPOSITORY)
    private readonly companyKamRepository: ICompanyKamRepository,
  ) {}

  async execute(
    callerUserId: string,
    callerRole: Role,
    companyIdFilter?: string,
  ): Promise<UserEntity[]> {
    if (companyIdFilter) {
      await this.assertCompanyAccess(callerUserId, callerRole, companyIdFilter);
      const members =
        await this.companyMemberRepository.findActiveByCompanyId(
          companyIdFilter,
        );
      const userIds = Array.from(new Set(members.map((m) => m.userId)));
      if (userIds.length === 0) {
        return [];
      }
      const { data } = await this.userRepository.findMany({
        where: { id: { in: userIds } },
      });
      return data;
    }

    if (PLATFORM_FULL_ACCESS_ROLES.has(callerRole)) {
      const { data } = await this.userRepository.findMany();
      return data;
    }

    if (callerRole === Role.KAM) {
      const companyIds =
        await this.companyKamRepository.findCompanyIdsByUserId(callerUserId);
      if (companyIds.length === 0) {
        return [];
      }
      const userIds = new Set<string>();
      for (const companyId of companyIds) {
        const members =
          await this.companyMemberRepository.findActiveByCompanyId(companyId);
        for (const member of members) {
          userIds.add(member.userId);
        }
      }
      if (userIds.size === 0) {
        return [];
      }
      const { data } = await this.userRepository.findMany({
        where: { id: { in: Array.from(userIds) } },
      });
      return data;
    }

    throw new ForbiddenException("No tienes permisos para listar usuarios");
  }

  private async assertCompanyAccess(
    callerUserId: string,
    callerRole: Role,
    companyId: string,
  ): Promise<void> {
    if (PLATFORM_FULL_ACCESS_ROLES.has(callerRole)) {
      return;
    }
    if (callerRole === Role.KAM) {
      const isAssigned = await this.companyKamRepository.isAssignedToCompany(
        callerUserId,
        companyId,
      );
      if (!isAssigned) {
        throw new ForbiddenException(
          "No estás asignado como KAM de esta empresa",
        );
      }
      return;
    }
    throw new ForbiddenException(
      "No tienes permisos para listar usuarios de esta empresa",
    );
  }
}
