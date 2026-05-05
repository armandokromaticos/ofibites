import type { StateMachine } from "../interfaces";
import { OrderStatus } from "../enums/order-status.enum";
import { InvalidStateTransitionException } from "../exceptions/invalid-state-transition.exception";

export class OrderStateMachine implements StateMachine<OrderStatus> {
  private static readonly transitions = new Map<OrderStatus, Set<OrderStatus>>([
    [
      OrderStatus.CREATED,
      new Set([
        OrderStatus.PENDING_APPROVAL,
        OrderStatus.PENDING_CONFIRMATION,
        OrderStatus.CANCELLED,
      ]),
    ],
    [
      OrderStatus.PENDING_APPROVAL,
      new Set([
        OrderStatus.PENDING_CONFIRMATION,
        OrderStatus.REJECTED,
        OrderStatus.CANCELLED,
      ]),
    ],
    [
      OrderStatus.PENDING_CONFIRMATION,
      new Set([
        OrderStatus.CONFIRMED,
        OrderStatus.REJECTED,
        OrderStatus.IN_ADJUSTMENT,
        OrderStatus.CANCELLED,
      ]),
    ],
    [
      OrderStatus.IN_ADJUSTMENT,
      new Set([OrderStatus.PENDING_CONFIRMATION, OrderStatus.CANCELLED]),
    ],
    [
      OrderStatus.CONFIRMED,
      new Set([OrderStatus.IN_PREPARATION, OrderStatus.CANCELLED]),
    ],
    [
      OrderStatus.IN_PREPARATION,
      new Set([OrderStatus.IN_TRANSIT, OrderStatus.CANCELLED]),
    ],
    [OrderStatus.IN_TRANSIT, new Set([OrderStatus.DELIVERED])],
    [OrderStatus.DELIVERED, new Set()],
    [OrderStatus.REJECTED, new Set()],
    [OrderStatus.CANCELLED, new Set()],
  ]);

  canTransition(from: OrderStatus, targetStatus: OrderStatus): boolean {
    const allowed = OrderStateMachine.transitions.get(from);
    return allowed?.has(targetStatus) ?? false;
  }

  transition(from: OrderStatus, targetStatus: OrderStatus): OrderStatus {
    if (!this.canTransition(from, targetStatus)) {
      throw new InvalidStateTransitionException("Order", from, targetStatus);
    }
    return targetStatus;
  }

  getAllowedTransitions(from: OrderStatus): OrderStatus[] {
    const allowed = OrderStateMachine.transitions.get(from);
    return allowed ? Array.from(allowed) : [];
  }
}
