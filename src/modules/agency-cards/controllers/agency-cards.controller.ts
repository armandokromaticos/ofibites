import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import "multer";
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";
import { Role } from "../../../core/domain/enums/role.enum";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { Roles } from "../../auth/decorators/roles.decorator";
import { CreateAgencyCardDto } from "../../../core/application/dto/agency-cards/create-agency-card.dto";
import { UpdateAgencyCardDto } from "../../../core/application/dto/agency-cards/update-agency-card.dto";
import { AgencyCardResponseDto } from "../../../core/application/dto/agency-cards/agency-card-response.dto";
import { CreateAgencyCardUseCase } from "../../../core/application/use-cases/agency-cards/create-agency-card.use-case";
import { GetAgencyCardsUseCase } from "../../../core/application/use-cases/agency-cards/get-agency-cards.use-case";
import { GetAgencyCardUseCase } from "../../../core/application/use-cases/agency-cards/get-agency-card.use-case";
import { UpdateAgencyCardUseCase } from "../../../core/application/use-cases/agency-cards/update-agency-card.use-case";
import { DeleteAgencyCardUseCase } from "../../../core/application/use-cases/agency-cards/delete-agency-card.use-case";
import {
  UploadAgencyCardImageUseCase,
  UploadFileInput,
} from "../../../core/application/use-cases/agency-cards/upload-agency-card-image.use-case";
import { DeleteAgencyCardImageUseCase } from "../../../core/application/use-cases/agency-cards/delete-agency-card-image.use-case";

@ApiTags("Agency Cards")
@Controller("agency-cards")
export class AgencyCardsController {
  constructor(
    private readonly createAgencyCardUseCase: CreateAgencyCardUseCase,
    private readonly getAgencyCardsUseCase: GetAgencyCardsUseCase,
    private readonly getAgencyCardUseCase: GetAgencyCardUseCase,
    private readonly updateAgencyCardUseCase: UpdateAgencyCardUseCase,
    private readonly deleteAgencyCardUseCase: DeleteAgencyCardUseCase,
    private readonly uploadAgencyCardImageUseCase: UploadAgencyCardImageUseCase,
    private readonly deleteAgencyCardImageUseCase: DeleteAgencyCardImageUseCase,
  ) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: "Crear agency card" })
  async create(
    @Body() dto: CreateAgencyCardDto,
  ): Promise<AgencyCardResponseDto> {
    const entity = await this.createAgencyCardUseCase.execute(dto);
    return entity.toResponseDto();
  }

  @Get()
  @ApiOperation({ summary: "Listar agency cards (publico con filtros)" })
  @ApiQuery({ name: "active", required: false, type: Boolean })
  async findAll(
    @Query("active") active?: string,
  ): Promise<AgencyCardResponseDto[]> {
    const activeFilter =
      active === "true" ? true : active === "false" ? false : undefined;
    const entities = await this.getAgencyCardsUseCase.execute(activeFilter);
    return entities.map((card) => card.toResponseDto());
  }

  @Get(":id")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: "Obtener agency card por ID" })
  async findOne(
    @Param("id", ParseUUIDPipe) id: string,
  ): Promise<AgencyCardResponseDto> {
    const entity = await this.getAgencyCardUseCase.execute(id);
    return entity.toResponseDto();
  }

  @Patch(":id")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: "Actualizar agency card" })
  async update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateAgencyCardDto,
  ): Promise<AgencyCardResponseDto> {
    const entity = await this.updateAgencyCardUseCase.execute(id, dto);
    return entity.toResponseDto();
  }

  @Delete(":id")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Eliminar agency card" })
  async delete(@Param("id", ParseUUIDPipe) id: string): Promise<void> {
    await this.deleteAgencyCardUseCase.execute(id);
  }

  // ── Image Upload ──

  @Post(":id/image")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: "Subir imagen de la agency card" })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        file: { type: "string", format: "binary" },
      },
      required: ["file"],
    },
  })
  @UseInterceptors(
    FileInterceptor("file", { limits: { fileSize: 5 * 1024 * 1024 } }),
  )
  async uploadImage(
    @Param("id", ParseUUIDPipe) id: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /^image\/(jpeg|png|webp)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ): Promise<AgencyCardResponseDto> {
    const uploadInput: UploadFileInput = {
      buffer: file.buffer,
      mimetype: file.mimetype,
      originalname: file.originalname,
    };
    const entity = await this.uploadAgencyCardImageUseCase.execute(
      id,
      uploadInput,
    );
    return entity.toResponseDto();
  }

  @Delete(":id/image")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Eliminar imagen de la agency card" })
  async deleteImage(
    @Param("id", ParseUUIDPipe) id: string,
  ): Promise<AgencyCardResponseDto> {
    const entity = await this.deleteAgencyCardImageUseCase.execute(id);
    return entity.toResponseDto();
  }
}
