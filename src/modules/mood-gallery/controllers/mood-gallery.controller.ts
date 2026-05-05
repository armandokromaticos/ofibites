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
import { CreateMoodGalleryDto } from "../../../core/application/dto/mood-gallery/create-mood-gallery.dto";
import { UpdateMoodGalleryDto } from "../../../core/application/dto/mood-gallery/update-mood-gallery.dto";
import { MoodGalleryResponseDto } from "../../../core/application/dto/mood-gallery/mood-gallery-response.dto";
import { CreateMoodGalleryUseCase } from "../../../core/application/use-cases/mood-gallery/create-mood-gallery.use-case";
import { GetMoodGalleriesUseCase } from "../../../core/application/use-cases/mood-gallery/get-mood-galleries.use-case";
import { GetMoodGalleryUseCase } from "../../../core/application/use-cases/mood-gallery/get-mood-gallery.use-case";
import { UpdateMoodGalleryUseCase } from "../../../core/application/use-cases/mood-gallery/update-mood-gallery.use-case";
import { DeleteMoodGalleryUseCase } from "../../../core/application/use-cases/mood-gallery/delete-mood-gallery.use-case";
import {
  UploadMoodGalleryImageUseCase,
  UploadFileInput,
} from "../../../core/application/use-cases/mood-gallery/upload-mood-gallery-image.use-case";
import { DeleteMoodGalleryImageUseCase } from "../../../core/application/use-cases/mood-gallery/delete-mood-gallery-image.use-case";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_IMAGE_TYPES = /^image\/(jpeg|png|webp)$/;

@ApiTags("Mood Gallery")
@Controller("mood-gallery")
export class MoodGalleryController {
  constructor(
    private readonly createMoodGalleryUseCase: CreateMoodGalleryUseCase,
    private readonly getMoodGalleriesUseCase: GetMoodGalleriesUseCase,
    private readonly getMoodGalleryUseCase: GetMoodGalleryUseCase,
    private readonly updateMoodGalleryUseCase: UpdateMoodGalleryUseCase,
    private readonly deleteMoodGalleryUseCase: DeleteMoodGalleryUseCase,
    private readonly uploadMoodGalleryImageUseCase: UploadMoodGalleryImageUseCase,
    private readonly deleteMoodGalleryImageUseCase: DeleteMoodGalleryImageUseCase,
  ) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: "Crear entrada de mood gallery" })
  async create(
    @Body() dto: CreateMoodGalleryDto,
  ): Promise<MoodGalleryResponseDto> {
    const entity = await this.createMoodGalleryUseCase.execute(dto);
    return entity.toResponseDto();
  }

  @Get()
  @ApiOperation({ summary: "Listar mood gallery (publico con filtros)" })
  @ApiQuery({ name: "section", required: false, example: "mood-carousel" })
  @ApiQuery({ name: "active", required: false, type: Boolean })
  async findAll(
    @Query("section") section?: string,
    @Query("active") active?: string,
  ): Promise<MoodGalleryResponseDto[]> {
    const activeOnly = active === "true";
    const entities = await this.getMoodGalleriesUseCase.execute(
      section,
      activeOnly,
    );
    return entities.map((item) => item.toResponseDto());
  }

  @Get(":id")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: "Obtener mood gallery por ID" })
  async findOne(
    @Param("id", ParseUUIDPipe) id: string,
  ): Promise<MoodGalleryResponseDto> {
    const entity = await this.getMoodGalleryUseCase.execute(id);
    return entity.toResponseDto();
  }

  @Patch(":id")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: "Actualizar mood gallery" })
  async update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateMoodGalleryDto,
  ): Promise<MoodGalleryResponseDto> {
    const entity = await this.updateMoodGalleryUseCase.execute(id, dto);
    return entity.toResponseDto();
  }

  @Delete(":id")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Eliminar mood gallery" })
  async remove(@Param("id", ParseUUIDPipe) id: string): Promise<void> {
    await this.deleteMoodGalleryUseCase.execute(id);
  }

  // ── Image Upload ──

  @Post(":id/image")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: "Subir imagen desktop de mood gallery" })
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
    FileInterceptor("file", { limits: { fileSize: MAX_IMAGE_SIZE } }),
  )
  async uploadImage(
    @Param("id", ParseUUIDPipe) id: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: MAX_IMAGE_SIZE }),
          new FileTypeValidator({ fileType: ALLOWED_IMAGE_TYPES }),
        ],
      }),
    )
    file: Express.Multer.File,
  ): Promise<MoodGalleryResponseDto> {
    const uploadInput: UploadFileInput = {
      buffer: file.buffer,
      mimetype: file.mimetype,
      originalname: file.originalname,
    };
    const entity = await this.uploadMoodGalleryImageUseCase.execute(
      id,
      "imageUrl",
      uploadInput,
    );
    return entity.toResponseDto();
  }

  @Post(":id/image-mobile")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: "Subir imagen mobile de mood gallery" })
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
    FileInterceptor("file", { limits: { fileSize: MAX_IMAGE_SIZE } }),
  )
  async uploadMobileImage(
    @Param("id", ParseUUIDPipe) id: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: MAX_IMAGE_SIZE }),
          new FileTypeValidator({ fileType: ALLOWED_IMAGE_TYPES }),
        ],
      }),
    )
    file: Express.Multer.File,
  ): Promise<MoodGalleryResponseDto> {
    const uploadInput: UploadFileInput = {
      buffer: file.buffer,
      mimetype: file.mimetype,
      originalname: file.originalname,
    };
    const entity = await this.uploadMoodGalleryImageUseCase.execute(
      id,
      "imageMobileUrl",
      uploadInput,
    );
    return entity.toResponseDto();
  }

  @Delete(":id/image")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Eliminar imagen desktop de mood gallery" })
  async deleteImage(
    @Param("id", ParseUUIDPipe) id: string,
  ): Promise<MoodGalleryResponseDto> {
    const entity = await this.deleteMoodGalleryImageUseCase.execute(
      id,
      "imageUrl",
    );
    return entity.toResponseDto();
  }

  @Delete(":id/image-mobile")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Eliminar imagen mobile de mood gallery" })
  async deleteMobileImage(
    @Param("id", ParseUUIDPipe) id: string,
  ): Promise<MoodGalleryResponseDto> {
    const entity = await this.deleteMoodGalleryImageUseCase.execute(
      id,
      "imageMobileUrl",
    );
    return entity.toResponseDto();
  }
}
