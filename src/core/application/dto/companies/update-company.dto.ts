import { ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";
import { PaymentTerm } from "../../../domain/enums/payment-term.enum";

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

  @ApiPropertyOptional({ enum: PaymentTerm })
  @IsOptional()
  @IsEnum(PaymentTerm)
  paymentTerm?: PaymentTerm;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
