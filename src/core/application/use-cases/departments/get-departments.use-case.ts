import { Inject, Injectable } from "@nestjs/common";
import type { IDepartmentRepository } from "../../../domain/repositories/department.repository.interface";
import { DEPARTMENT_REPOSITORY } from "../../../domain/repositories/department.repository.interface";
import { DepartmentEntity } from "../../../domain/entities/department.entity";

@Injectable()
export class GetDepartmentsUseCase {
  constructor(
    @Inject(DEPARTMENT_REPOSITORY)
    private readonly departmentRepository: IDepartmentRepository,
  ) {}

  async execute(companyId: string): Promise<DepartmentEntity[]> {
    const { data } = await this.departmentRepository.findMany({
      where: { companyId },
      orderBy: { createdAt: "asc" },
    });
    return data;
  }
}
