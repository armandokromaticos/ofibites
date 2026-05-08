import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { IDepartmentRepository } from "../../../domain/repositories/department.repository.interface";
import { DEPARTMENT_REPOSITORY } from "../../../domain/repositories/department.repository.interface";
import type { ICompanyRepository } from "../../../domain/repositories/company.repository.interface";
import { COMPANY_REPOSITORY } from "../../../domain/repositories/company.repository.interface";
import { CreateDepartmentDto } from "../../dto/departments/create-department.dto";
import { DepartmentEntity } from "../../../domain/entities/department.entity";

@Injectable()
export class CreateDepartmentUseCase {
  constructor(
    @Inject(DEPARTMENT_REPOSITORY)
    private readonly departmentRepository: IDepartmentRepository,
    @Inject(COMPANY_REPOSITORY)
    private readonly companyRepository: ICompanyRepository,
  ) {}

  async execute(
    companyId: string,
    dto: CreateDepartmentDto,
  ): Promise<DepartmentEntity> {
    const company = await this.companyRepository.findUnique({
      where: { id: companyId },
    });
    if (!company) {
      throw new NotFoundException(`Company ${companyId} not found`);
    }

    const entity = DepartmentEntity.fromCreateParams({
      companyId,
      name: dto.name,
      isActive: dto.isActive,
    });
    return this.departmentRepository.create(entity);
  }
}
