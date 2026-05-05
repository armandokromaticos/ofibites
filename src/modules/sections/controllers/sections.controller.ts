import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseEnumPipe,
  ParseUUIDPipe,
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
import { Role } from "../../../core/domain/enums/role.enum";
import { Lang } from "../../../core/domain/enums/lang.enum";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { Roles } from "../../auth/decorators/roles.decorator";
import { CreateSectionDto } from "../../../core/application/dto/sections/create-section.dto";
import { UpdateSectionDto } from "../../../core/application/dto/sections/update-section.dto";
import { AddSectionItemDto } from "../../../core/application/dto/sections/add-section-item.dto";
import { ReorderSectionItemsDto } from "../../../core/application/dto/sections/reorder-section-items.dto";
import { SectionResponseDto } from "../../../core/application/dto/sections/section-response.dto";
import { CreateSectionUseCase } from "../../../core/application/use-cases/sections/create-section.use-case";
import { GetSectionsUseCase } from "../../../core/application/use-cases/sections/get-sections.use-case";
import { GetSectionBySlugUseCase } from "../../../core/application/use-cases/sections/get-section-by-slug.use-case";
import { GetSectionByIdUseCase } from "../../../core/application/use-cases/sections/get-section-by-id.use-case";
import { UpdateSectionUseCase } from "../../../core/application/use-cases/sections/update-section.use-case";
import { DeleteSectionUseCase } from "../../../core/application/use-cases/sections/delete-section.use-case";
import { AddItemToSectionUseCase } from "../../../core/application/use-cases/sections/add-item-to-section.use-case";
import { RemoveItemFromSectionUseCase } from "../../../core/application/use-cases/sections/remove-item-from-section.use-case";
import { ReorderSectionItemsUseCase } from "../../../core/application/use-cases/sections/reorder-section-items.use-case";

@ApiTags("Sections")
@Controller("sections")
export class SectionsController {
  constructor(
    private readonly createSectionUseCase: CreateSectionUseCase,
    private readonly getSectionsUseCase: GetSectionsUseCase,
    private readonly getSectionBySlugUseCase: GetSectionBySlugUseCase,
    private readonly getSectionByIdUseCase: GetSectionByIdUseCase,
    private readonly updateSectionUseCase: UpdateSectionUseCase,
    private readonly deleteSectionUseCase: DeleteSectionUseCase,
    private readonly addItemToSectionUseCase: AddItemToSectionUseCase,
    private readonly removeItemFromSectionUseCase: RemoveItemFromSectionUseCase,
    private readonly reorderSectionItemsUseCase: ReorderSectionItemsUseCase,
  ) {}

  // ── Public Endpoints ──

  @Get()
  @ApiOperation({ summary: "Listar secciones activas con items (público)" })
  @ApiQuery({ name: "lang", required: false, enum: Lang })
  async findActiveSections(
    @Query("lang", new DefaultValuePipe(Lang.ES), new ParseEnumPipe(Lang))
    lang: Lang,
  ): Promise<SectionResponseDto[]> {
    const entities = await this.getSectionsUseCase.execute(true);
    return entities.map((section) => section.toResponseDto(lang));
  }

  @Get("id/:id")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({
    summary: "Obtener sección por id con traducciones (admin)",
  })
  @ApiQuery({ name: "lang", required: false, enum: Lang })
  async findSectionById(
    @Param("id", ParseUUIDPipe) id: string,
    @Query("lang", new DefaultValuePipe(Lang.ES), new ParseEnumPipe(Lang))
    lang: Lang,
  ): Promise<SectionResponseDto> {
    const entity = await this.getSectionByIdUseCase.execute(id);
    return entity.toAdminResponseDto(lang);
  }

  @Get(":slug")
  @ApiOperation({ summary: "Obtener sección por slug (público)" })
  @ApiQuery({ name: "lang", required: false, enum: Lang })
  async findSectionBySlug(
    @Param("slug") slug: string,
    @Query("lang", new DefaultValuePipe(Lang.ES), new ParseEnumPipe(Lang))
    lang: Lang,
  ): Promise<SectionResponseDto> {
    const entity = await this.getSectionBySlugUseCase.execute(slug);
    return entity.toResponseDto(lang);
  }

  // ── Admin CRUD ──

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: "Crear sección" })
  @ApiQuery({ name: "lang", required: false, enum: Lang })
  async createSection(
    @Body() dto: CreateSectionDto,
    @Query("lang", new DefaultValuePipe(Lang.ES), new ParseEnumPipe(Lang))
    lang: Lang,
  ): Promise<SectionResponseDto> {
    const entity = await this.createSectionUseCase.execute(dto);
    return entity.toResponseDto(lang);
  }

  @Patch(":id")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: "Actualizar sección" })
  @ApiQuery({ name: "lang", required: false, enum: Lang })
  async updateSection(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateSectionDto,
    @Query("lang", new DefaultValuePipe(Lang.ES), new ParseEnumPipe(Lang))
    lang: Lang,
  ): Promise<SectionResponseDto> {
    const entity = await this.updateSectionUseCase.execute(id, dto);
    return entity.toResponseDto(lang);
  }

  @Delete(":id")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @HttpCode(204)
  @ApiOperation({ summary: "Eliminar sección" })
  async deleteSection(@Param("id", ParseUUIDPipe) id: string): Promise<void> {
    await this.deleteSectionUseCase.execute(id);
  }

  // ── Section Items ──

  @Post(":id/items")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: "Agregar item a sección" })
  @ApiQuery({ name: "lang", required: false, enum: Lang })
  async addItem(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: AddSectionItemDto,
    @Query("lang", new DefaultValuePipe(Lang.ES), new ParseEnumPipe(Lang))
    lang: Lang,
  ): Promise<SectionResponseDto> {
    const entity = await this.addItemToSectionUseCase.execute(id, dto);
    return entity.toResponseDto(lang);
  }

  @Delete(":id/items/:itemId")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @HttpCode(204)
  @ApiOperation({ summary: "Quitar item de sección" })
  async removeItem(
    @Param("id", ParseUUIDPipe) id: string,
    @Param("itemId", ParseUUIDPipe) itemId: string,
  ): Promise<void> {
    await this.removeItemFromSectionUseCase.execute(id, itemId);
  }

  @Patch(":id/items/reorder")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: "Reordenar items de sección" })
  @ApiQuery({ name: "lang", required: false, enum: Lang })
  async reorderItems(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: ReorderSectionItemsDto,
    @Query("lang", new DefaultValuePipe(Lang.ES), new ParseEnumPipe(Lang))
    lang: Lang,
  ): Promise<SectionResponseDto> {
    const entity = await this.reorderSectionItemsUseCase.execute(id, dto);
    return entity.toResponseDto(lang);
  }
}
