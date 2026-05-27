import { Prisma } from "@prisma/client";
import { CartEntity } from "../entities/cart.entity";

export const CART_REPOSITORY = Symbol("CART_REPOSITORY");

export const CART_FULL_INCLUDE = {
  items: { include: { modifiers: true } },
} as const satisfies Prisma.CartInclude;

export interface AddCartItemParams {
  productId: string;
  productSizeId?: string | null;
  comboId?: string | null;
  quantity: number;
  modifierIds: string[];
  addedById?: string | null;
}

export interface ICartRepository {
  // El carrito es único por empresa, por eso el acceso es por companyId en vez
  // del CRUD genérico. getOrCreate evita el race de creación vía upsert.
  getOrCreateByCompanyId(companyId: string): Promise<CartEntity>;
  findByCompanyId(companyId: string): Promise<CartEntity | null>;
  addItem(cartId: string, params: AddCartItemParams): Promise<void>;
  updateItemQuantity(itemId: string, quantity: number): Promise<void>;
  // Incremento atómico (quantity = quantity + delta) para evitar lost updates
  // al sumar a una línea existente desde requests concurrentes.
  incrementItemQuantity(itemId: string, delta: number): Promise<void>;
  removeItem(itemId: string): Promise<void>;
  clear(cartId: string): Promise<void>;
}
