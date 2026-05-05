import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../database/prisma/prisma.service";
import {
  IOrderRepository,
  OrderFilters,
} from "../../domain/repositories/order.repository.interface";
import { OrderEntity } from "../../domain/entities/order.entity";
import { OrderStatus } from "../../domain/enums/order-status.enum";

@Injectable()
export class OrderRepository implements IOrderRepository {
  constructor(private readonly prisma: PrismaService) {}

  private static readonly ORDER_INCLUDE = {
    items: {
      include: { modifiers: true },
    },
  };

  async create(entity: OrderEntity): Promise<OrderEntity> {
    const data = entity.toPrismaCreate();
    const order = await this.prisma.order.create({
      data: data as Prisma.OrderCreateInput,
      include: OrderRepository.ORDER_INCLUDE,
    });
    return OrderEntity.fromPrisma(order);
  }

  async findById(id: string): Promise<OrderEntity | null> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: OrderRepository.ORDER_INCLUDE,
    });
    return order ? OrderEntity.fromPrisma(order) : null;
  }

  async findByUserId(userId: string): Promise<OrderEntity[]> {
    const orders = await this.prisma.order.findMany({
      where: { userId },
      include: OrderRepository.ORDER_INCLUDE,
      orderBy: { createdAt: "desc" },
    });
    return orders.map((order) => OrderEntity.fromPrisma(order));
  }

  async findAll(filters?: OrderFilters): Promise<OrderEntity[]> {
    const where: Prisma.OrderWhereInput = {};

    if (filters?.userId) {
      where.userId = filters.userId;
    }

    if (filters?.status && filters.status.length > 0) {
      where.status = { in: filters.status };
    }

    const orders = await this.prisma.order.findMany({
      where,
      include: OrderRepository.ORDER_INCLUDE,
      orderBy: { createdAt: "desc" },
    });
    return orders.map((order) => OrderEntity.fromPrisma(order));
  }

  async updateStatus(id: string, status: OrderStatus): Promise<OrderEntity> {
    const order = await this.prisma.order.update({
      where: { id },
      data: { status },
      include: OrderRepository.ORDER_INCLUDE,
    });
    return OrderEntity.fromPrisma(order);
  }
}
