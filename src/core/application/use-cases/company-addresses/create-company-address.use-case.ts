import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { ICompanyAddressRepository } from "../../../domain/repositories/company-address.repository.interface";
import { COMPANY_ADDRESS_REPOSITORY } from "../../../domain/repositories/company-address.repository.interface";
import type { ICompanyRepository } from "../../../domain/repositories/company.repository.interface";
import { COMPANY_REPOSITORY } from "../../../domain/repositories/company.repository.interface";
import { CreateCompanyAddressDto } from "../../dto/company-addresses/create-company-address.dto";
import { CompanyAddressEntity } from "../../../domain/entities/company-address.entity";

@Injectable()
export class CreateCompanyAddressUseCase {
  constructor(
    @Inject(COMPANY_ADDRESS_REPOSITORY)
    private readonly addressRepository: ICompanyAddressRepository,
    @Inject(COMPANY_REPOSITORY)
    private readonly companyRepository: ICompanyRepository,
  ) {}

  async execute(
    companyId: string,
    dto: CreateCompanyAddressDto,
  ): Promise<CompanyAddressEntity> {
    const company = await this.companyRepository.findUnique({
      where: { id: companyId },
    });
    if (!company) {
      throw new NotFoundException(`Company ${companyId} not found`);
    }

    const entity = CompanyAddressEntity.fromCreateParams({
      companyId,
      label: dto.label,
      line1: dto.line1,
      line2: dto.line2 ?? null,
      reference: dto.reference ?? null,
      city: dto.city,
      state: dto.state ?? null,
      country: dto.country,
      zip: dto.zip ?? null,
      isBilling: dto.isBilling,
      isShipping: dto.isShipping,
    });

    if (entity.isBilling) {
      return this.addressRepository.createAndSetSingleBilling(entity);
    }

    return this.addressRepository.create(entity);
  }
}
