import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../database/prisma/prisma.service";
import {
  IOrderRepository,
  ORDER_FULL_INCLUDE,
  OrderListFilters,
} from "../../domain/repositories/order.repository.interface";
import { OrderEntity } from "../../domain/entities/order.entity";
import { OrderStatus } from "../../domain/enums/order-status.enum";
import { buildOrderVisibilityWhere } from "./order-visibility.where";

@Injectable()
export class OrderRepository implements IOrderRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(entity: OrderEntity): Promise<OrderEntity> {
    const order = await this.prisma.order.create({
      data: entity.toPrismaCreate(),
      include: ORDER_FULL_INCLUDE,
    });
    return OrderEntity.fromPrisma(order);
  }

  async findUnique(
    args: Prisma.OrderFindUniqueArgs,
  ): Promise<OrderEntity | null> {
    const order = await this.prisma.order.findUnique(args);
    return order ? OrderEntity.fromPrisma(order) : null;
  }

  async findMany(
    args?: Prisma.OrderFindManyArgs,
  ): Promise<{ data: OrderEntity[]; total?: number }> {
    const rows = await this.prisma.order.findMany(args);
    const data = rows.map((row) => OrderEntity.fromPrisma(row));

    const hasPagination =
      typeof args?.skip === "number" || typeof args?.take === "number";
    if (hasPagination) {
      const total = await this.prisma.order.count({ where: args?.where });
      return { data, total };
    }
    return { data };
  }

  async update(args: Prisma.OrderUpdateArgs): Promise<OrderEntity> {
    const order = await this.prisma.order.update(args);
    return OrderEntity.fromPrisma(order);
  }

  async exists(args: Prisma.OrderCountArgs): Promise<boolean> {
    const count = await this.prisma.order.count(args);
    return count > 0;
  }

  async findVisible(filters: OrderListFilters): Promise<OrderEntity[]> {
    const where = buildOrderVisibilityWhere(filters.visibility);

    if (filters.statuses && filters.statuses.length > 0) {
      where.status = { in: filters.statuses };
    }

    const orders = await this.prisma.order.findMany({
      where,
      include: ORDER_FULL_INCLUDE,
      orderBy: { createdAt: "desc" },
    });
    return orders.map((order) => OrderEntity.fromPrisma(order));
  }

  async updateStatus(id: string, status: OrderStatus): Promise<OrderEntity> {
    const order = await this.prisma.order.update({
      where: { id },
      data: { status },
      include: ORDER_FULL_INCLUDE,
    });
    return OrderEntity.fromPrisma(order);
  }
}
