import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { Role } from "../../../core/domain/enums/role.enum";
import { CompanyRole } from "../../../core/domain/enums/company-role.enum";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { PlatformOrCompanyRoleGuard } from "../../auth/guards/platform-or-company-role.guard";
import { Roles } from "../../auth/decorators/roles.decorator";
import { PlatformOrCompanyRole } from "../../auth/decorators/platform-or-company-role.decorator";
import { CurrentUser } from "../../auth/decorators/current-user.decorator";
import { CreateCompanyMemberDto } from "../../../core/application/dto/company-members/create-company-member.dto";
import { InviteCompanyMemberDto } from "../../../core/application/dto/company-members/invite-company-member.dto";
import { UpdateCompanyMemberDto } from "../../../core/application/dto/company-members/update-company-member.dto";
import { CompanyMemberResponseDto } from "../../../core/application/dto/company-members/company-member-response.dto";
import { CreateCompanyMemberUseCase } from "../../../core/application/use-cases/company-members/create-company-member.use-case";
import { InviteCompanyMemberUseCase } from "../../../core/application/use-cases/company-members/invite-company-member.use-case";
import { GetCompanyMemberUseCase } from "../../../core/application/use-cases/company-members/get-company-member.use-case";
import { GetCompanyMembersUseCase } from "../../../core/application/use-cases/company-members/get-company-members.use-case";
import { UpdateCompanyMemberUseCase } from "../../../core/application/use-cases/company-members/update-company-member.use-case";
import { DeleteCompanyMemberUseCase } from "../../../core/application/use-cases/company-members/delete-company-member.use-case";

@ApiTags("Company Members")
@ApiBearerAuth()
@Controller("companies/:companyId/members")
@UseGuards(JwtAuthGuard, RolesGuard, PlatformOrCompanyRoleGuard)
export class CompanyMembersController {
  constructor(
    private readonly createUseCase: CreateCompanyMemberUseCase,
    private readonly inviteUseCase: InviteCompanyMemberUseCase,
    private readonly getUseCase: GetCompanyMemberUseCase,
    private readonly getAllUseCase: GetCompanyMembersUseCase,
    private readonly updateUseCase: UpdateCompanyMemberUseCase,
    private readonly deleteUseCase: DeleteCompanyMemberUseCase,
  ) {}

  @Post()
  @PlatformOrCompanyRole({
    platformRoles: [Role.SUPER_ADMIN, Role.OPS_ADMIN],
    companyRoles: [CompanyRole.COMPANY_ADMIN],
  })
  @ApiOperation({ summary: "Agregar miembro a la empresa" })
  async create(
    @Param("companyId", ParseUUIDPipe) companyId: string,
    @Body() dto: CreateCompanyMemberDto,
  ): Promise<CompanyMemberResponseDto> {
    const member = await this.createUseCase.execute(companyId, dto);
    return CompanyMemberResponseDto.fromEntity(member);
  }

  @Post("invite")
  @PlatformOrCompanyRole({
    platformRoles: [Role.SUPER_ADMIN, Role.OPS_ADMIN],
    companyRoles: [CompanyRole.COMPANY_ADMIN],
  })
  @ApiOperation({
    summary:
      "Invitar nuevo miembro (crea User + envia email via Supabase). 409 si el email ya existe.",
  })
  @ApiResponse({
    status: 201,
    description: "Miembro invitado. Supabase envió email de confirmación.",
    type: CompanyMemberResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: "Validación fallida (branch/department de otra empresa, etc).",
  })
  @ApiResponse({ status: 404, description: "Company no encontrada." })
  @ApiResponse({
    status: 409,
    description:
      "El email ya existe en la plataforma. Usar POST /companies/:companyId/members con el userId existente.",
  })
  @ApiResponse({
    status: 429,
    description:
      "Supabase rechazó el envío por límite de tasa (SMTP default). Reintentar o configurar SMTP custom.",
  })
  async invite(
    @Param("companyId", ParseUUIDPipe) companyId: string,
    @Body() dto: InviteCompanyMemberDto,
  ): Promise<CompanyMemberResponseDto> {
    const member = await this.inviteUseCase.execute(companyId, dto);
    return CompanyMemberResponseDto.fromEntity(member);
  }

  @Get()
  @Roles(
    Role.SUPER_ADMIN,
    Role.OPS_ADMIN,
    Role.FINANCE_ADMIN,
    Role.KAM,
    Role.CLIENT,
  )
  @ApiOperation({ summary: "Listar miembros de la empresa" })
  async findAll(
    @Param("companyId", ParseUUIDPipe) companyId: string,
    @CurrentUser() user: { id: string; role: Role },
  ): Promise<CompanyMemberResponseDto[]> {
    const members = await this.getAllUseCase.execute(
      companyId,
      user.id,
      user.role,
    );
    return members.map((m) => CompanyMemberResponseDto.fromEntity(m));
  }

  @Get(":id")
  @Roles(
    Role.SUPER_ADMIN,
    Role.OPS_ADMIN,
    Role.FINANCE_ADMIN,
    Role.KAM,
    Role.CLIENT,
  )
  @ApiOperation({ summary: "Obtener miembro" })
  async findOne(
    @Param("companyId", ParseUUIDPipe) companyId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @CurrentUser() user: { id: string; role: Role },
  ): Promise<CompanyMemberResponseDto> {
    const member = await this.getUseCase.execute(
      companyId,
      id,
      user.id,
      user.role,
    );
    return CompanyMemberResponseDto.fromEntity(member);
  }

  @Patch(":id")
  @PlatformOrCompanyRole({
    platformRoles: [Role.SUPER_ADMIN, Role.OPS_ADMIN],
    companyRoles: [CompanyRole.COMPANY_ADMIN],
  })
  @ApiOperation({ summary: "Actualizar miembro" })
  async update(
    @Param("companyId", ParseUUIDPipe) companyId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateCompanyMemberDto,
  ): Promise<CompanyMemberResponseDto> {
    const member = await this.updateUseCase.execute(companyId, id, dto);
    return CompanyMemberResponseDto.fromEntity(member);
  }

  @Delete(":id")
  @HttpCode(204)
  @PlatformOrCompanyRole({
    platformRoles: [Role.SUPER_ADMIN, Role.OPS_ADMIN],
    companyRoles: [CompanyRole.COMPANY_ADMIN],
  })
  @ApiOperation({ summary: "Eliminar miembro" })
  async remove(
    @Param("companyId", ParseUUIDPipe) companyId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.deleteUseCase.execute(companyId, id);
  }
}
