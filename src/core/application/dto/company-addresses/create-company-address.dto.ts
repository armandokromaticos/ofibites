import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";

export class CreateCompanyAddressDto {
  @ApiProperty({ example: "Sede Caracas" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  label: string;

  @ApiProperty({ example: "Av. Principal, Edif. X" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  line1: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  line2?: string;

  @ApiPropertyOptional({ example: "Cerca de la plaza Bolívar" })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reference?: string;

  @ApiProperty({ example: "Caracas" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  city: string;

  @ApiPropertyOptional({ example: "Distrito Capital" })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  state?: string;

  @ApiProperty({ example: "Venezuela" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  country: string;

  @ApiPropertyOptional({ example: "1010" })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  zip?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isBilling?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isShipping?: boolean;
}
