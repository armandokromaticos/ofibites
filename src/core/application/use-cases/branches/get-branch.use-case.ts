import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { IBranchRepository } from "../../../domain/repositories/branch.repository.interface";
import { BRANCH_REPOSITORY } from "../../../domain/repositories/branch.repository.interface";
import { BranchEntity } from "../../../domain/entities/branch.entity";

@Injectable()
export class GetBranchUseCase {
  constructor(
    @Inject(BRANCH_REPOSITORY)
    private readonly branchRepository: IBranchRepository,
  ) {}

  async execute(companyId: string, id: string): Promise<BranchEntity> {
    const branch = await this.branchRepository.findUnique({ where: { id } });
    if (!branch || branch.companyId !== companyId) {
      throw new NotFoundException(
        `Branch ${id} not found in company ${companyId}`,
      );
    }
    return branch;
  }
}
