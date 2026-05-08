import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { CompaniesModule } from "../companies/companies.module";
import { CompanyAddressesController } from "./controllers/company-addresses.controller";
import { COMPANY_ADDRESS_REPOSITORY } from "../../core/domain/repositories/company-address.repository.interface";
import { CompanyAddressRepository } from "../../core/infrastructure/repositories/company-address.repository";
import { CreateCompanyAddressUseCase } from "../../core/application/use-cases/company-addresses/create-company-address.use-case";
import { GetCompanyAddressUseCase } from "../../core/application/use-cases/company-addresses/get-company-address.use-case";
import { GetCompanyAddressesUseCase } from "../../core/application/use-cases/company-addresses/get-company-addresses.use-case";
import { UpdateCompanyAddressUseCase } from "../../core/application/use-cases/company-addresses/update-company-address.use-case";
import { DeleteCompanyAddressUseCase } from "../../core/application/use-cases/company-addresses/delete-company-address.use-case";

@Module({
  imports: [AuthModule, CompaniesModule],
  controllers: [CompanyAddressesController],
  providers: [
    {
      provide: COMPANY_ADDRESS_REPOSITORY,
      useClass: CompanyAddressRepository,
    },
    CreateCompanyAddressUseCase,
    GetCompanyAddressUseCase,
    GetCompanyAddressesUseCase,
    UpdateCompanyAddressUseCase,
    DeleteCompanyAddressUseCase,
  ],
  exports: [COMPANY_ADDRESS_REPOSITORY],
})
export class CompanyAddressesModule {}
