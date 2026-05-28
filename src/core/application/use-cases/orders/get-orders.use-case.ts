import { Inject, Injectable } from "@nestjs/common";
import type { IOrderRepository } from "../../../domain/repositories/order.repository.interface";
import { ORDER_REPOSITORY } from "../../../domain/repositories/order.repository.interface";
import { OrderEntity } from "../../../domain/entities/order.entity";
import { Role } from "../../../domain/enums/role.enum";
import { OrderVisibilityResolver } from "../../services/order-visibility.resolver";

@Injectable()
export class GetOrdersUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
    private readonly visibilityResolver: OrderVisibilityResolver,
  ) {}

  async execute(
    userId: string,
    userRole: Role,
    companyIdFilter?: string,
  ): Promise<OrderEntity[]> {
    const visibility = await this.visibilityResolver.resolve(
      userId,
      userRole,
      companyIdFilter,
    );
    return this.orderRepository.findVisible({ visibility });
  }
}
