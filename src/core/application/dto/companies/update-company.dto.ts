import { ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsBoolean,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateIf,
} from "class-validator";

export class UpdateCompanyDto {
  @ApiPropertyOptional({ example: "Ofibites C.A." })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  legalName?: string;

  @ApiPropertyOptional({ example: "J-12345678-9" })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  taxId?: string;

  @ApiPropertyOptional({ example: "contacto@ofibites.com", nullable: true })
  @IsOptional()
  @IsEmail()
  email?: string | null;

  @ApiPropertyOptional({ example: "+58 212 555 0000", nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string | null;

  @ApiPropertyOptional({
    example: 30,
    description:
      "Plazo de crédito en días (0 = contado). Cliente nuevo arranca en 0–5 y sube según historial.",
    minimum: 0,
    maximum: 180,
  })
  @ValidateIf((dto: UpdateCompanyDto) => dto.creditDays !== undefined)
  @IsInt()
  @Min(0)
  @Max(180)
  creditDays?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
