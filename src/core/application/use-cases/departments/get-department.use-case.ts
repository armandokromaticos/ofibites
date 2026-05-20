import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { IDepartmentRepository } from "../../../domain/repositories/department.repository.interface";
import { DEPARTMENT_REPOSITORY } from "../../../domain/repositories/department.repository.interface";
import type { ICompanyMemberRepository } from "../../../domain/repositories/company-member.repository.interface";
import { COMPANY_MEMBER_REPOSITORY } from "../../../domain/repositories/company-member.repository.interface";
import { DepartmentEntity } from "../../../domain/entities/department.entity";
import { Role } from "../../../domain/enums/role.enum";
import { assertCompanyAccess } from "../../shared/company-access.guard";

@Injectable()
export class GetDepartmentUseCase {
  constructor(
    @Inject(DEPARTMENT_REPOSITORY)
    private readonly departmentRepository: IDepartmentRepository,
    @Inject(COMPANY_MEMBER_REPOSITORY)
    private readonly companyMemberRepository: ICompanyMemberRepository,
  ) {}

  async execute(
    companyId: string,
    id: string,
    callerUserId: string,
    callerRole: Role,
  ): Promise<DepartmentEntity> {
    await assertCompanyAccess(callerUserId, callerRole, companyId, {
      companyMemberRepository: this.companyMemberRepository,
    });
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
