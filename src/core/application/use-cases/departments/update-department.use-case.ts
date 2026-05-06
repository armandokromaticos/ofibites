import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import type { IDepartmentRepository } from "../../../domain/repositories/department.repository.interface";
import { DEPARTMENT_REPOSITORY } from "../../../domain/repositories/department.repository.interface";
import { UpdateDepartmentDto } from "../../dto/departments/update-department.dto";
import { DepartmentEntity } from "../../../domain/entities/department.entity";

@Injectable()
export class UpdateDepartmentUseCase {
  constructor(
    @Inject(DEPARTMENT_REPOSITORY)
    private readonly departmentRepository: IDepartmentRepository,
  ) {}

  async execute(
    companyId: string,
    id: string,
    dto: UpdateDepartmentDto,
  ): Promise<DepartmentEntity> {
    const hasUpdates = Object.values(dto).some((value) => value !== undefined);
    if (!hasUpdates) {
      throw new BadRequestException("No fields provided for update");
    }

    const existing = await this.departmentRepository.findUnique({
      where: { id },
    });
    if (!existing || existing.companyId !== companyId) {
      throw new NotFoundException(
        `Department ${id} not found in company ${companyId}`,
      );
    }

    const data: Prisma.DepartmentUpdateInput = {};
    if (dto.name !== undefined) data.name = dto.name.trim();
    if (dto.isActive !== undefined) data.isActive = dto.isActive;

    return this.departmentRepository.update({ where: { id }, data });
  }
}
