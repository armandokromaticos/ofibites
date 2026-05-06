import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { CompaniesController } from "./controllers/companies.controller";
import { COMPANY_REPOSITORY } from "../../core/domain/repositories/company.repository.interface";
import { CompanyRepository } from "../../core/infrastructure/repositories/company.repository";
import { CreateCompanyUseCase } from "../../core/application/use-cases/companies/create-company.use-case";
import { GetCompanyUseCase } from "../../core/application/use-cases/companies/get-company.use-case";
import { GetCompaniesUseCase } from "../../core/application/use-cases/companies/get-companies.use-case";
import { UpdateCompanyUseCase } from "../../core/application/use-cases/companies/update-company.use-case";
import { DeleteCompanyUseCase } from "../../core/application/use-cases/companies/delete-company.use-case";

@Module({
  imports: [AuthModule],
  controllers: [CompaniesController],
  providers: [
    { provide: COMPANY_REPOSITORY, useClass: CompanyRepository },
    CreateCompanyUseCase,
    GetCompanyUseCase,
    GetCompaniesUseCase,
    UpdateCompanyUseCase,
    DeleteCompanyUseCase,
  ],
  exports: [COMPANY_REPOSITORY],
})
export class CompaniesModule {}
