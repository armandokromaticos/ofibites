import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import type { ICompanyRepository } from "../../../domain/repositories/company.repository.interface";
import { COMPANY_REPOSITORY } from "../../../domain/repositories/company.repository.interface";
import { CompanyEntity } from "../../../domain/entities/company.entity";

@Injectable()
export class SetCompanyActiveUseCase {
  constructor(
    @Inject(COMPANY_REPOSITORY)
    private readonly companyRepository: ICompanyRepository,
  ) {}

  async execute(id: string, isActive: boolean): Promise<CompanyEntity> {
    const existing = await this.companyRepository.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Company with id ${id} not found`);
    }

    try {
      return await this.companyRepository.update({
        where: { id },
        data: { isActive },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        throw new NotFoundException(`Company with id ${id} not found`);
      }
      throw error;
    }
  }
}
