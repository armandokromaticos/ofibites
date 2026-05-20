import { ForbiddenException, Inject, Injectable } from "@nestjs/common";
import type { ICompanyRepository } from "../../../domain/repositories/company.repository.interface";
import { COMPANY_REPOSITORY } from "../../../domain/repositories/company.repository.interface";
import type { ICompanyMemberRepository } from "../../../domain/repositories/company-member.repository.interface";
import { COMPANY_MEMBER_REPOSITORY } from "../../../domain/repositories/company-member.repository.interface";
import { CompanyEntity } from "../../../domain/entities/company.entity";
import { Role } from "../../../domain/enums/role.enum";

const PLATFORM_FULL_ACCESS_ROLES: ReadonlySet<Role> = new Set([
  Role.SUPER_ADMIN,
  Role.OPS_ADMIN,
]);

@Injectable()
export class GetCompaniesUseCase {
  constructor(
    @Inject(COMPANY_REPOSITORY)
    private readonly companyRepository: ICompanyRepository,
    @Inject(COMPANY_MEMBER_REPOSITORY)
    private readonly companyMemberRepository: ICompanyMemberRepository,
  ) {}

  async execute(
    callerUserId: string,
    callerRole: Role,
  ): Promise<CompanyEntity[]> {
    if (PLATFORM_FULL_ACCESS_ROLES.has(callerRole)) {
      const { data } = await this.companyRepository.findMany({
        orderBy: { createdAt: "desc" },
      });
      return data;
    }

    if (callerRole === Role.CLIENT) {
      const companyIds =
        await this.companyMemberRepository.findActiveCompanyIdsByUserId(
          callerUserId,
        );
      if (companyIds.length === 0) {
        return [];
      }
      const { data } = await this.companyRepository.findMany({
        where: { id: { in: companyIds } },
        orderBy: { createdAt: "desc" },
      });
      return data;
    }

    throw new ForbiddenException("No tienes permisos para listar empresas");
  }
}
