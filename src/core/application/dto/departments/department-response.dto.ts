import { ApiProperty } from "@nestjs/swagger";
import { DepartmentEntity } from "../../../domain/entities/department.entity";

export class DepartmentResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  companyId: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  static fromEntity(entity: DepartmentEntity): DepartmentResponseDto {
    const dto = new DepartmentResponseDto();
    dto.id = entity.id;
    dto.companyId = entity.companyId;
    dto.name = entity.name;
    dto.isActive = entity.isActive;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    return dto;
  }
}
