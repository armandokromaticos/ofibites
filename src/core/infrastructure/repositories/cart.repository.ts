import { Injectable } from "@nestjs/common";
import { PrismaService } from "../database/prisma/prisma.service";
import {
  AddCartItemParams,
  CART_FULL_INCLUDE,
  ICartRepository,
} from "../../domain/repositories/cart.repository.interface";
import { CartEntity } from "../../domain/entities/cart.entity";

@Injectable()
export class CartRepository implements ICartRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getOrCreateByCompanyId(companyId: string): Promise<CartEntity> {
    const cart = await this.prisma.cart.upsert({
      where: { companyId },
      create: { companyId },
      update: {},
      include: CART_FULL_INCLUDE,
    });
    return CartEntity.fromPrisma(cart);
  }

  async findByCompanyId(companyId: string): Promise<CartEntity | null> {
    const cart = await this.prisma.cart.findUnique({
      where: { companyId },
      include: CART_FULL_INCLUDE,
    });
    return cart ? CartEntity.fromPrisma(cart) : null;
  }

  async addItem(cartId: string, params: AddCartItemParams): Promise<void> {
    await this.prisma.cartItem.create({
      data: {
        cart: { connect: { id: cartId } },
        product: { connect: { id: params.productId } },
        productSize: params.productSizeId
          ? { connect: { id: params.productSizeId } }
          : undefined,
        combo: params.comboId ? { connect: { id: params.comboId } } : undefined,
        addedBy: params.addedById
          ? { connect: { id: params.addedById } }
          : undefined,
        quantity: params.quantity,
        modifiers: {
          create: params.modifierIds.map((modifierId) => ({
            modifier: { connect: { id: modifierId } },
          })),
        },
      },
    });
  }

  async updateItemQuantity(itemId: string, quantity: number): Promise<void> {
    await this.prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });
  }

  async incrementItemQuantity(itemId: string, delta: number): Promise<void> {
    await this.prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity: { increment: delta } },
    });
  }

  async removeItem(itemId: string): Promise<void> {
    await this.prisma.cartItem.delete({ where: { id: itemId } });
  }

  async clear(cartId: string): Promise<void> {
    await this.prisma.cartItem.deleteMany({ where: { cartId } });
  }
}
