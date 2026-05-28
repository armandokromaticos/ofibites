import { OrderStatus } from "../enums/order-status.enum";

// Estados terminales: el pedido ya no avanza.
const TERMINAL = new Set<OrderStatus>([
  OrderStatus.DELIVERED,
  OrderStatus.CANCELLED,
  OrderStatus.REJECTED,
]);

export const ORDER_TERMINAL_STATUSES: readonly OrderStatus[] = [...TERMINAL];

// "En curso": pedido vivo (cualquier estado no terminal). Se deriva del set de
// terminales para que un nuevo estado del enum entre aquí por default.
export const ORDER_IN_PROGRESS_STATUSES: readonly OrderStatus[] = Object.values(
  OrderStatus,
).filter((status) => !TERMINAL.has(status));
