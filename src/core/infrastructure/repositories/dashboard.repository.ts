import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../database/prisma/prisma.service";
import {
  ClientDashboardData,
  IDashboardRepository,
  OrdersPerDayPoint,
} from "../../domain/repositories/dashboard.repository.interface";
import { OrderVisibilityFilter } from "../../domain/repositories/order.repository.interface";
import { ORDER_IN_PROGRESS_STATUSES } from "../../domain/services/order-status-groups";
import { toCaracasDateKey } from "../../application/shared/caracas-time.util";
import { buildOrderVisibilityWhere } from "./order-visibility.where";

@Injectable()
export class DashboardRepository implements IDashboardRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getClientDashboard(
    visibility: OrderVisibilityFilter,
    range: { monthStart: Date; monthEnd: Date },
  ): Promise<ClientDashboardData> {
    const scopeWhere = buildOrderVisibilityWhere(visibility);
    const monthWhere: Prisma.OrderWhereInput = {
      ...scopeWhere,
      createdAt: { gte: range.monthStart, lt: range.monthEnd },
    };

    const [totalOrders, inProgressOrders, monthOrders, topOrdersRaw] =
      await Promise.all([
        this.prisma.order.count({ where: scopeWhere }),
        this.prisma.order.count({
          where: {
            ...scopeWhere,
            status: { in: [...ORDER_IN_PROGRESS_STATUSES] },
          },
        }),
        this.prisma.order.findMany({
          where: monthWhere,
          select: { createdAt: true },
        }),
        this.prisma.order.findMany({
          where: monthWhere,
          orderBy: { total: "desc" },
          take: 5,
          select: { id: true, total: true, status: true, createdAt: true },
        }),
      ]);

    return {
      totalOrders,
      inProgressOrders,
      ordersPerDay: this.bucketByDay(monthOrders),
      topOrders: topOrdersRaw.map((order) => ({
        id: order.id,
        total: Number(order.total),
        status: order.status,
        createdAt: order.createdAt,
      })),
    };
  }

  private bucketByDay(rows: { createdAt: Date }[]): OrdersPerDayPoint[] {
    const counts = new Map<string, number>();
    for (const row of rows) {
      const key = toCaracasDateKey(row.createdAt);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return [...counts.entries()]
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }
}
