import { ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from "class-validator";

export class UpdateCompanyRegistrationRequestDto {
  @ApiPropertyOptional({ example: "Diageo Venezuela C.A." })
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

  @ApiPropertyOptional({ example: "María Pérez" })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  contactName?: string;

  @ApiPropertyOptional({ example: "maria.perez@diageo.com" })
  @IsOptional()
  @IsEmail()
  @MaxLength(150)
  contactEmail?: string;

  @ApiPropertyOptional({ example: "+58 412 555 0000" })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  contactPhone?: string;

  @ApiPropertyOptional({
    example: "Gerente de Compras",
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  position?: string | null;

  @ApiPropertyOptional({
    example: 250,
    minimum: 1,
    maximum: 1_000_000,
    nullable: true,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1_000_000)
  employeeCount?: number | null;
}
