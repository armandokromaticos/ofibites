import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { ICompanyRepository } from "../../../domain/repositories/company.repository.interface";
import { COMPANY_REPOSITORY } from "../../../domain/repositories/company.repository.interface";
import type { ICompanyMemberRepository } from "../../../domain/repositories/company-member.repository.interface";
import { COMPANY_MEMBER_REPOSITORY } from "../../../domain/repositories/company-member.repository.interface";
import { CompanyEntity } from "../../../domain/entities/company.entity";
import { Role } from "../../../domain/enums/role.enum";
import { assertCompanyAccess } from "../../shared/company-access.guard";

@Injectable()
export class GetCompanyUseCase {
  constructor(
    @Inject(COMPANY_REPOSITORY)
    private readonly companyRepository: ICompanyRepository,
    @Inject(COMPANY_MEMBER_REPOSITORY)
    private readonly companyMemberRepository: ICompanyMemberRepository,
  ) {}

  async execute(
    id: string,
    callerUserId: string,
    callerRole: Role,
  ): Promise<CompanyEntity> {
    // Auth primero (evita enumerar empresas vía 404 vs 403).
    // OPERATOR no entra en ninguna rama de assertCompanyAccess → 403.
    await assertCompanyAccess(callerUserId, callerRole, id, {
      companyMemberRepository: this.companyMemberRepository,
    });

    const company = await this.companyRepository.findUnique({ where: { id } });
    if (!company) {
      throw new NotFoundException(`Company with id ${id} not found`);
    }
    return company;
  }
}
