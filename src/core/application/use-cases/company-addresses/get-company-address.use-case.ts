import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { ICompanyAddressRepository } from "../../../domain/repositories/company-address.repository.interface";
import { COMPANY_ADDRESS_REPOSITORY } from "../../../domain/repositories/company-address.repository.interface";
import { CompanyAddressEntity } from "../../../domain/entities/company-address.entity";

@Injectable()
export class GetCompanyAddressUseCase {
  constructor(
    @Inject(COMPANY_ADDRESS_REPOSITORY)
    private readonly addressRepository: ICompanyAddressRepository,
  ) {}

  async execute(
    companyId: string,
    id: string,
  ): Promise<CompanyAddressEntity> {
    const address = await this.addressRepository.findUnique({ where: { id } });
    if (!address || address.companyId !== companyId) {
      throw new NotFoundException(
        `Address ${id} not found in company ${companyId}`,
      );
    }
    return address;
  }
}
