import { Inject, Injectable } from "@nestjs/common";
import type { ICompanyAddressRepository } from "../../../domain/repositories/company-address.repository.interface";
import { COMPANY_ADDRESS_REPOSITORY } from "../../../domain/repositories/company-address.repository.interface";
import { CompanyAddressEntity } from "../../../domain/entities/company-address.entity";

@Injectable()
export class GetCompanyAddressesUseCase {
  constructor(
    @Inject(COMPANY_ADDRESS_REPOSITORY)
    private readonly addressRepository: ICompanyAddressRepository,
  ) {}

  async execute(companyId: string): Promise<CompanyAddressEntity[]> {
    const { data } = await this.addressRepository.findMany({
      where: { companyId },
      orderBy: { createdAt: "asc" },
    });
    return data;
  }
}
