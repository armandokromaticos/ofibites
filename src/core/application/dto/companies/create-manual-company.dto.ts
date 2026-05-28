import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { CreateCompanyDto } from "./create-company.dto";

export class ManualCompanyAdminDto {
  @ApiProperty({ example: "Juan Perez" })
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  name: string;

  @ApiProperty({ example: "juan.perez@diageo.com" })
  @IsEmail()
  @MaxLength(255)
  email: string;

  @ApiPropertyOptional({ example: "+584141234567" })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @ApiPropertyOptional({ example: "Gerente General" })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  position?: string;
}

export class CreateManualCompanyDto {
  @ApiProperty({ type: () => CreateCompanyDto })
  @ValidateNested()
  @Type(() => CreateCompanyDto)
  company: CreateCompanyDto;

  @ApiProperty({
    type: () => ManualCompanyAdminDto,
    description:
      "Primer administrador de la empresa (queda como COMPANY_ADMIN).",
  })
  @ValidateNested()
  @Type(() => ManualCompanyAdminDto)
  admin: ManualCompanyAdminDto;
}
