import { Branch as PrismaBranch, Prisma } from "@prisma/client";

export interface CreateBranchParams {
  companyId: string;
  name: string;
  isActive?: boolean;
}

export class BranchEntity {
  id: string;
  companyId: string;
  name: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  static fromPrisma(prisma: PrismaBranch): BranchEntity {
    const entity = new BranchEntity();
    entity.id = prisma.id;
    entity.companyId = prisma.companyId;
    entity.name = prisma.name;
    entity.isActive = prisma.isActive;
    entity.createdAt = prisma.createdAt;
    entity.updatedAt = prisma.updatedAt;
    return entity;
  }

  static fromCreateParams(params: CreateBranchParams): BranchEntity {
    const entity = new BranchEntity();
    entity.id = "";
    entity.companyId = params.companyId;
    entity.name = params.name.trim();
    entity.isActive = params.isActive ?? true;
    entity.createdAt = new Date();
    entity.updatedAt = new Date();
    return entity;
  }

  toPrismaCreate(): Prisma.BranchCreateInput {
    return {
      name: this.name,
      isActive: this.isActive,
      company: { connect: { id: this.companyId } },
    };
  }
}
