import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import type { ICompanyRepository } from "../../../domain/repositories/company.repository.interface";
import { COMPANY_REPOSITORY } from "../../../domain/repositories/company.repository.interface";

@Injectable()
export class DeleteCompanyUseCase {
  constructor(
    @Inject(COMPANY_REPOSITORY)
    private readonly companyRepository: ICompanyRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const existing = await this.companyRepository.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Company with id ${id} not found`);
    }

    try {
      await this.companyRepository.delete(id);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2003") {
          throw new ConflictException(
            "No se puede eliminar la empresa porque tiene recursos asociados (órdenes, sedes, miembros, etc.)",
          );
        }
        if (error.code === "P2025") {
          throw new NotFoundException(`Company with id ${id} not found`);
        }
      }
      throw error;
    }
  }
}
