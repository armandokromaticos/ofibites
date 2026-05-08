import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { IBranchRepository } from "../../../domain/repositories/branch.repository.interface";
import { BRANCH_REPOSITORY } from "../../../domain/repositories/branch.repository.interface";
import type { ICompanyMemberRepository } from "../../../domain/repositories/company-member.repository.interface";
import { COMPANY_MEMBER_REPOSITORY } from "../../../domain/repositories/company-member.repository.interface";
import type { ICompanyKamRepository } from "../../../domain/repositories/company-kam.repository.interface";
import { COMPANY_KAM_REPOSITORY } from "../../../domain/repositories/company-kam.repository.interface";
import { BranchEntity } from "../../../domain/entities/branch.entity";
import { Role } from "../../../domain/enums/role.enum";
import { assertCompanyAccess } from "../../shared/company-access.guard";

@Injectable()
export class GetBranchUseCase {
  constructor(
    @Inject(BRANCH_REPOSITORY)
    private readonly branchRepository: IBranchRepository,
    @Inject(COMPANY_MEMBER_REPOSITORY)
    private readonly companyMemberRepository: ICompanyMemberRepository,
    @Inject(COMPANY_KAM_REPOSITORY)
    private readonly companyKamRepository: ICompanyKamRepository,
  ) {}

  async execute(
    companyId: string,
    id: string,
    callerUserId: string,
    callerRole: Role,
  ): Promise<BranchEntity> {
    await assertCompanyAccess(callerUserId, callerRole, companyId, {
      companyMemberRepository: this.companyMemberRepository,
      companyKamRepository: this.companyKamRepository,
    });
    const branch = await this.branchRepository.findUnique({ where: { id } });
    if (!branch || branch.companyId !== companyId) {
      throw new NotFoundException(
        `Branch ${id} not found in company ${companyId}`,
      );
    }
    return branch;
  }
}
