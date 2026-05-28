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

export interface RankedProduct {
  productId: string;
  name: string;
  quantity: number;
}

export interface RankedCombo {
  comboId: string;
  name: string;
  quantity: number;
}

export interface RankedCompany {
  companyId: string;
  name: string;
  total: number;
}

export interface AdminDashboardData {
  ordersToday: number;
  inPreparation: number;
  inTransit: number;
  billingThisMonth: number;
  ordersPerDay: OrdersPerDayPoint[];
  topProducts: RankedProduct[];
  topCombos: RankedCombo[];
  top5Companies: RankedCompany[];
}

export interface DashboardMonthRange {
  monthStart: Date;
  monthEnd: Date;
}

export interface AdminDashboardRange extends DashboardMonthRange {
  dayStart: Date;
  dayEnd: Date;
}

export interface IDashboardRepository {
  getClientDashboard(
    visibility: OrderVisibilityFilter,
    range: DashboardMonthRange,
  ): Promise<ClientDashboardData>;

  getAdminDashboard(
    visibility: OrderVisibilityFilter,
    range: AdminDashboardRange,
  ): Promise<AdminDashboardData>;
}
