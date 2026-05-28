import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { CompaniesModule } from "../companies/companies.module";
import { CompanyMembersModule } from "../company-members/company-members.module";
import { CompanyOnboardingController } from "./controllers/company-onboarding.controller";
import { CreateManualCompanyUseCase } from "../../core/application/use-cases/companies/create-manual-company.use-case";

@Module({
  imports: [AuthModule, CompaniesModule, CompanyMembersModule],
  controllers: [CompanyOnboardingController],
  providers: [CreateManualCompanyUseCase],
})
export class CompanyOnboardingModule {}
