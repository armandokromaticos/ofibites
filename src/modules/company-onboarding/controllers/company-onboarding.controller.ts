import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { Role } from "../../../core/domain/enums/role.enum";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { Roles } from "../../auth/decorators/roles.decorator";
import { CreateManualCompanyDto } from "../../../core/application/dto/companies/create-manual-company.dto";
import { CreateManualCompanyResponseDto } from "../../../core/application/dto/companies/create-manual-company-response.dto";
import { CompanyResponseDto } from "../../../core/application/dto/companies/company-response.dto";
import { CompanyMemberResponseDto } from "../../../core/application/dto/company-members/company-member-response.dto";
import { CreateManualCompanyUseCase } from "../../../core/application/use-cases/companies/create-manual-company.use-case";

@ApiTags("Companies")
@ApiBearerAuth()
@Controller("companies")
@UseGuards(JwtAuthGuard, RolesGuard)
export class CompanyOnboardingController {
  constructor(
    private readonly createManualCompanyUseCase: CreateManualCompanyUseCase,
  ) {}

  @Post("manual")
  @Roles(Role.SUPER_ADMIN, Role.OPS_ADMIN)
  @ApiOperation({
    summary:
      "Alta manual de empresa (admin Ofibites): crea la empresa e invita al primer COMPANY_ADMIN en un solo flujo, con rollback de la empresa si la invitación falla.",
  })
  @ApiResponse({
    status: 201,
    description: "Empresa creada y primer admin invitado.",
    type: CreateManualCompanyResponseDto,
  })
  @ApiResponse({
    status: 409,
    description:
      "Ya existe una empresa con ese taxId, o el email del admin ya existe en la plataforma.",
  })
  async createManual(
    @Body() dto: CreateManualCompanyDto,
  ): Promise<CreateManualCompanyResponseDto> {
    const { company, member } =
      await this.createManualCompanyUseCase.execute(dto);
    return {
      company: CompanyResponseDto.fromEntity(company),
      member: CompanyMemberResponseDto.fromEntity(member),
      inviteMessage:
        "Empresa creada e invitación enviada al primer administrador vía Supabase.",
    };
  }
}
