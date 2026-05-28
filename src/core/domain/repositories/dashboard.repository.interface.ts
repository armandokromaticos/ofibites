import { OrderVisibilityFilter } from "./order.repository.interface";

export const DASHBOARD_REPOSITORY = Symbol("DASHBOARD_REPOSITORY");

export interface OrdersPerDayPoint {
  /** Fecha en hora de Caracas, formato "YYYY-MM-DD". */
  date: string;
  count: number;
}

export interface TopOrderSummary {
  id: string;
  total: number;
  status: string;
  createdAt: Date;
}

export interface ClientDashboardData {
  totalOrders: number;
  inProgressOrders: number;
  ordersPerDay: OrdersPerDayPoint[];
  topOrders: TopOrderSummary[];
}

export interface IDashboardRepository {
  getClientDashboard(
    visibility: OrderVisibilityFilter,
    range: { monthStart: Date; monthEnd: Date },
  ): Promise<ClientDashboardData>;
}
