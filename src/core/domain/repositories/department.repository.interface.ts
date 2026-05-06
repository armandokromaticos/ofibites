import { Prisma } from "@prisma/client";
import { DepartmentEntity } from "../entities/department.entity";

export const DEPARTMENT_REPOSITORY = Symbol("DEPARTMENT_REPOSITORY");

export interface IDepartmentRepository {
  create(entity: DepartmentEntity): Promise<DepartmentEntity>;
  findUnique(
    args: Prisma.DepartmentFindUniqueArgs,
  ): Promise<DepartmentEntity | null>;
  findMany(
    args?: Prisma.DepartmentFindManyArgs,
  ): Promise<{ data: DepartmentEntity[]; total?: number }>;
  update(args: Prisma.DepartmentUpdateArgs): Promise<DepartmentEntity>;
  delete(id: string): Promise<void>;
  exists(args: Prisma.DepartmentCountArgs): Promise<boolean>;
}
