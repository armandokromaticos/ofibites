import { ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsString,
  IsNumber,
  IsInt,
  IsDateString,
  IsOptional,
  IsBoolean,
  IsUUID,
  Min,
  Max,
  MinLength,
  ValidateIf,
} from "class-validator";

export class UpdateCouponDto {
  @ApiPropertyOptional({ example: "VERANO2026" })
  @IsOptional()
  @IsString()
  @MinLength(3)
  nameEs?: string;

  @ApiPropertyOptional({ example: "SUMMER2026", nullable: true })
  @IsOptional()
  @IsString()
  nameEn?: string | null;

  @ApiPropertyOptional({ example: 15.0 })
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  @Max(100)
  discountPercent?: number;

  @ApiPropertyOptional({ example: 100.0 })
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  maxDiscount?: number;

  @ApiPropertyOptional({ example: 500 })
  @IsOptional()
  @IsInt()
  @Min(1)
  totalQuantity?: number;

  @ApiPropertyOptional({ example: "2026-12-31T23:59:59.000Z" })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description:
      "Empresa a la que se restringe el cupon. Pasar null para volverlo global.",
    nullable: true,
  })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsUUID()
  companyId?: string | null;
}
