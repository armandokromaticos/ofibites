import { Inject, Injectable } from "@nestjs/common";
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
export class GetBranchesUseCase {
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
    callerUserId: string,
    callerRole: Role,
  ): Promise<BranchEntity[]> {
    await assertCompanyAccess(callerUserId, callerRole, companyId, {
      companyMemberRepository: this.companyMemberRepository,
      companyKamRepository: this.companyKamRepository,
    });
    const { data } = await this.branchRepository.findMany({
      where: { companyId },
      orderBy: { createdAt: "asc" },
    });
    return data;
  }
}
