import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { ICompanyAddressRepository } from "../../../domain/repositories/company-address.repository.interface";
import { COMPANY_ADDRESS_REPOSITORY } from "../../../domain/repositories/company-address.repository.interface";
import type { ICompanyMemberRepository } from "../../../domain/repositories/company-member.repository.interface";
import { COMPANY_MEMBER_REPOSITORY } from "../../../domain/repositories/company-member.repository.interface";
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
  ) {}

  async execute(
    companyId: string,
    id: string,
    callerUserId: string,
    callerRole: Role,
  ): Promise<CompanyAddressEntity> {
    await assertCompanyAccess(callerUserId, callerRole, companyId, {
      companyMemberRepository: this.companyMemberRepository,
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
