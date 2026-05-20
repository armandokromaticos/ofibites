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
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Role } from "../../../core/domain/enums/role.enum";
import { CompanyRole } from "../../../core/domain/enums/company-role.enum";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { PlatformOrCompanyRoleGuard } from "../../auth/guards/platform-or-company-role.guard";
import { Roles } from "../../auth/decorators/roles.decorator";
import { PlatformOrCompanyRole } from "../../auth/decorators/platform-or-company-role.decorator";
import { CurrentUser } from "../../auth/decorators/current-user.decorator";
import { CreateDepartmentDto } from "../../../core/application/dto/departments/create-department.dto";
import { UpdateDepartmentDto } from "../../../core/application/dto/departments/update-department.dto";
import { DepartmentResponseDto } from "../../../core/application/dto/departments/department-response.dto";
import { CreateDepartmentUseCase } from "../../../core/application/use-cases/departments/create-department.use-case";
import { GetDepartmentUseCase } from "../../../core/application/use-cases/departments/get-department.use-case";
import { GetDepartmentsUseCase } from "../../../core/application/use-cases/departments/get-departments.use-case";
import { UpdateDepartmentUseCase } from "../../../core/application/use-cases/departments/update-department.use-case";
import { DeleteDepartmentUseCase } from "../../../core/application/use-cases/departments/delete-department.use-case";

@ApiTags("Departments")
@ApiBearerAuth()
@Controller("companies/:companyId/departments")
@UseGuards(JwtAuthGuard, RolesGuard, PlatformOrCompanyRoleGuard)
export class DepartmentsController {
  constructor(
    private readonly createDepartmentUseCase: CreateDepartmentUseCase,
    private readonly getDepartmentUseCase: GetDepartmentUseCase,
    private readonly getDepartmentsUseCase: GetDepartmentsUseCase,
    private readonly updateDepartmentUseCase: UpdateDepartmentUseCase,
    private readonly deleteDepartmentUseCase: DeleteDepartmentUseCase,
  ) {}

  @Post()
  @PlatformOrCompanyRole({
    platformRoles: [Role.SUPER_ADMIN, Role.OPS_ADMIN],
    companyRoles: [CompanyRole.COMPANY_ADMIN],
  })
  @ApiOperation({ summary: "Crear departamento" })
  async create(
    @Param("companyId", ParseUUIDPipe) companyId: string,
    @Body() dto: CreateDepartmentDto,
  ): Promise<DepartmentResponseDto> {
    const department = await this.createDepartmentUseCase.execute(
      companyId,
      dto,
    );
    return DepartmentResponseDto.fromEntity(department);
  }

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.OPS_ADMIN, Role.CLIENT)
  @ApiOperation({ summary: "Listar departamentos de la empresa" })
  async findAll(
    @Param("companyId", ParseUUIDPipe) companyId: string,
    @CurrentUser() user: { id: string; role: Role },
  ): Promise<DepartmentResponseDto[]> {
    const departments = await this.getDepartmentsUseCase.execute(
      companyId,
      user.id,
      user.role,
    );
    return departments.map((d) => DepartmentResponseDto.fromEntity(d));
  }

  @Get(":id")
  @Roles(Role.SUPER_ADMIN, Role.OPS_ADMIN, Role.CLIENT)
  @ApiOperation({ summary: "Obtener departamento" })
  async findOne(
    @Param("companyId", ParseUUIDPipe) companyId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @CurrentUser() user: { id: string; role: Role },
  ): Promise<DepartmentResponseDto> {
    const department = await this.getDepartmentUseCase.execute(
      companyId,
      id,
      user.id,
      user.role,
    );
    return DepartmentResponseDto.fromEntity(department);
  }

  @Patch(":id")
  @PlatformOrCompanyRole({
    platformRoles: [Role.SUPER_ADMIN, Role.OPS_ADMIN],
    companyRoles: [CompanyRole.COMPANY_ADMIN],
  })
  @ApiOperation({ summary: "Actualizar departamento" })
  async update(
    @Param("companyId", ParseUUIDPipe) companyId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateDepartmentDto,
  ): Promise<DepartmentResponseDto> {
    const department = await this.updateDepartmentUseCase.execute(
      companyId,
      id,
      dto,
    );
    return DepartmentResponseDto.fromEntity(department);
  }

  @Delete(":id")
  @HttpCode(204)
  @PlatformOrCompanyRole({
    platformRoles: [Role.SUPER_ADMIN, Role.OPS_ADMIN],
    companyRoles: [CompanyRole.COMPANY_ADMIN],
  })
  @ApiOperation({ summary: "Eliminar departamento" })
  async remove(
    @Param("companyId", ParseUUIDPipe) companyId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.deleteDepartmentUseCase.execute(companyId, id);
  }
}
