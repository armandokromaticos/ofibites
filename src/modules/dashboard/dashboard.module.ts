import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { DashboardController } from "./controllers/dashboard.controller";
import { DASHBOARD_REPOSITORY } from "../../core/domain/repositories/dashboard.repository.interface";
import { DashboardRepository } from "../../core/infrastructure/repositories/dashboard.repository";
import { OrderVisibilityResolver } from "../../core/application/services/order-visibility.resolver";
import { GetClientDashboardUseCase } from "../../core/application/use-cases/dashboard/get-client-dashboard.use-case";

@Module({
  imports: [AuthModule],
  controllers: [DashboardController],
  providers: [
    { provide: DASHBOARD_REPOSITORY, useClass: DashboardRepository },
    OrderVisibilityResolver,
    GetClientDashboardUseCase,
  ],
})
export class DashboardModule {}
