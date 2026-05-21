import { ForbiddenException, Inject, Injectable } from "@nestjs/common";
import type { IUserRepository } from "../../../domain/repositories/user.repository.interface";
import { USER_REPOSITORY } from "../../../domain/repositories/user.repository.interface";
import type { ICompanyMemberRepository } from "../../../domain/repositories/company-member.repository.interface";
import { COMPANY_MEMBER_REPOSITORY } from "../../../domain/repositories/company-member.repository.interface";
import { UserEntity } from "../../../domain/entities/user.entity";
import { Role } from "../../../domain/enums/role.enum";
import { PLATFORM_FULL_ACCESS_ROLES } from "../../shared/platform-roles.constants";

@Injectable()
export class GetUsersUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(COMPANY_MEMBER_REPOSITORY)
    private readonly companyMemberRepository: ICompanyMemberRepository,
  ) {}

  async execute(
    callerUserId: string,
    callerRole: Role,
    companyIdFilter?: string,
  ): Promise<UserEntity[]> {
    if (companyIdFilter) {
      if (!PLATFORM_FULL_ACCESS_ROLES.has(callerRole)) {
        throw new ForbiddenException(
          "No tienes permisos para listar usuarios de esta empresa",
        );
      }
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

    throw new ForbiddenException("No tienes permisos para listar usuarios");
  }
}
