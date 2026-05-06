import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import type { ICompanyMemberRepository } from "../../../domain/repositories/company-member.repository.interface";
import { COMPANY_MEMBER_REPOSITORY } from "../../../domain/repositories/company-member.repository.interface";
import type { IBranchRepository } from "../../../domain/repositories/branch.repository.interface";
import { BRANCH_REPOSITORY } from "../../../domain/repositories/branch.repository.interface";
import type { IDepartmentRepository } from "../../../domain/repositories/department.repository.interface";
import { DEPARTMENT_REPOSITORY } from "../../../domain/repositories/department.repository.interface";
import { UpdateCompanyMemberDto } from "../../dto/company-members/update-company-member.dto";
import { CompanyMemberEntity } from "../../../domain/entities/company-member.entity";

@Injectable()
export class UpdateCompanyMemberUseCase {
  constructor(
    @Inject(COMPANY_MEMBER_REPOSITORY)
    private readonly memberRepository: ICompanyMemberRepository,
    @Inject(BRANCH_REPOSITORY)
    private readonly branchRepository: IBranchRepository,
    @Inject(DEPARTMENT_REPOSITORY)
    private readonly departmentRepository: IDepartmentRepository,
  ) {}

  async execute(
    companyId: string,
    id: string,
    dto: UpdateCompanyMemberDto,
  ): Promise<CompanyMemberEntity> {
    const hasUpdates = Object.values(dto).some((value) => value !== undefined);
    if (!hasUpdates) {
      throw new BadRequestException("No fields provided for update");
    }

    const existing = await this.memberRepository.findUnique({ where: { id } });
    if (!existing || existing.companyId !== companyId) {
      throw new NotFoundException(
        `Member ${id} not found in company ${companyId}`,
      );
    }

    if (dto.branchId) {
      const branch = await this.branchRepository.findUnique({
        where: { id: dto.branchId },
      });
      if (!branch || branch.companyId !== companyId) {
        throw new BadRequestException(
          `Branch ${dto.branchId} does not belong to company ${companyId}`,
        );
      }
    }

    if (dto.departmentId) {
      const department = await this.departmentRepository.findUnique({
        where: { id: dto.departmentId },
      });
      if (!department || department.companyId !== companyId) {
        throw new BadRequestException(
          `Department ${dto.departmentId} does not belong to company ${companyId}`,
        );
      }
    }

    const data: Prisma.CompanyMemberUpdateInput = {};
    if (dto.role !== undefined) data.role = dto.role;
    if (dto.position !== undefined) data.position = dto.position;
    if (dto.canPayInvoices !== undefined) {
      data.canPayInvoices = dto.canPayInvoices;
    }
    if (dto.isActive !== undefined) data.isActive = dto.isActive;
    if (dto.branchId !== undefined) {
      data.branch = dto.branchId
        ? {
            connect: {
              companyId_id: { companyId, id: dto.branchId },
            },
          }
        : { disconnect: true };
    }
    if (dto.departmentId !== undefined) {
      data.department = dto.departmentId
        ? {
            connect: {
              companyId_id: { companyId, id: dto.departmentId },
            },
          }
        : { disconnect: true };
    }

    return this.memberRepository.update({ where: { id }, data });
  }
}
