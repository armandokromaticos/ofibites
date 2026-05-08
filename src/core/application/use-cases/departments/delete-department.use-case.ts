import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import type { IDepartmentRepository } from "../../../domain/repositories/department.repository.interface";
import { DEPARTMENT_REPOSITORY } from "../../../domain/repositories/department.repository.interface";

@Injectable()
export class DeleteDepartmentUseCase {
  constructor(
    @Inject(DEPARTMENT_REPOSITORY)
    private readonly departmentRepository: IDepartmentRepository,
  ) {}

  async execute(companyId: string, id: string): Promise<void> {
    const existing = await this.departmentRepository.findUnique({
      where: { id },
    });
    if (!existing || existing.companyId !== companyId) {
      throw new NotFoundException(
        `Department ${id} not found in company ${companyId}`,
      );
    }

    try {
      await this.departmentRepository.delete(id);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2003") {
          throw new ConflictException(
            "No se puede eliminar el departamento porque tiene órdenes o miembros asociados",
          );
        }
        if (error.code === "P2025") {
          throw new NotFoundException(
            `Department ${id} not found in company ${companyId}`,
          );
        }
      }
      throw error;
    }
  }
}
