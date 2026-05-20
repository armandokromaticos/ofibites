import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { IOrderRepository } from "../../../domain/repositories/order.repository.interface";
import { ORDER_REPOSITORY } from "../../../domain/repositories/order.repository.interface";
import type { ICompanyMemberRepository } from "../../../domain/repositories/company-member.repository.interface";
import { COMPANY_MEMBER_REPOSITORY } from "../../../domain/repositories/company-member.repository.interface";
import { OrderEntity } from "../../../domain/entities/order.entity";
import { Role } from "../../../domain/enums/role.enum";

const PLATFORM_FULL_ACCESS_ROLES: ReadonlySet<Role> = new Set([
  Role.SUPER_ADMIN,
  Role.OPS_ADMIN,
  Role.OPERATOR,
]);

@Injectable()
export class GetOrderUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
    @Inject(COMPANY_MEMBER_REPOSITORY)
    private readonly companyMemberRepository: ICompanyMemberRepository,
  ) {}

  async execute(
    orderId: string,
    userId: string,
    userRole: Role,
  ): Promise<OrderEntity> {
    const order = await this.orderRepository.findUnique({
      where: { id: orderId },
      include: { items: { include: { modifiers: true } } },
    });
    if (!order) {
      throw new NotFoundException(`Order with id ${orderId} not found`);
    }

    await this.assertCanRead(order, userId, userRole);
    return order;
  }

  private async assertCanRead(
    order: OrderEntity,
    userId: string,
    userRole: Role,
  ): Promise<void> {
    if (PLATFORM_FULL_ACCESS_ROLES.has(userRole)) {
      return;
    }

    // Role.CLIENT
    if (order.userId === userId) {
      return;
    }
    if (order.companyId) {
      const member =
        await this.companyMemberRepository.findActiveByUserAndCompany(
          userId,
          order.companyId,
        );
      if (member) {
        return;
      }
    }
    throw new ForbiddenException("No tienes acceso a esta orden");
  }
}
