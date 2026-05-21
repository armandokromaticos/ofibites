import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
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

export class CreateCompanyDto {
  @ApiProperty({ example: "Ofibites C.A." })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  legalName: string;

  @ApiProperty({ example: "J-12345678-9" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  taxId: string;

  @ApiPropertyOptional({ example: "contacto@ofibites.com" })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: "+58 212 555 0000" })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;

  @ApiPropertyOptional({
    example: "Ofibites C.A.",
    description: "Razón social legal (puede diferir de legalName comercial).",
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  fiscalName?: string;

  @ApiPropertyOptional({
    example: "Av. Principal, Torre X, Piso 4, Caracas",
    description: "Dirección fiscal completa.",
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  fiscalAddress?: string;

  @ApiPropertyOptional({
    example: 30,
    description:
      "Plazo de crédito en días (0 = contado). Cliente nuevo arranca en 0–5 y sube según historial.",
    minimum: 0,
    maximum: 180,
  })
  @ValidateIf((dto: CreateCompanyDto) => dto.creditDays !== undefined)
  @IsInt()
  @Min(0)
  @Max(180)
  creditDays?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
