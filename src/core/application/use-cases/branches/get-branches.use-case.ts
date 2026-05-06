import { Inject, Injectable } from "@nestjs/common";
import type { IBranchRepository } from "../../../domain/repositories/branch.repository.interface";
import { BRANCH_REPOSITORY } from "../../../domain/repositories/branch.repository.interface";
import { BranchEntity } from "../../../domain/entities/branch.entity";

@Injectable()
export class GetBranchesUseCase {
  constructor(
    @Inject(BRANCH_REPOSITORY)
    private readonly branchRepository: IBranchRepository,
  ) {}

  async execute(companyId: string): Promise<BranchEntity[]> {
    const { data } = await this.branchRepository.findMany({
      where: { companyId },
      orderBy: { createdAt: "asc" },
    });
    return data;
  }
}
