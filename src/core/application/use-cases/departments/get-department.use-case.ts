import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { IDepartmentRepository } from "../../../domain/repositories/department.repository.interface";
import { DEPARTMENT_REPOSITORY } from "../../../domain/repositories/department.repository.interface";
import { DepartmentEntity } from "../../../domain/entities/department.entity";

@Injectable()
export class GetDepartmentUseCase {
  constructor(
    @Inject(DEPARTMENT_REPOSITORY)
    private readonly departmentRepository: IDepartmentRepository,
  ) {}

  async execute(companyId: string, id: string): Promise<DepartmentEntity> {
    const department = await this.departmentRepository.findUnique({
      where: { id },
    });
    if (!department || department.companyId !== companyId) {
      throw new NotFoundException(
        `Department ${id} not found in company ${companyId}`,
      );
    }
    return department;
  }
}
