import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";
import { CreateUserDto } from "../../../core/application/dto/users/create-user.dto";
import { UpdateUserDto } from "../../../core/application/dto/users/update-user.dto";
import { UserResponseDto } from "../../../core/application/dto/users/user-response.dto";
import { CreateUserUseCase } from "../../../core/application/use-cases/users/create-user.use-case";
import { GetUserUseCase } from "../../../core/application/use-cases/users/get-user.use-case";
import { GetUsersUseCase } from "../../../core/application/use-cases/users/get-users.use-case";
import { UpdateUserUseCase } from "../../../core/application/use-cases/users/update-user.use-case";
import { DeleteUserUseCase } from "../../../core/application/use-cases/users/delete-user.use-case";
import { Role } from "../../../core/domain/enums/role.enum";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { Roles } from "../../auth/decorators/roles.decorator";
import { CurrentUser } from "../../auth/decorators/current-user.decorator";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

@ApiTags("Users")
@Controller("users")
export class UsersController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly getUserUseCase: GetUserUseCase,
    private readonly getUsersUseCase: GetUsersUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: "Crear usuario (registro público)" })
  async create(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    const user = await this.createUserUseCase.execute(dto);
    return user.toResponse();
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.OPS_ADMIN, Role.FINANCE_ADMIN, Role.KAM)
  @ApiOperation({
    summary:
      "Listar usuarios (filtrado por empresa para KAM y admins)",
  })
  @ApiQuery({
    name: "companyId",
    required: false,
    description:
      "Filtra usuarios por empresa (devuelve los miembros activos). Requerido para KAM si quiere acotar.",
  })
  async findAll(
    @CurrentUser() caller: { id: string; role: Role },
    @Query("companyId") companyId?: string,
  ): Promise<UserResponseDto[]> {
    const parsedCompanyId = this.parseCompanyId(companyId);
    const users = await this.getUsersUseCase.execute(
      caller.id,
      caller.role,
      parsedCompanyId,
    );
    return users.map((user) => user.toResponse());
  }

  @Get(":id")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: "Obtener usuario por ID" })
  async findOne(@Param("id") id: string): Promise<UserResponseDto> {
    const user = await this.getUserUseCase.execute(id);
    return user.toResponse();
  }

  @Patch(":id")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: "Actualizar usuario" })
  async update(
    @Param("id") id: string,
    @Body() dto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const user = await this.updateUserUseCase.execute(id, dto);
    return user.toResponse();
  }

  @Delete(":id")
  @HttpCode(204)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: "Eliminar usuario" })
  async remove(@Param("id") id: string): Promise<void> {
    await this.deleteUserUseCase.execute(id);
  }

  private parseCompanyId(value: string | undefined): string | undefined {
    if (!value) {
      return undefined;
    }
    const trimmed = value.trim();
    if (!trimmed) {
      return undefined;
    }
    if (!UUID_REGEX.test(trimmed)) {
      throw new BadRequestException("companyId debe ser un UUID válido");
    }
    return trimmed;
  }
}
