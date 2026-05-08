import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { ICompanyAddressRepository } from "../../../domain/repositories/company-address.repository.interface";
import { COMPANY_ADDRESS_REPOSITORY } from "../../../domain/repositories/company-address.repository.interface";
import type { ICompanyMemberRepository } from "../../../domain/repositories/company-member.repository.interface";
import { COMPANY_MEMBER_REPOSITORY } from "../../../domain/repositories/company-member.repository.interface";
import type { ICompanyKamRepository } from "../../../domain/repositories/company-kam.repository.interface";
import { COMPANY_KAM_REPOSITORY } from "../../../domain/repositories/company-kam.repository.interface";
import { CompanyAddressEntity } from "../../../domain/entities/company-address.entity";
import { Role } from "../../../domain/enums/role.enum";
import { assertCompanyAccess } from "../../shared/company-access.guard";

@Injectable()
export class GetCompanyAddressUseCase {
  constructor(
    @Inject(COMPANY_ADDRESS_REPOSITORY)
    private readonly addressRepository: ICompanyAddressRepository,
    @Inject(COMPANY_MEMBER_REPOSITORY)
    private readonly companyMemberRepository: ICompanyMemberRepository,
    @Inject(COMPANY_KAM_REPOSITORY)
    private readonly companyKamRepository: ICompanyKamRepository,
  ) {}

  async execute(
    companyId: string,
    id: string,
    callerUserId: string,
    callerRole: Role,
  ): Promise<CompanyAddressEntity> {
    await assertCompanyAccess(callerUserId, callerRole, companyId, {
      companyMemberRepository: this.companyMemberRepository,
      companyKamRepository: this.companyKamRepository,
    });
    const address = await this.addressRepository.findUnique({ where: { id } });
    if (!address || address.companyId !== companyId) {
      throw new NotFoundException(
        `Address ${id} not found in company ${companyId}`,
      );
    }
    return address;
  }
}
