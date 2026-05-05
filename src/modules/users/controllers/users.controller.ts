import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
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
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: "Listar usuarios" })
  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.getUsersUseCase.execute();
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
}
