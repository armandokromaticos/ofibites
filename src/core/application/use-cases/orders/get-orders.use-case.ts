import { Inject, Injectable } from "@nestjs/common";
import type { IOrderRepository } from "../../../domain/repositories/order.repository.interface";
import { ORDER_REPOSITORY } from "../../../domain/repositories/order.repository.interface";
import { OrderEntity } from "../../../domain/entities/order.entity";
import { Role } from "../../../domain/enums/role.enum";

@Injectable()
export class GetOrdersUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
  ) {}

  async execute(userId: string, userRole: Role): Promise<OrderEntity[]> {
    if (userRole === Role.SUPER_ADMIN) {
      return this.orderRepository.findAll();
    }

    return this.orderRepository.findByUserId(userId);
  }
}
