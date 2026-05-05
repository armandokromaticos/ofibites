import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { LoginDto } from "../../../core/application/dto/auth/login.dto";
import { RefreshTokenDto } from "../../../core/application/dto/auth/refresh-token.dto";
import { AuthResponseDto } from "../../../core/application/dto/auth/auth-response.dto";
import { MeResponseDto } from "../../../core/application/dto/auth/me-response.dto";
import { LoginUseCase } from "../../../core/application/use-cases/auth/login.use-case";
import { RefreshTokenUseCase } from "../../../core/application/use-cases/auth/refresh-token.use-case";
import { LogoutUseCase } from "../../../core/application/use-cases/auth/logout.use-case";
import { GetMeUseCase } from "../../../core/application/use-cases/auth/get-me.use-case";
import { CurrentUser } from "../decorators/current-user.decorator";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly getMeUseCase: GetMeUseCase,
  ) {}

  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Iniciar sesión" })
  async login(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    return this.loginUseCase.execute(dto);
  }

  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Refrescar tokens" })
  async refresh(@Body() dto: RefreshTokenDto): Promise<AuthResponseDto> {
    return this.refreshTokenUseCase.execute(dto);
  }

  @Post("logout")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Cerrar sesión" })
  async logout(@Headers("authorization") auth: string): Promise<void> {
    const token = auth?.replace("Bearer ", "");
    await this.logoutUseCase.execute(token);
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Obtener usuario autenticado y sus empresas",
    description:
      "Devuelve el perfil del usuario y la lista de empresas a las que pertenece (memberships) con su rol funcional, sede, departamento y permisos por empresa.",
  })
  async me(
    @CurrentUser() user: { authId: string },
  ): Promise<MeResponseDto> {
    return this.getMeUseCase.execute(user.authId);
  }
}
