import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { CompanyRegistrationRequestEntity } from "../../../domain/entities/company-registration-request.entity";
import { RegistrationRequestStatus } from "../../../domain/enums/registration-request-status.enum";

export class CompanyRegistrationRequestResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  legalName: string;

  @ApiProperty()
  taxId: string;

  @ApiProperty()
  contactName: string;

  @ApiProperty()
  contactEmail: string;

  @ApiProperty()
  contactPhone: string;

  @ApiPropertyOptional({ nullable: true, type: String })
  position: string | null;

  @ApiPropertyOptional({ nullable: true, type: Number })
  employeeCount: number | null;

  @ApiProperty({ enum: RegistrationRequestStatus })
  status: RegistrationRequestStatus;

  @ApiPropertyOptional({ nullable: true, type: String })
  rejectionReason: string | null;

  @ApiPropertyOptional({ nullable: true, type: Date })
  reviewedAt: Date | null;

  @ApiPropertyOptional({ nullable: true, type: String })
  reviewedById: string | null;

  @ApiPropertyOptional({ nullable: true, type: String })
  approvedCompanyId: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  static fromEntity(
    entity: CompanyRegistrationRequestEntity,
  ): CompanyRegistrationRequestResponseDto {
    const dto = new CompanyRegistrationRequestResponseDto();
    dto.id = entity.id;
    dto.legalName = entity.legalName;
    dto.taxId = entity.taxId;
    dto.contactName = entity.contactName;
    dto.contactEmail = entity.contactEmail;
    dto.contactPhone = entity.contactPhone;
    dto.position = entity.position;
    dto.employeeCount = entity.employeeCount;
    dto.status = entity.status;
    dto.rejectionReason = entity.rejectionReason;
    dto.reviewedAt = entity.reviewedAt;
    dto.reviewedById = entity.reviewedById;
    dto.approvedCompanyId = entity.approvedCompanyId;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    return dto;
  }
}

export class PaginatedCompanyRegistrationRequestsResponseDto {
  @ApiProperty({ type: [CompanyRegistrationRequestResponseDto] })
  data: CompanyRegistrationRequestResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  pageSize: number;
}
