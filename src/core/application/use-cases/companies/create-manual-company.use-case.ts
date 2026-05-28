import { Inject, Injectable, Logger } from "@nestjs/common";
import type { ICompanyRepository } from "../../../domain/repositories/company.repository.interface";
import { COMPANY_REPOSITORY } from "../../../domain/repositories/company.repository.interface";
import { CompanyEntity } from "../../../domain/entities/company.entity";
import { CompanyMemberEntity } from "../../../domain/entities/company-member.entity";
import { CompanyRole } from "../../../domain/enums/company-role.enum";
import { CreateManualCompanyDto } from "../../dto/companies/create-manual-company.dto";
import { CreateCompanyUseCase } from "./create-company.use-case";
import { InviteCompanyMemberUseCase } from "../company-members/invite-company-member.use-case";

@Injectable()
export class CreateManualCompanyUseCase {
  private readonly logger = new Logger(CreateManualCompanyUseCase.name);

  constructor(
    private readonly createCompanyUseCase: CreateCompanyUseCase,
    private readonly inviteUseCase: InviteCompanyMemberUseCase,
    @Inject(COMPANY_REPOSITORY)
    private readonly companyRepository: ICompanyRepository,
  ) {}

  async execute(
    dto: CreateManualCompanyDto,
  ): Promise<{ company: CompanyEntity; member: CompanyMemberEntity }> {
    const company = await this.createCompanyUseCase.execute(dto.company);

    try {
      const member = await this.inviteUseCase.execute(company.id, {
        name: dto.admin.name,
        email: dto.admin.email,
        phone: dto.admin.phone,
        position: dto.admin.position,
        role: CompanyRole.COMPANY_ADMIN,
      });
      return { company, member };
    } catch (err) {
      // Rollback: si no se pudo invitar al primer admin, no dejamos la empresa
      // huérfana. El invite ya revierte por su lado User/Member/Auth.
      this.logger.error(
        `Falló invitar al primer admin de la empresa ${company.id}; revirtiendo empresa.`,
      );
      await this.tryDeleteCompany(company.id);
      throw err;
    }
  }

  private async tryDeleteCompany(id: string): Promise<void> {
    try {
      await this.companyRepository.delete(id);
    } catch (err) {
      this.logger.error(
        `No se pudo revertir la empresa ${id}: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }
}
