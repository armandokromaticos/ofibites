import { Prisma } from "@prisma/client";
import { SectionEntity } from "../entities/section.entity";

export const SECTION_REPOSITORY = Symbol("SECTION_REPOSITORY");

export const SECTION_FULL_INCLUDE = {
  items: {
    include: {
      product: {
        include: {
          sizes: true,
          modifierGroups: { include: { modifiers: true } },
          tags: { include: { tag: true } },
        },
      },
      combo: {
        include: {
          items: {
            include: { product: true },
            orderBy: { sortOrder: "asc" },
          },
        },
      },
    },
    orderBy: { order: "asc" },
  },
} as const satisfies Prisma.SectionInclude;

export interface ISectionRepository {
  create(entity: SectionEntity): Promise<SectionEntity>;
  findUnique(args: Prisma.SectionFindUniqueArgs): Promise<SectionEntity | null>;
  findMany(
    args?: Prisma.SectionFindManyArgs,
  ): Promise<{ data: SectionEntity[]; total?: number }>;
  update(args: Prisma.SectionUpdateArgs): Promise<SectionEntity>;
  delete(id: string): Promise<void>;
  exists(args: Prisma.SectionCountArgs): Promise<boolean>;

  // Helpers de dominio
  addItem(
    sectionId: string,
    productId: string | null,
    comboId: string | null,
    order: number,
  ): Promise<SectionEntity>;
  removeItem(sectionId: string, itemId: string): Promise<number>;
  reorderItems(
    sectionId: string,
    items: { itemId: string; order: number }[],
  ): Promise<SectionEntity>;
}
