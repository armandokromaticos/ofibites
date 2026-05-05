import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
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
import { Lang } from "../../../core/domain/enums/lang.enum";
import { Role } from "../../../core/domain/enums/role.enum";
import { CouponType } from "../../../core/domain/enums/coupon-type.enum";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { Roles } from "../../auth/decorators/roles.decorator";
import { CreateCouponDto } from "../../../core/application/dto/coupons/create-coupon.dto";
import { UpdateCouponDto } from "../../../core/application/dto/coupons/update-coupon.dto";
import { CouponResponseDto } from "../../../core/application/dto/coupons/coupon-response.dto";
import { CreateCouponUseCase } from "../../../core/application/use-cases/coupons/create-coupon.use-case";
import { GetCouponsUseCase } from "../../../core/application/use-cases/coupons/get-coupons.use-case";
import { GetCouponUseCase } from "../../../core/application/use-cases/coupons/get-coupon.use-case";
import { UpdateCouponUseCase } from "../../../core/application/use-cases/coupons/update-coupon.use-case";
import { ToggleCouponUseCase } from "../../../core/application/use-cases/coupons/toggle-coupon.use-case";

@ApiTags("Coupons")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("coupons")
export class CouponsController {
  constructor(
    private readonly createCouponUseCase: CreateCouponUseCase,
    private readonly getCouponsUseCase: GetCouponsUseCase,
    private readonly getCouponUseCase: GetCouponUseCase,
    private readonly updateCouponUseCase: UpdateCouponUseCase,
    private readonly toggleCouponUseCase: ToggleCouponUseCase,
  ) {}

  @Post()
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: "Crear cupon (GLOBAL o UNIQUE)" })
  @ApiQuery({ name: "lang", required: false, enum: Lang })
  async createCoupon(
    @Body() dto: CreateCouponDto,
    @Query("lang", new DefaultValuePipe(Lang.ES), new ParseEnumPipe(Lang))
    lang: Lang,
  ): Promise<CouponResponseDto> {
    const entity = await this.createCouponUseCase.execute(dto);
    return entity.toResponseDto(lang);
  }

  @Get()
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: "Listar cupones (filtrable por tipo)" })
  @ApiQuery({ name: "type", required: false, enum: CouponType })
  @ApiQuery({ name: "lang", required: false, enum: Lang })
  async findAllCoupons(
    @Query("type") type?: CouponType,
    @Query("lang", new DefaultValuePipe(Lang.ES), new ParseEnumPipe(Lang))
    lang?: Lang,
  ): Promise<CouponResponseDto[]> {
    const entities = await this.getCouponsUseCase.execute(type);
    return entities.map((coupon) => coupon.toResponseDto(lang));
  }

  @Get(":id")
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: "Obtener cupon por ID" })
  @ApiQuery({ name: "lang", required: false, enum: Lang })
  async findOneCoupon(
    @Param("id", ParseUUIDPipe) id: string,
    @Query("lang", new DefaultValuePipe(Lang.ES), new ParseEnumPipe(Lang))
    lang: Lang,
  ): Promise<CouponResponseDto> {
    const entity = await this.getCouponUseCase.execute(id);
    return entity.toResponseDto(lang);
  }

  @Patch(":id")
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: "Actualizar cupon" })
  @ApiQuery({ name: "lang", required: false, enum: Lang })
  async updateCoupon(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateCouponDto,
    @Query("lang", new DefaultValuePipe(Lang.ES), new ParseEnumPipe(Lang))
    lang: Lang,
  ): Promise<CouponResponseDto> {
    const entity = await this.updateCouponUseCase.execute(id, dto);
    return entity.toResponseDto(lang);
  }

  @Patch(":id/toggle")
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: "Activar/desactivar cupon" })
  @ApiQuery({ name: "lang", required: false, enum: Lang })
  async toggleCoupon(
    @Param("id", ParseUUIDPipe) id: string,
    @Query("lang", new DefaultValuePipe(Lang.ES), new ParseEnumPipe(Lang))
    lang: Lang,
  ): Promise<CouponResponseDto> {
    const entity = await this.toggleCouponUseCase.execute(id);
    return entity.toResponseDto(lang);
  }
}
