import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsString,
  IsNumber,
  IsInt,
  IsDateString,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsUUID,
  Min,
  Max,
  MinLength,
} from "class-validator";
import { CouponType } from "../../../domain/enums/coupon-type.enum";

export class CreateCouponDto {
  @ApiProperty({ enum: CouponType, example: "GLOBAL" })
  @IsEnum(CouponType)
  type: CouponType;

  @ApiProperty({ example: "VERANO2026" })
  @IsString()
  @MinLength(3)
  nameEs: string;

  @ApiPropertyOptional({ example: "SUMMER2026" })
  @IsOptional()
  @IsString()
  nameEn?: string;

  @ApiProperty({ example: 15.0, description: "Porcentaje de descuento" })
  @IsNumber()
  @Min(0.01)
  @Max(100)
  discountPercent: number;

  @ApiProperty({
    example: 100.0,
    description: "Monto maximo del descuento",
  })
  @IsNumber()
  @Min(0.01)
  maxDiscount: number;

  @ApiProperty({
    example: 500,
    description: "Cantidad total de usos permitidos",
  })
  @IsInt()
  @Min(1)
  totalQuantity: number;

  @ApiProperty({
    example: "2026-12-31T23:59:59.000Z",
    description: "Fecha de caducidad",
  })
  @IsDateString()
  expiresAt: string;

  @ApiPropertyOptional({ example: true, description: "Activar al crear" })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;

  @ApiPropertyOptional({
    description:
      "Si se especifica, el cupon solo aplica a esa empresa. Null = cupon global.",
    nullable: true,
  })
  @IsOptional()
  @IsUUID()
  companyId?: string;
}
