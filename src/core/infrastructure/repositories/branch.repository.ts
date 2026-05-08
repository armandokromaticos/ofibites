import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../database/prisma/prisma.service";
import { IBranchRepository } from "../../domain/repositories/branch.repository.interface";
import { BranchEntity } from "../../domain/entities/branch.entity";

@Injectable()
export class BranchRepository implements IBranchRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(entity: BranchEntity): Promise<BranchEntity> {
    const branch = await this.prisma.branch.create({
      data: entity.toPrismaCreate(),
    });
    return BranchEntity.fromPrisma(branch);
  }

  async findUnique(
    args: Prisma.BranchFindUniqueArgs,
  ): Promise<BranchEntity | null> {
    const branch = await this.prisma.branch.findUnique(args);
    return branch ? BranchEntity.fromPrisma(branch) : null;
  }

  async findMany(
    args?: Prisma.BranchFindManyArgs,
  ): Promise<{ data: BranchEntity[]; total?: number }> {
    const rows = await this.prisma.branch.findMany(args);
    const data = rows.map((row) => BranchEntity.fromPrisma(row));

    const hasPagination =
      typeof args?.skip === "number" || typeof args?.take === "number";
    if (hasPagination) {
      const total = await this.prisma.branch.count({ where: args?.where });
      return { data, total };
    }
    return { data };
  }

  async update(args: Prisma.BranchUpdateArgs): Promise<BranchEntity> {
    const branch = await this.prisma.branch.update(args);
    return BranchEntity.fromPrisma(branch);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.branch.delete({ where: { id } });
  }

  async exists(args: Prisma.BranchCountArgs): Promise<boolean> {
    const count = await this.prisma.branch.count(args);
    return count > 0;
  }
}
