import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { IOrderRepository } from "../../../domain/repositories/order.repository.interface";
import { ORDER_REPOSITORY } from "../../../domain/repositories/order.repository.interface";
import { OrderEntity } from "../../../domain/entities/order.entity";
import { OrderStatus } from "../../../domain/enums/order-status.enum";
import { Role } from "../../../domain/enums/role.enum";

@Injectable()
export class CancelOrderUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
  ) {}

  async execute(
    orderId: string,
    userId: string,
    userRole: Role,
  ): Promise<OrderEntity> {
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw new NotFoundException(`Order with id ${orderId} not found`);
    }

    if (userRole !== Role.SUPER_ADMIN && order.userId !== userId) {
      throw new ForbiddenException("You can only cancel your own orders");
    }

    if (!order.canTransitionTo(OrderStatus.CANCELLED)) {
      throw new BadRequestException(
        `Order in status ${order.status} cannot be cancelled`,
      );
    }

    return this.orderRepository.updateStatus(orderId, OrderStatus.CANCELLED);
  }
}
