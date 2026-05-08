import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { CompanyAddressEntity } from "../../../domain/entities/company-address.entity";

export class CompanyAddressResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  companyId: string;

  @ApiProperty()
  label: string;

  @ApiProperty()
  line1: string;

  @ApiPropertyOptional({ nullable: true, type: String })
  line2: string | null;

  @ApiPropertyOptional({ nullable: true, type: String })
  reference: string | null;

  @ApiProperty()
  city: string;

  @ApiPropertyOptional({ nullable: true, type: String })
  state: string | null;

  @ApiProperty()
  country: string;

  @ApiPropertyOptional({ nullable: true, type: String })
  zip: string | null;

  @ApiProperty()
  isBilling: boolean;

  @ApiProperty()
  isShipping: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  static fromEntity(entity: CompanyAddressEntity): CompanyAddressResponseDto {
    const dto = new CompanyAddressResponseDto();
    dto.id = entity.id;
    dto.companyId = entity.companyId;
    dto.label = entity.label;
    dto.line1 = entity.line1;
    dto.line2 = entity.line2;
    dto.reference = entity.reference;
    dto.city = entity.city;
    dto.state = entity.state;
    dto.country = entity.country;
    dto.zip = entity.zip;
    dto.isBilling = entity.isBilling;
    dto.isShipping = entity.isShipping;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    return dto;
  }
}
