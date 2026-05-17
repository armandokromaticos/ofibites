import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { CompaniesModule } from "../companies/companies.module";
import { CouponsController } from "./controllers/coupons.controller";
import { COUPON_REPOSITORY } from "../../core/domain/repositories/coupon.repository.interface";
import { CouponRepository } from "../../core/infrastructure/repositories/coupon.repository";
import { CreateCouponUseCase } from "../../core/application/use-cases/coupons/create-coupon.use-case";
import { GetCouponsUseCase } from "../../core/application/use-cases/coupons/get-coupons.use-case";
import { GetCouponUseCase } from "../../core/application/use-cases/coupons/get-coupon.use-case";
import { UpdateCouponUseCase } from "../../core/application/use-cases/coupons/update-coupon.use-case";
import { ToggleCouponUseCase } from "../../core/application/use-cases/coupons/toggle-coupon.use-case";

@Module({
  imports: [AuthModule, CompaniesModule],
  controllers: [CouponsController],
  providers: [
    { provide: COUPON_REPOSITORY, useClass: CouponRepository },
    CreateCouponUseCase,
    GetCouponsUseCase,
    GetCouponUseCase,
    UpdateCouponUseCase,
    ToggleCouponUseCase,
  ],
  exports: [COUPON_REPOSITORY],
})
export class CouponsModule {}
