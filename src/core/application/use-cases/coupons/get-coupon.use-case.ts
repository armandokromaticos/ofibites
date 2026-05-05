import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { ICouponRepository } from "../../../domain/repositories/coupon.repository.interface";
import {
  COUPON_FULL_INCLUDE,
  COUPON_REPOSITORY,
} from "../../../domain/repositories/coupon.repository.interface";
import { CouponEntity } from "../../../domain/entities/coupon.entity";

@Injectable()
export class GetCouponUseCase {
  constructor(
    @Inject(COUPON_REPOSITORY)
    private readonly couponRepository: ICouponRepository,
  ) {}

  async execute(id: string): Promise<CouponEntity> {
    const coupon = await this.couponRepository.findUnique({
      where: { id },
      include: COUPON_FULL_INCLUDE,
    });
    if (!coupon) {
      throw new NotFoundException(`Coupon with id ${id} not found`);
    }
    return coupon;
  }
}
