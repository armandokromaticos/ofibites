import { Prisma } from "@prisma/client";
import { ComboEntity } from "../entities/combo.entity";

export const COMBO_REPOSITORY = Symbol("COMBO_REPOSITORY");

export const COMBO_FULL_INCLUDE = {
  items: {
    include: { product: true },
    orderBy: { sortOrder: "asc" },
  },
} as const satisfies Prisma.ComboInclude;

export interface IComboRepository {
  create(entity: ComboEntity): Promise<ComboEntity>;
  findUnique(args: Prisma.ComboFindUniqueArgs): Promise<ComboEntity | null>;
  findMany(
    args?: Prisma.ComboFindManyArgs,
  ): Promise<{ data: ComboEntity[]; total?: number }>;
  update(args: Prisma.ComboUpdateArgs): Promise<ComboEntity>;
  delete(id: string): Promise<void>;
  exists(args: Prisma.ComboCountArgs): Promise<boolean>;

  // Helpers de dominio
  addItem(
    comboId: string,
    productId: string,
    quantity: number,
    sortOrder?: number,
  ): Promise<ComboEntity>;
  removeItem(comboId: string, itemId: string): Promise<ComboEntity>;
}
