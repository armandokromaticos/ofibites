import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { IBranchRepository } from "../../../domain/repositories/branch.repository.interface";
import { BRANCH_REPOSITORY } from "../../../domain/repositories/branch.repository.interface";
import type { ICompanyRepository } from "../../../domain/repositories/company.repository.interface";
import { COMPANY_REPOSITORY } from "../../../domain/repositories/company.repository.interface";
import { CreateBranchDto } from "../../dto/branches/create-branch.dto";
import { BranchEntity } from "../../../domain/entities/branch.entity";

@Injectable()
export class CreateBranchUseCase {
  constructor(
    @Inject(BRANCH_REPOSITORY)
    private readonly branchRepository: IBranchRepository,
    @Inject(COMPANY_REPOSITORY)
    private readonly companyRepository: ICompanyRepository,
  ) {}

  async execute(
    companyId: string,
    dto: CreateBranchDto,
  ): Promise<BranchEntity> {
    const company = await this.companyRepository.findUnique({
      where: { id: companyId },
    });
    if (!company) {
      throw new NotFoundException(`Company ${companyId} not found`);
    }

    const entity = BranchEntity.fromCreateParams({
      companyId,
      name: dto.name,
      isActive: dto.isActive,
    });
    return this.branchRepository.create(entity);
  }
}
