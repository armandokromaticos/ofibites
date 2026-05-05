import { Department as PrismaDepartment } from "@prisma/client";

export class DepartmentEntity {
  id: string;
  companyId: string;
  name: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  static fromPrisma(prisma: PrismaDepartment): DepartmentEntity {
    const entity = new DepartmentEntity();
    entity.id = prisma.id;
    entity.companyId = prisma.companyId;
    entity.name = prisma.name;
    entity.isActive = prisma.isActive;
    entity.createdAt = prisma.createdAt;
    entity.updatedAt = prisma.updatedAt;
    return entity;
  }
}
