import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { CompaniesModule } from "../companies/companies.module";
import { CompanyMembersController } from "./controllers/company-members.controller";
import { BRANCH_REPOSITORY } from "../../core/domain/repositories/branch.repository.interface";
import { BranchRepository } from "../../core/infrastructure/repositories/branch.repository";
import { DEPARTMENT_REPOSITORY } from "../../core/domain/repositories/department.repository.interface";
import { DepartmentRepository } from "../../core/infrastructure/repositories/department.repository";
import { CreateCompanyMemberUseCase } from "../../core/application/use-cases/company-members/create-company-member.use-case";
import { GetCompanyMemberUseCase } from "../../core/application/use-cases/company-members/get-company-member.use-case";
import { GetCompanyMembersUseCase } from "../../core/application/use-cases/company-members/get-company-members.use-case";
import { UpdateCompanyMemberUseCase } from "../../core/application/use-cases/company-members/update-company-member.use-case";
import { DeleteCompanyMemberUseCase } from "../../core/application/use-cases/company-members/delete-company-member.use-case";

@Module({
  imports: [AuthModule, CompaniesModule],
  controllers: [CompanyMembersController],
  providers: [
    { provide: BRANCH_REPOSITORY, useClass: BranchRepository },
    { provide: DEPARTMENT_REPOSITORY, useClass: DepartmentRepository },
    CreateCompanyMemberUseCase,
    GetCompanyMemberUseCase,
    GetCompanyMembersUseCase,
    UpdateCompanyMemberUseCase,
    DeleteCompanyMemberUseCase,
  ],
})
export class CompanyMembersModule {}
