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
import { CreateBannerDto } from "../../../core/application/dto/banners/create-banner.dto";
import { UpdateBannerDto } from "../../../core/application/dto/banners/update-banner.dto";
import { BannerResponseDto } from "../../../core/application/dto/banners/banner-response.dto";
import { CreateBannerUseCase } from "../../../core/application/use-cases/banners/create-banner.use-case";
import { GetBannersUseCase } from "../../../core/application/use-cases/banners/get-banners.use-case";
import { GetBannerUseCase } from "../../../core/application/use-cases/banners/get-banner.use-case";
import { UpdateBannerUseCase } from "../../../core/application/use-cases/banners/update-banner.use-case";
import { DeleteBannerUseCase } from "../../../core/application/use-cases/banners/delete-banner.use-case";
import {
  UploadBannerImageUseCase,
  UploadFileInput,
} from "../../../core/application/use-cases/banners/upload-banner-image.use-case";
import { DeleteBannerImageUseCase } from "../../../core/application/use-cases/banners/delete-banner-image.use-case";

@ApiTags("Banners")
@Controller("banners")
export class BannersController {
  constructor(
    private readonly createBannerUseCase: CreateBannerUseCase,
    private readonly getBannersUseCase: GetBannersUseCase,
    private readonly getBannerUseCase: GetBannerUseCase,
    private readonly updateBannerUseCase: UpdateBannerUseCase,
    private readonly deleteBannerUseCase: DeleteBannerUseCase,
    private readonly uploadBannerImageUseCase: UploadBannerImageUseCase,
    private readonly deleteBannerImageUseCase: DeleteBannerImageUseCase,
  ) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: "Crear banner" })
  async createBanner(@Body() dto: CreateBannerDto): Promise<BannerResponseDto> {
    const entity = await this.createBannerUseCase.execute(dto);
    return entity.toResponseDto();
  }

  @Get()
  @ApiOperation({ summary: "Listar banners (publico con filtros)" })
  @ApiQuery({ name: "section", required: false, example: "home-carousel" })
  @ApiQuery({ name: "active", required: false, type: Boolean })
  async findAllBanners(
    @Query("section") section?: string,
    @Query("active") active?: string,
  ): Promise<BannerResponseDto[]> {
    const activeOnly = active === "true";
    const entities = await this.getBannersUseCase.execute(section, activeOnly);
    return entities.map((banner) => banner.toResponseDto());
  }

  @Get(":id")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: "Obtener banner por ID" })
  async findOneBanner(
    @Param("id", ParseUUIDPipe) id: string,
  ): Promise<BannerResponseDto> {
    const entity = await this.getBannerUseCase.execute(id);
    return entity.toResponseDto();
  }

  @Patch(":id")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: "Actualizar banner" })
  async updateBanner(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateBannerDto,
  ): Promise<BannerResponseDto> {
    const entity = await this.updateBannerUseCase.execute(id, dto);
    return entity.toResponseDto();
  }

  @Delete(":id")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Eliminar banner" })
  async deleteBanner(@Param("id", ParseUUIDPipe) id: string): Promise<void> {
    await this.deleteBannerUseCase.execute(id);
  }

  // ── Image Upload ──

  @Post(":id/image")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: "Subir imagen desktop del banner" })
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
  ): Promise<BannerResponseDto> {
    const uploadInput: UploadFileInput = {
      buffer: file.buffer,
      mimetype: file.mimetype,
      originalname: file.originalname,
    };
    const entity = await this.uploadBannerImageUseCase.execute(
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
  @ApiOperation({ summary: "Subir imagen mobile del banner" })
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
  async uploadMobileImage(
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
  ): Promise<BannerResponseDto> {
    const uploadInput: UploadFileInput = {
      buffer: file.buffer,
      mimetype: file.mimetype,
      originalname: file.originalname,
    };
    const entity = await this.uploadBannerImageUseCase.execute(
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
  @ApiOperation({ summary: "Eliminar imagen desktop del banner" })
  async deleteImage(
    @Param("id", ParseUUIDPipe) id: string,
  ): Promise<BannerResponseDto> {
    const entity = await this.deleteBannerImageUseCase.execute(id, "imageUrl");
    return entity.toResponseDto();
  }

  @Delete(":id/image-mobile")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Eliminar imagen mobile del banner" })
  async deleteMobileImage(
    @Param("id", ParseUUIDPipe) id: string,
  ): Promise<BannerResponseDto> {
    const entity = await this.deleteBannerImageUseCase.execute(
      id,
      "imageMobileUrl",
    );
    return entity.toResponseDto();
  }
}
