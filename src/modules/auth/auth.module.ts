import { Module } from "@nestjs/common";
import { USER_REPOSITORY } from "../../core/domain/repositories/user.repository.interface";
import { COMPANY_MEMBER_REPOSITORY } from "../../core/domain/repositories/company-member.repository.interface";
import { COMPANY_KAM_REPOSITORY } from "../../core/domain/repositories/company-kam.repository.interface";
import { UserRepository } from "../../core/infrastructure/repositories/user.repository";
import { CompanyMemberRepository } from "../../core/infrastructure/repositories/company-member.repository";
import { CompanyKamRepository } from "../../core/infrastructure/repositories/company-kam.repository";
import { LoginUseCase } from "../../core/application/use-cases/auth/login.use-case";
import { RefreshTokenUseCase } from "../../core/application/use-cases/auth/refresh-token.use-case";
import { LogoutUseCase } from "../../core/application/use-cases/auth/logout.use-case";
import { GetMeUseCase } from "../../core/application/use-cases/auth/get-me.use-case";
import { AuthController } from "./controllers/auth.controller";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { RolesGuard } from "./guards/roles.guard";
import { OptionalJwtAuthGuard } from "./guards/optional-jwt-auth.guard";
import { CompanyRoleGuard } from "./guards/company-role.guard";

@Module({
  controllers: [AuthController],
  providers: [
    {
      provide: USER_REPOSITORY,
      useClass: UserRepository,
    },
    {
      provide: COMPANY_MEMBER_REPOSITORY,
      useClass: CompanyMemberRepository,
    },
    {
      provide: COMPANY_KAM_REPOSITORY,
      useClass: CompanyKamRepository,
    },
    LoginUseCase,
    RefreshTokenUseCase,
    LogoutUseCase,
    GetMeUseCase,
    JwtAuthGuard,
    RolesGuard,
    OptionalJwtAuthGuard,
    CompanyRoleGuard,
  ],
  exports: [
    JwtAuthGuard,
    RolesGuard,
    OptionalJwtAuthGuard,
    CompanyRoleGuard,
    USER_REPOSITORY,
    COMPANY_MEMBER_REPOSITORY,
    COMPANY_KAM_REPOSITORY,
  ],
})
export class AuthModule {}
