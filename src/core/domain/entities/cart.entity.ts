import {
  Cart as PrismaCart,
  CartItem as PrismaCartItem,
  CartItemModifier as PrismaCartItemModifier,
} from "@prisma/client";

type PrismaCartWithRelations = PrismaCart & {
  items?: (PrismaCartItem & {
    modifiers?: PrismaCartItemModifier[];
  })[];
};

export interface CartItemInfo {
  id: string;
  productId: string;
  productSizeId: string | null;
  comboId: string | null;
  quantity: number;
  addedById: string | null;
  modifierIds: string[];
}

interface CartProps {
  id: string;
  companyId: string;
  items: CartItemInfo[];
  createdAt: Date;
  updatedAt: Date;
}

export class CartEntity {
  private props: CartProps;

  constructor(props: CartProps) {
    this.props = props;
  }

  get id(): string {
    return this.props.id;
  }
  get companyId(): string {
    return this.props.companyId;
  }
  get items(): CartItemInfo[] {
    return this.props.items;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }
  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  /**
   * Busca una línea con la misma configuración (producto + tamaño/combo + el
   * mismo conjunto de modificadores). Sirve para deduplicar al agregar: si ya
   * existe, se incrementa la cantidad en vez de crear otra línea.
   */
  findMatchingItem(candidate: {
    productId: string;
    productSizeId?: string | null;
    comboId?: string | null;
    modifierIds: string[];
  }): CartItemInfo | undefined {
    const wantedModifiers = sortedUnique(candidate.modifierIds);
    return this.props.items.find(
      (item) =>
        item.productId === candidate.productId &&
        item.productSizeId === (candidate.productSizeId ?? null) &&
        item.comboId === (candidate.comboId ?? null) &&
        sameStringSet(sortedUnique(item.modifierIds), wantedModifiers),
    );
  }

  static fromPrisma(prisma: PrismaCartWithRelations): CartEntity {
    return new CartEntity({
      id: prisma.id,
      companyId: prisma.companyId,
      createdAt: prisma.createdAt,
      updatedAt: prisma.updatedAt,
      items: (prisma.items ?? []).map((item) => ({
        id: item.id,
        productId: item.productId,
        productSizeId: item.productSizeId,
        comboId: item.comboId,
        quantity: item.quantity,
        addedById: item.addedById,
        modifierIds: (item.modifiers ?? []).map(
          (modifier) => modifier.modifierId,
        ),
      })),
    });
  }
}

function sortedUnique(ids: string[]): string[] {
  return [...new Set(ids)].sort();
}

function sameStringSet(first: string[], second: string[]): boolean {
  if (first.length !== second.length) {
    return false;
  }
  return first.every((value, index) => value === second[index]);
}
