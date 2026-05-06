import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { CompaniesModule } from "../companies/companies.module";
import { BranchesController } from "./controllers/branches.controller";
import { BRANCH_REPOSITORY } from "../../core/domain/repositories/branch.repository.interface";
import { BranchRepository } from "../../core/infrastructure/repositories/branch.repository";
import { CreateBranchUseCase } from "../../core/application/use-cases/branches/create-branch.use-case";
import { GetBranchUseCase } from "../../core/application/use-cases/branches/get-branch.use-case";
import { GetBranchesUseCase } from "../../core/application/use-cases/branches/get-branches.use-case";
import { UpdateBranchUseCase } from "../../core/application/use-cases/branches/update-branch.use-case";
import { DeleteBranchUseCase } from "../../core/application/use-cases/branches/delete-branch.use-case";

@Module({
  imports: [AuthModule, CompaniesModule],
  controllers: [BranchesController],
  providers: [
    { provide: BRANCH_REPOSITORY, useClass: BranchRepository },
    CreateBranchUseCase,
    GetBranchUseCase,
    GetBranchesUseCase,
    UpdateBranchUseCase,
    DeleteBranchUseCase,
  ],
  exports: [BRANCH_REPOSITORY],
})
export class BranchesModule {}
