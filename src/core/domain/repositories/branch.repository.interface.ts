import { Prisma } from "@prisma/client";
import { BranchEntity } from "../entities/branch.entity";

export const BRANCH_REPOSITORY = Symbol("BRANCH_REPOSITORY");

export interface IBranchRepository {
  create(entity: BranchEntity): Promise<BranchEntity>;
  findUnique(args: Prisma.BranchFindUniqueArgs): Promise<BranchEntity | null>;
  findMany(
    args?: Prisma.BranchFindManyArgs,
  ): Promise<{ data: BranchEntity[]; total?: number }>;
  update(args: Prisma.BranchUpdateArgs): Promise<BranchEntity>;
  delete(id: string): Promise<void>;
  exists(args: Prisma.BranchCountArgs): Promise<boolean>;
}
