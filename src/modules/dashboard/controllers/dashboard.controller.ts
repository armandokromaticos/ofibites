import {
  BadRequestException,
  Controller,
  Get,
  Headers,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { isUUID } from "class-validator";
import { Role } from "../../../core/domain/enums/role.enum";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { Roles } from "../../auth/decorators/roles.decorator";
import { CurrentUser } from "../../auth/decorators/current-user.decorator";
import { ClientDashboardResponseDto } from "../../../core/application/dto/dashboard/client-dashboard-response.dto";
import { AdminDashboardResponseDto } from "../../../core/application/dto/dashboard/admin-dashboard-response.dto";
import { GetClientDashboardUseCase } from "../../../core/application/use-cases/dashboard/get-client-dashboard.use-case";
import { GetAdminDashboardUseCase } from "../../../core/application/use-cases/dashboard/get-admin-dashboard.use-case";

@ApiTags("Dashboard")
@Controller("dashboard")
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class DashboardController {
  constructor(
    private readonly getClientDashboardUseCase: GetClientDashboardUseCase,
    private readonly getAdminDashboardUseCase: GetAdminDashboardUseCase,
  ) {}

  @Get("client")
  @Roles(Role.CLIENT)
  @ApiOperation({
    summary:
      "Indicadores del cliente: total de pedidos, en curso, pedidos por día y top del mes",
  })
  @ApiHeader({
    name: "X-Company-Id",
    required: false,
    description:
      "Si se envía, acota los indicadores a esa empresa (validando acceso del usuario).",
  })
  async getClientDashboard(
    @CurrentUser() user: { id: string; role: Role },
    @Headers("x-company-id") companyIdHeader?: string,
  ): Promise<ClientDashboardResponseDto> {
    const companyId = this.parseCompanyIdHeader(companyIdHeader);
    return this.getClientDashboardUseCase.execute(
      user.id,
      user.role,
      companyId,
    );
  }

  @Get("admin")
  @Roles(Role.SUPER_ADMIN, Role.OPS_ADMIN)
  @ApiOperation({
    summary:
      "Indicadores operativos de Ofibites: KPIs del día, facturación, recibidos por día, top productos/surtidos/empresas",
  })
  @ApiHeader({
    name: "X-Company-Id",
    required: false,
    description:
      "Si se envía, acota los indicadores a esa empresa; si no, abarca todas.",
  })
  async getAdminDashboard(
    @CurrentUser() user: { id: string; role: Role },
    @Headers("x-company-id") companyIdHeader?: string,
  ): Promise<AdminDashboardResponseDto> {
    const companyId = this.parseCompanyIdHeader(companyIdHeader);
    return this.getAdminDashboardUseCase.execute(user.id, user.role, companyId);
  }

  private parseCompanyIdHeader(value: string | undefined): string | undefined {
    if (!value) {
      return undefined;
    }
    const trimmed = value.trim();
    if (!trimmed) {
      return undefined;
    }
    if (!isUUID(trimmed, "4")) {
      throw new BadRequestException("X-Company-Id debe ser un UUID válido");
    }
    return trimmed;
  }
}
