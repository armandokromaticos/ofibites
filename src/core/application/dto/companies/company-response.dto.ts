import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { CompanyEntity } from "../../../domain/entities/company.entity";

export class CompanyResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  legalName: string;

  @ApiProperty()
  taxId: string;

  @ApiPropertyOptional({ nullable: true, type: String })
  email: string | null;

  @ApiPropertyOptional({ nullable: true, type: String })
  phone: string | null;

  @ApiProperty({
    example: 30,
    description:
      "Plazo de crédito en días (0 = contado, hasta 180). Histórico del cliente, no atado a cada pedido.",
  })
  creditDays: number;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  static fromEntity(entity: CompanyEntity): CompanyResponseDto {
    const dto = new CompanyResponseDto();
    dto.id = entity.id;
    dto.legalName = entity.legalName;
    dto.taxId = entity.taxId;
    dto.email = entity.email;
    dto.phone = entity.phone;
    dto.creditDays = entity.creditDays;
    dto.isActive = entity.isActive;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    return dto;
  }
}
