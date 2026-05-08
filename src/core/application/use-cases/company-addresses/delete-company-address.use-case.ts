import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import type { ICompanyAddressRepository } from "../../../domain/repositories/company-address.repository.interface";
import { COMPANY_ADDRESS_REPOSITORY } from "../../../domain/repositories/company-address.repository.interface";

@Injectable()
export class DeleteCompanyAddressUseCase {
  constructor(
    @Inject(COMPANY_ADDRESS_REPOSITORY)
    private readonly addressRepository: ICompanyAddressRepository,
  ) {}

  async execute(companyId: string, id: string): Promise<void> {
    const existing = await this.addressRepository.findUnique({
      where: { id },
    });
    if (!existing || existing.companyId !== companyId) {
      throw new NotFoundException(
        `Address ${id} not found in company ${companyId}`,
      );
    }

    try {
      await this.addressRepository.delete(id);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2003") {
          throw new ConflictException(
            "No se puede eliminar la dirección porque tiene órdenes asociadas",
          );
        }
        if (error.code === "P2025") {
          throw new NotFoundException(
            `Address ${id} not found in company ${companyId}`,
          );
        }
      }
      throw error;
    }
  }
}
