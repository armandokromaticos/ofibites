import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
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

  @ApiPropertyOptional({ enum: PaymentTerm, example: PaymentTerm.CASH })
  @IsOptional()
  @IsEnum(PaymentTerm)
  paymentTerm?: PaymentTerm;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
