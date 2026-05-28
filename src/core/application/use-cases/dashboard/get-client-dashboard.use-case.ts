import { Inject, Injectable } from "@nestjs/common";
import type { IDashboardRepository } from "../../../domain/repositories/dashboard.repository.interface";
import { DASHBOARD_REPOSITORY } from "../../../domain/repositories/dashboard.repository.interface";
import { Role } from "../../../domain/enums/role.enum";
import { OrderVisibilityResolver } from "../../services/order-visibility.resolver";
import { caracasMonthRange } from "../../shared/caracas-time.util";
import { ClientDashboardResponseDto } from "../../dto/dashboard/client-dashboard-response.dto";

@Injectable()
export class GetClientDashboardUseCase {
  constructor(
    @Inject(DASHBOARD_REPOSITORY)
    private readonly dashboardRepository: IDashboardRepository,
    private readonly visibilityResolver: OrderVisibilityResolver,
  ) {}

  async execute(
    userId: string,
    userRole: Role,
    companyIdFilter?: string,
  ): Promise<ClientDashboardResponseDto> {
    const visibility = await this.visibilityResolver.resolve(
      userId,
      userRole,
      companyIdFilter,
    );
    const range = caracasMonthRange();
    return this.dashboardRepository.getClientDashboard(visibility, range);
  }
}
