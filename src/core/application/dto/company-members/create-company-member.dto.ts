import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from "class-validator";
import { CompanyRole } from "../../../domain/enums/company-role.enum";

export class CreateCompanyMemberDto {
  @ApiProperty({ example: "uuid-of-user" })
  @IsUUID()
  userId: string;

  @ApiProperty({ enum: CompanyRole, example: CompanyRole.COMPANY_BUYER })
  @IsEnum(CompanyRole)
  role: CompanyRole;

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

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  canPayInvoices?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
