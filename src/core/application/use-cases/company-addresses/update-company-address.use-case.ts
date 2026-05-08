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
    if (dto.line2 !== undefined) {
      const trimmed = dto.line2?.trim();
      data.line2 = trimmed ? trimmed : null;
    }
    if (dto.reference !== undefined) {
      const trimmed = dto.reference?.trim();
      data.reference = trimmed ? trimmed : null;
    }
    if (dto.city !== undefined) data.city = dto.city.trim();
    if (dto.state !== undefined) {
      const trimmed = dto.state?.trim();
      data.state = trimmed ? trimmed : null;
    }
    if (dto.country !== undefined) data.country = dto.country.trim();
    if (dto.zip !== undefined) {
      const trimmed = dto.zip?.trim();
      data.zip = trimmed ? trimmed : null;
    }
    if (dto.isShipping !== undefined) data.isShipping = dto.isShipping;
    if (dto.isBilling === false) data.isBilling = false;
    // isBilling=true se aplica después con setSingleBilling para cumplir invariante

    let updated: CompanyAddressEntity;
    try {
      updated = await this.addressRepository.update({ where: { id }, data });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        throw new NotFoundException(
          `Address ${id} not found in company ${companyId}`,
        );
      }
      throw error;
    }

    if (dto.isBilling === true) {
      await this.addressRepository.setSingleBilling(companyId, id);
      const refreshed = await this.addressRepository.findUnique({
        where: { id },
      });
      return refreshed ?? updated;
    }

    return updated;
  }
}
