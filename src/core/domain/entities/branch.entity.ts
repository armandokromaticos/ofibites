import { Branch as PrismaBranch } from "@prisma/client";

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
}
