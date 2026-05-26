import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Role } from "../../../core/domain/enums/role.enum";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { Roles } from "../../auth/decorators/roles.decorator";
import { CurrentUser } from "../../auth/decorators/current-user.decorator";
import { CreateCompanyRegistrationRequestDto } from "../../../core/application/dto/company-registration-requests/create-company-registration-request.dto";
import { UpdateCompanyRegistrationRequestDto } from "../../../core/application/dto/company-registration-requests/update-company-registration-request.dto";
import { RejectCompanyRegistrationRequestDto } from "../../../core/application/dto/company-registration-requests/reject-company-registration-request.dto";
import { ApproveCompanyRegistrationRequestDto } from "../../../core/application/dto/company-registration-requests/approve-company-registration-request.dto";
import { ResendCompanyRegistrationRequestInviteDto } from "../../../core/application/dto/company-registration-requests/resend-company-registration-request-invite.dto";
import { ListCompanyRegistrationRequestsQueryDto } from "../../../core/application/dto/company-registration-requests/list-company-registration-requests-query.dto";
import {
  CompanyRegistrationRequestResponseDto,
  PaginatedCompanyRegistrationRequestsResponseDto,
} from "../../../core/application/dto/company-registration-requests/company-registration-request-response.dto";
import { ApproveCompanyRegistrationRequestResponseDto } from "../../../core/application/dto/company-registration-requests/approve-company-registration-request-response.dto";
import { CompanyResponseDto } from "../../../core/application/dto/companies/company-response.dto";
import { CreateCompanyRegistrationRequestUseCase } from "../../../core/application/use-cases/company-registration-requests/create-company-registration-request.use-case";
import { ListCompanyRegistrationRequestsUseCase } from "../../../core/application/use-cases/company-registration-requests/list-company-registration-requests.use-case";
import { GetCompanyRegistrationRequestUseCase } from "../../../core/application/use-cases/company-registration-requests/get-company-registration-request.use-case";
import { UpdateCompanyRegistrationRequestUseCase } from "../../../core/application/use-cases/company-registration-requests/update-company-registration-request.use-case";
import { RejectCompanyRegistrationRequestUseCase } from "../../../core/application/use-cases/company-registration-requests/reject-company-registration-request.use-case";
import { ApproveCompanyRegistrationRequestUseCase } from "../../../core/application/use-cases/company-registration-requests/approve-company-registration-request.use-case";
import { ResendCompanyRegistrationRequestInviteUseCase } from "../../../core/application/use-cases/company-registration-requests/resend-company-registration-request-invite.use-case";

@ApiTags("Company Registration Requests")
@Controller("company-requests")
export class CompanyRegistrationRequestsController {
  constructor(
    private readonly createUseCase: CreateCompanyRegistrationRequestUseCase,
    private readonly listUseCase: ListCompanyRegistrationRequestsUseCase,
    private readonly getUseCase: GetCompanyRegistrationRequestUseCase,
    private readonly updateUseCase: UpdateCompanyRegistrationRequestUseCase,
    private readonly rejectUseCase: RejectCompanyRegistrationRequestUseCase,
    private readonly approveUseCase: ApproveCompanyRegistrationRequestUseCase,
    private readonly resendInviteUseCase: ResendCompanyRegistrationRequestInviteUseCase,
  ) {}

  @Post()
  @ApiOperation({
    summary:
      "Enviar solicitud de registro de empresa (público, sin autenticación).",
  })
  async create(
    @Body() dto: CreateCompanyRegistrationRequestDto,
  ): Promise<CompanyRegistrationRequestResponseDto> {
    const entity = await this.createUseCase.execute(dto);
    return CompanyRegistrationRequestResponseDto.fromEntity(entity);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.OPS_ADMIN)
  @ApiOperation({
    summary: "Listar solicitudes de registro (admin Ofibites).",
  })
  async findAll(
    @Query() query: ListCompanyRegistrationRequestsQueryDto,
  ): Promise<PaginatedCompanyRegistrationRequestsResponseDto> {
    const result = await this.listUseCase.execute(query);
    return {
      data: result.data.map((entity) =>
        CompanyRegistrationRequestResponseDto.fromEntity(entity),
      ),
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
    };
  }

  @Get(":id")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.OPS_ADMIN)
  @ApiOperation({
    summary: "Obtener solicitud de registro por ID (admin Ofibites).",
  })
  async findOne(
    @Param("id", ParseUUIDPipe) id: string,
  ): Promise<CompanyRegistrationRequestResponseDto> {
    const entity = await this.getUseCase.execute(id);
    return CompanyRegistrationRequestResponseDto.fromEntity(entity);
  }

  @Patch(":id")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.OPS_ADMIN)
  @ApiOperation({
    summary:
      "Editar solicitud de registro antes de aprobar (solo si status=PENDING).",
  })
  async update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateCompanyRegistrationRequestDto,
  ): Promise<CompanyRegistrationRequestResponseDto> {
    const entity = await this.updateUseCase.execute(id, dto);
    return CompanyRegistrationRequestResponseDto.fromEntity(entity);
  }

  @Post(":id/reject")
  @HttpCode(200)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.OPS_ADMIN)
  @ApiOperation({
    summary:
      "Rechazar solicitud de registro con motivo (solo si status=PENDING). Envío de email queda pendiente.",
  })
  async reject(
    @Param("id", ParseUUIDPipe) id: string,
    @CurrentUser() user: { id: string },
    @Body() dto: RejectCompanyRegistrationRequestDto,
  ): Promise<CompanyRegistrationRequestResponseDto> {
    const entity = await this.rejectUseCase.execute(id, user.id, dto);
    return CompanyRegistrationRequestResponseDto.fromEntity(entity);
  }

  @Post(":id/approve")
  @HttpCode(200)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.OPS_ADMIN)
  @ApiOperation({
    summary:
      "Aprobar solicitud: crea la empresa, invita al contacto como COMPANY_ADMIN vía Supabase y marca la solicitud APPROVED.",
  })
  async approve(
    @Param("id", ParseUUIDPipe) id: string,
    @CurrentUser() user: { id: string },
    @Body() dto: ApproveCompanyRegistrationRequestDto,
  ): Promise<ApproveCompanyRegistrationRequestResponseDto> {
    const result = await this.approveUseCase.execute(id, user.id, dto);
    return {
      request: CompanyRegistrationRequestResponseDto.fromEntity(result.request),
      company: CompanyResponseDto.fromEntity(result.company),
      invitedAdmin: {
        email: result.invitedAdmin.email,
        name: result.invitedAdmin.name,
        inviteMessage:
          "Invitación enviada vía Supabase. El usuario recibirá un email para establecer contraseña.",
      },
    };
  }

  @Post(":id/resend-invite")
  @HttpCode(200)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.OPS_ADMIN)
  @ApiOperation({
    summary:
      "Reenviar invitación al primer COMPANY_ADMIN de una solicitud APPROVED (caso en que el email no llegó o el link expiró).",
  })
  async resendInvite(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: ResendCompanyRegistrationRequestInviteDto,
  ): Promise<{ email: string; name: string; message: string }> {
    return this.resendInviteUseCase.execute(id, dto);
  }
}
