import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { ICompanyRepository } from "../../../domain/repositories/company.repository.interface";
import { COMPANY_REPOSITORY } from "../../../domain/repositories/company.repository.interface";
import type { ICompanyMemberRepository } from "../../../domain/repositories/company-member.repository.interface";
import { COMPANY_MEMBER_REPOSITORY } from "../../../domain/repositories/company-member.repository.interface";
import type { ICompanyKamRepository } from "../../../domain/repositories/company-kam.repository.interface";
import { COMPANY_KAM_REPOSITORY } from "../../../domain/repositories/company-kam.repository.interface";
import { CompanyEntity } from "../../../domain/entities/company.entity";
import { Role } from "../../../domain/enums/role.enum";

const PLATFORM_FULL_ACCESS_ROLES: ReadonlySet<Role> = new Set([
  Role.SUPER_ADMIN,
  Role.OPS_ADMIN,
  Role.FINANCE_ADMIN,
]);

@Injectable()
export class GetCompanyUseCase {
  constructor(
    @Inject(COMPANY_REPOSITORY)
    private readonly companyRepository: ICompanyRepository,
    @Inject(COMPANY_MEMBER_REPOSITORY)
    private readonly companyMemberRepository: ICompanyMemberRepository,
    @Inject(COMPANY_KAM_REPOSITORY)
    private readonly companyKamRepository: ICompanyKamRepository,
  ) {}

  async execute(
    id: string,
    callerUserId: string,
    callerRole: Role,
  ): Promise<CompanyEntity> {
    const company = await this.companyRepository.findUnique({ where: { id } });
    if (!company) {
      throw new NotFoundException(`Company with id ${id} not found`);
    }

    if (PLATFORM_FULL_ACCESS_ROLES.has(callerRole)) {
      return company;
    }

    if (callerRole === Role.KAM) {
      const isAssigned = await this.companyKamRepository.isAssignedToCompany(
        callerUserId,
        id,
      );
      if (!isAssigned) {
        throw new ForbiddenException(
          "No estás asignado como KAM de esta empresa",
        );
      }
      return company;
    }

    const member =
      await this.companyMemberRepository.findActiveByUserAndCompany(
        callerUserId,
        id,
      );
    if (!member) {
      throw new ForbiddenException("No perteneces a esta empresa");
    }
    return company;
  }
}
