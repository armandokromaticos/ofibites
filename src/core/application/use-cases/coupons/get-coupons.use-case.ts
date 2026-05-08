import { Inject, Injectable } from "@nestjs/common";
import type { ICouponRepository } from "../../../domain/repositories/coupon.repository.interface";
import {
  COUPON_FULL_INCLUDE,
  COUPON_REPOSITORY,
} from "../../../domain/repositories/coupon.repository.interface";
import { CouponEntity } from "../../../domain/entities/coupon.entity";
import { CouponType } from "../../../domain/enums/coupon-type.enum";

@Injectable()
export class GetCouponsUseCase {
  constructor(
    @Inject(COUPON_REPOSITORY)
    private readonly couponRepository: ICouponRepository,
  ) {}

  async execute(type?: CouponType): Promise<CouponEntity[]> {
    const where = type ? { type } : undefined;
    const { data } = await this.couponRepository.findMany({
      where,
      include: COUPON_FULL_INCLUDE,
      orderBy: { createdAt: "desc" },
    });
    return data;
  }
}
