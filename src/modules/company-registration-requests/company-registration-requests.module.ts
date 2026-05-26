import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { CompaniesModule } from "../companies/companies.module";
import { CompanyRegistrationRequestsController } from "./controllers/company-registration-requests.controller";
import { COMPANY_REGISTRATION_REQUEST_REPOSITORY } from "../../core/domain/repositories/company-registration-request.repository.interface";
import { CompanyRegistrationRequestRepository } from "../../core/infrastructure/repositories/company-registration-request.repository";
import { CreateCompanyRegistrationRequestUseCase } from "../../core/application/use-cases/company-registration-requests/create-company-registration-request.use-case";
import { ListCompanyRegistrationRequestsUseCase } from "../../core/application/use-cases/company-registration-requests/list-company-registration-requests.use-case";
import { GetCompanyRegistrationRequestUseCase } from "../../core/application/use-cases/company-registration-requests/get-company-registration-request.use-case";
import { UpdateCompanyRegistrationRequestUseCase } from "../../core/application/use-cases/company-registration-requests/update-company-registration-request.use-case";
import { RejectCompanyRegistrationRequestUseCase } from "../../core/application/use-cases/company-registration-requests/reject-company-registration-request.use-case";
import { ApproveCompanyRegistrationRequestUseCase } from "../../core/application/use-cases/company-registration-requests/approve-company-registration-request.use-case";
import { ResendCompanyRegistrationRequestInviteUseCase } from "../../core/application/use-cases/company-registration-requests/resend-company-registration-request-invite.use-case";

@Module({
  imports: [AuthModule, CompaniesModule],
  controllers: [CompanyRegistrationRequestsController],
  providers: [
    {
      provide: COMPANY_REGISTRATION_REQUEST_REPOSITORY,
      useClass: CompanyRegistrationRequestRepository,
    },
    CreateCompanyRegistrationRequestUseCase,
    ListCompanyRegistrationRequestsUseCase,
    GetCompanyRegistrationRequestUseCase,
    UpdateCompanyRegistrationRequestUseCase,
    RejectCompanyRegistrationRequestUseCase,
    ApproveCompanyRegistrationRequestUseCase,
    ResendCompanyRegistrationRequestInviteUseCase,
  ],
  exports: [COMPANY_REGISTRATION_REQUEST_REPOSITORY],
})
export class CompanyRegistrationRequestsModule {}
