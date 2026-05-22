import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
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

export class CreateCompanyRegistrationRequestDto {
  @ApiProperty({
    example: "Diageo Venezuela C.A.",
    description:
      "Razón social / nombre comercial declarado por el solicitante.",
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  legalName: string;

  @ApiProperty({ example: "J-12345678-9" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  taxId: string;

  @ApiProperty({ example: "María Pérez" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  contactName: string;

  @ApiProperty({ example: "maria.perez@diageo.com" })
  @IsEmail()
  @MaxLength(150)
  contactEmail: string;

  @ApiProperty({ example: "+58 412 555 0000" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  contactPhone: string;

  @ApiPropertyOptional({
    example: "Gerente de Compras",
    description: "Cargo / posición del contacto dentro de la empresa.",
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  position?: string;

  @ApiPropertyOptional({
    example: 250,
    description: "Cantidad aproximada de empleados de la empresa.",
    minimum: 1,
    maximum: 1_000_000,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1_000_000)
  employeeCount?: number;
}
