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
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { Roles } from "../../auth/decorators/roles.decorator";
import { CurrentUser } from "../../auth/decorators/current-user.decorator";
import { CreateBranchDto } from "../../../core/application/dto/branches/create-branch.dto";
import { UpdateBranchDto } from "../../../core/application/dto/branches/update-branch.dto";
import { BranchResponseDto } from "../../../core/application/dto/branches/branch-response.dto";
import { CreateBranchUseCase } from "../../../core/application/use-cases/branches/create-branch.use-case";
import { GetBranchUseCase } from "../../../core/application/use-cases/branches/get-branch.use-case";
import { GetBranchesUseCase } from "../../../core/application/use-cases/branches/get-branches.use-case";
import { UpdateBranchUseCase } from "../../../core/application/use-cases/branches/update-branch.use-case";
import { DeleteBranchUseCase } from "../../../core/application/use-cases/branches/delete-branch.use-case";

@ApiTags("Branches")
@ApiBearerAuth()
@Controller("companies/:companyId/branches")
@UseGuards(JwtAuthGuard, RolesGuard)
export class BranchesController {
  constructor(
    private readonly createBranchUseCase: CreateBranchUseCase,
    private readonly getBranchUseCase: GetBranchUseCase,
    private readonly getBranchesUseCase: GetBranchesUseCase,
    private readonly updateBranchUseCase: UpdateBranchUseCase,
    private readonly deleteBranchUseCase: DeleteBranchUseCase,
  ) {}

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.OPS_ADMIN)
  @ApiOperation({ summary: "Crear sede" })
  async create(
    @Param("companyId", ParseUUIDPipe) companyId: string,
    @Body() dto: CreateBranchDto,
  ): Promise<BranchResponseDto> {
    const branch = await this.createBranchUseCase.execute(companyId, dto);
    return BranchResponseDto.fromEntity(branch);
  }

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.OPS_ADMIN, Role.FINANCE_ADMIN, Role.KAM)
  @ApiOperation({ summary: "Listar sedes de la empresa" })
  async findAll(
    @Param("companyId", ParseUUIDPipe) companyId: string,
    @CurrentUser() user: { id: string; role: Role },
  ): Promise<BranchResponseDto[]> {
    const branches = await this.getBranchesUseCase.execute(
      companyId,
      user.id,
      user.role,
    );
    return branches.map((b) => BranchResponseDto.fromEntity(b));
  }

  @Get(":id")
  @Roles(Role.SUPER_ADMIN, Role.OPS_ADMIN, Role.FINANCE_ADMIN, Role.KAM)
  @ApiOperation({ summary: "Obtener sede" })
  async findOne(
    @Param("companyId", ParseUUIDPipe) companyId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @CurrentUser() user: { id: string; role: Role },
  ): Promise<BranchResponseDto> {
    const branch = await this.getBranchUseCase.execute(
      companyId,
      id,
      user.id,
      user.role,
    );
    return BranchResponseDto.fromEntity(branch);
  }

  @Patch(":id")
  @Roles(Role.SUPER_ADMIN, Role.OPS_ADMIN)
  @ApiOperation({ summary: "Actualizar sede" })
  async update(
    @Param("companyId", ParseUUIDPipe) companyId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateBranchDto,
  ): Promise<BranchResponseDto> {
    const branch = await this.updateBranchUseCase.execute(companyId, id, dto);
    return BranchResponseDto.fromEntity(branch);
  }

  @Delete(":id")
  @HttpCode(204)
  @Roles(Role.SUPER_ADMIN, Role.OPS_ADMIN)
  @ApiOperation({ summary: "Eliminar sede" })
  async remove(
    @Param("companyId", ParseUUIDPipe) companyId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.deleteBranchUseCase.execute(companyId, id);
  }
}
