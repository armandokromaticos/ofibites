import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../database/prisma/prisma.service";
import {
  AdminDashboardData,
  AdminDashboardRange,
  ClientDashboardData,
  DashboardMonthRange,
  IDashboardRepository,
  OrdersPerDayPoint,
} from "../../domain/repositories/dashboard.repository.interface";
import { OrderVisibilityFilter } from "../../domain/repositories/order.repository.interface";
import { OrderStatus } from "../../domain/enums/order-status.enum";
import {
  ORDER_BILLING_STATUSES,
  ORDER_IN_PROGRESS_STATUSES,
} from "../../domain/services/order-status-groups";
import { toCaracasDateKey } from "../../application/shared/caracas-time.util";
import { buildOrderVisibilityWhere } from "./order-visibility.where";

@Injectable()
export class DashboardRepository implements IDashboardRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getClientDashboard(
    visibility: OrderVisibilityFilter,
    range: DashboardMonthRange,
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

  async getAdminDashboard(
    visibility: OrderVisibilityFilter,
    range: AdminDashboardRange,
  ): Promise<AdminDashboardData> {
    const scopeWhere = buildOrderVisibilityWhere(visibility);
    // Rankings y facturación cuentan solo ventas reales (confirmadas en
    // adelante) del mes en curso.
    const billingMonthWhere: Prisma.OrderWhereInput = {
      ...scopeWhere,
      status: { in: [...ORDER_BILLING_STATUSES] },
      createdAt: { gte: range.monthStart, lt: range.monthEnd },
    };

    const [
      ordersToday,
      inPreparation,
      inTransit,
      billingAgg,
      monthOrders,
      topProductsRaw,
      topCombosRaw,
      topCompaniesRaw,
    ] = await Promise.all([
      this.prisma.order.count({
        where: {
          ...scopeWhere,
          deliveryDate: { gte: range.dayStart, lt: range.dayEnd },
        },
      }),
      this.prisma.order.count({
        where: { ...scopeWhere, status: OrderStatus.IN_PREPARATION },
      }),
      this.prisma.order.count({
        where: { ...scopeWhere, status: OrderStatus.IN_TRANSIT },
      }),
      this.prisma.order.aggregate({
        where: billingMonthWhere,
        _sum: { total: true },
      }),
      this.prisma.order.findMany({
        where: {
          ...scopeWhere,
          createdAt: { gte: range.monthStart, lt: range.monthEnd },
        },
        select: { createdAt: true },
      }),
      this.prisma.orderItem.groupBy({
        by: ["productId"],
        where: { comboId: null, order: billingMonthWhere },
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 5,
      }),
      this.prisma.orderItem.groupBy({
        by: ["comboId"],
        where: { comboId: { not: null }, order: billingMonthWhere },
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 5,
      }),
      this.prisma.order.groupBy({
        by: ["companyId"],
        where: billingMonthWhere,
        _sum: { total: true },
        orderBy: { _sum: { total: "desc" } },
        take: 5,
      }),
    ]);

    const productIds = topProductsRaw.map((row) => row.productId);
    const comboIds = topCombosRaw
      .map((row) => row.comboId)
      .filter((id): id is string => id !== null);
    const companyIds = topCompaniesRaw.map((row) => row.companyId);

    // `{ in: [] }` no matchea nada; evitamos el branching para no romper la
    // inferencia de tipos y el costo extra es despreciable.
    const [products, combos, companies] = await Promise.all([
      this.prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, nameEs: true },
      }),
      this.prisma.combo.findMany({
        where: { id: { in: comboIds } },
        select: { id: true, nameEs: true },
      }),
      this.prisma.company.findMany({
        where: { id: { in: companyIds } },
        select: { id: true, legalName: true },
      }),
    ]);

    const productName = new Map(products.map((p) => [p.id, p.nameEs] as const));
    const comboName = new Map(combos.map((c) => [c.id, c.nameEs] as const));
    const companyName = new Map(
      companies.map((c) => [c.id, c.legalName] as const),
    );

    return {
      ordersToday,
      inPreparation,
      inTransit,
      billingThisMonth: Number(billingAgg._sum.total ?? 0),
      ordersPerDay: this.bucketByDay(monthOrders),
      topProducts: topProductsRaw.map((row) => ({
        productId: row.productId,
        name: productName.get(row.productId) ?? "",
        quantity: row._sum.quantity ?? 0,
      })),
      topCombos: topCombosRaw.map((row) => ({
        comboId: row.comboId as string,
        name: comboName.get(row.comboId as string) ?? "",
        quantity: row._sum.quantity ?? 0,
      })),
      top5Companies: topCompaniesRaw.map((row) => ({
        companyId: row.companyId,
        name: companyName.get(row.companyId) ?? "",
        total: Number(row._sum.total ?? 0),
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
