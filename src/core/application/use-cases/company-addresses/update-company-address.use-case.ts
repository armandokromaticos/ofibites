import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import type { ICompanyAddressRepository } from "../../../domain/repositories/company-address.repository.interface";
import { COMPANY_ADDRESS_REPOSITORY } from "../../../domain/repositories/company-address.repository.interface";
import { UpdateCompanyAddressDto } from "../../dto/company-addresses/update-company-address.dto";
import { CompanyAddressEntity } from "../../../domain/entities/company-address.entity";

@Injectable()
export class UpdateCompanyAddressUseCase {
  constructor(
    @Inject(COMPANY_ADDRESS_REPOSITORY)
    private readonly addressRepository: ICompanyAddressRepository,
  ) {}

  async execute(
    companyId: string,
    id: string,
    dto: UpdateCompanyAddressDto,
  ): Promise<CompanyAddressEntity> {
    const hasUpdates = Object.values(dto).some((value) => value !== undefined);
    if (!hasUpdates) {
      throw new BadRequestException("No fields provided for update");
    }

    const existing = await this.addressRepository.findUnique({
      where: { id },
    });
    if (!existing || existing.companyId !== companyId) {
      throw new NotFoundException(
        `Address ${id} not found in company ${companyId}`,
      );
    }

    const data: Prisma.CompanyAddressUpdateInput = {};
    if (dto.label !== undefined) data.label = dto.label.trim();
    if (dto.line1 !== undefined) data.line1 = dto.line1.trim();
    if (dto.line2 !== undefined) data.line2 = dto.line2;
    if (dto.reference !== undefined) data.reference = dto.reference;
    if (dto.city !== undefined) data.city = dto.city.trim();
    if (dto.state !== undefined) data.state = dto.state;
    if (dto.country !== undefined) data.country = dto.country.trim();
    if (dto.zip !== undefined) data.zip = dto.zip;
    if (dto.isShipping !== undefined) data.isShipping = dto.isShipping;
    // isBilling se maneja después con setSingleBilling para cumplir invariante

    const updated = await this.addressRepository.update({
      where: { id },
      data,
    });

    if (dto.isBilling === true) {
      await this.addressRepository.setSingleBilling(companyId, id);
      const refreshed = await this.addressRepository.findUnique({
        where: { id },
      });
      return refreshed ?? updated;
    }

    if (dto.isBilling === false) {
      await this.addressRepository.update({
        where: { id },
        data: { isBilling: false },
      });
      const refreshed = await this.addressRepository.findUnique({
        where: { id },
      });
      return refreshed ?? updated;
    }

    return updated;
  }
}
