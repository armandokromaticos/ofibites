import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../database/prisma/prisma.service";
import { IDepartmentRepository } from "../../domain/repositories/department.repository.interface";
import { DepartmentEntity } from "../../domain/entities/department.entity";

@Injectable()
export class DepartmentRepository implements IDepartmentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(entity: DepartmentEntity): Promise<DepartmentEntity> {
    const department = await this.prisma.department.create({
      data: entity.toPrismaCreate(),
    });
    return DepartmentEntity.fromPrisma(department);
  }

  async findUnique(
    args: Prisma.DepartmentFindUniqueArgs,
  ): Promise<DepartmentEntity | null> {
    const department = await this.prisma.department.findUnique(args);
    return department ? DepartmentEntity.fromPrisma(department) : null;
  }

  async findMany(
    args?: Prisma.DepartmentFindManyArgs,
  ): Promise<{ data: DepartmentEntity[]; total?: number }> {
    const rows = await this.prisma.department.findMany(args);
    const data = rows.map((row) => DepartmentEntity.fromPrisma(row));

    const hasPagination =
      typeof args?.skip === "number" || typeof args?.take === "number";
    if (hasPagination) {
      const total = await this.prisma.department.count({ where: args?.where });
      return { data, total };
    }
    return { data };
  }

  async update(args: Prisma.DepartmentUpdateArgs): Promise<DepartmentEntity> {
    const department = await this.prisma.department.update(args);
    return DepartmentEntity.fromPrisma(department);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.department.delete({ where: { id } });
  }

  async exists(args: Prisma.DepartmentCountArgs): Promise<boolean> {
    const count = await this.prisma.department.count(args);
    return count > 0;
  }
}
