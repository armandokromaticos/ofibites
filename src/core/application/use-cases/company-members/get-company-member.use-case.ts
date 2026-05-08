import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { ICompanyMemberRepository } from "../../../domain/repositories/company-member.repository.interface";
import { COMPANY_MEMBER_REPOSITORY } from "../../../domain/repositories/company-member.repository.interface";
import type { ICompanyKamRepository } from "../../../domain/repositories/company-kam.repository.interface";
import { COMPANY_KAM_REPOSITORY } from "../../../domain/repositories/company-kam.repository.interface";
import { CompanyMemberEntity } from "../../../domain/entities/company-member.entity";
import { Role } from "../../../domain/enums/role.enum";
import { assertCompanyAccess } from "../../shared/company-access.guard";

@Injectable()
export class GetCompanyMemberUseCase {
  constructor(
    @Inject(COMPANY_MEMBER_REPOSITORY)
    private readonly memberRepository: ICompanyMemberRepository,
    @Inject(COMPANY_KAM_REPOSITORY)
    private readonly companyKamRepository: ICompanyKamRepository,
  ) {}

  async execute(
    companyId: string,
    id: string,
    callerUserId: string,
    callerRole: Role,
  ): Promise<CompanyMemberEntity> {
    await assertCompanyAccess(callerUserId, callerRole, companyId, {
      companyMemberRepository: this.memberRepository,
      companyKamRepository: this.companyKamRepository,
    });
    const member = await this.memberRepository.findUnique({ where: { id } });
    if (!member || member.companyId !== companyId) {
      throw new NotFoundException(
        `Member ${id} not found in company ${companyId}`,
      );
    }
    return member;
  }
}
