import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import type { IBranchRepository } from "../../../domain/repositories/branch.repository.interface";
import { BRANCH_REPOSITORY } from "../../../domain/repositories/branch.repository.interface";

@Injectable()
export class DeleteBranchUseCase {
  constructor(
    @Inject(BRANCH_REPOSITORY)
    private readonly branchRepository: IBranchRepository,
  ) {}

  async execute(companyId: string, id: string): Promise<void> {
    const existing = await this.branchRepository.findUnique({ where: { id } });
    if (!existing || existing.companyId !== companyId) {
      throw new NotFoundException(
        `Branch ${id} not found in company ${companyId}`,
      );
    }

    try {
      await this.branchRepository.delete(id);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2003") {
          throw new ConflictException(
            "No se puede eliminar la sede porque tiene órdenes o miembros asociados",
          );
        }
        if (error.code === "P2025") {
          throw new NotFoundException(
            `Branch ${id} not found in company ${companyId}`,
          );
        }
      }
      throw error;
    }
  }
}
