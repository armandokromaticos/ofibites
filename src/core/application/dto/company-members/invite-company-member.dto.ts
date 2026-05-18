import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from "class-validator";
import { CompanyRole } from "../../../domain/enums/company-role.enum";

export class InviteCompanyMemberDto {
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

  @ApiPropertyOptional({ example: "Gerente de compras" })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  position?: string;

  @ApiPropertyOptional({ example: "uuid-of-branch" })
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @ApiPropertyOptional({ example: "uuid-of-department" })
  @IsOptional()
  @IsUUID()
  departmentId?: string;

  @ApiProperty({ enum: CompanyRole, example: CompanyRole.COMPANY_BUYER })
  @IsEnum(CompanyRole)
  role: CompanyRole;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  canPayInvoices?: boolean;
}
