import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../database/prisma/prisma.service";
import {
  COUPON_FULL_INCLUDE,
  ICouponRepository,
} from "../../domain/repositories/coupon.repository.interface";
import { CouponEntity } from "../../domain/entities/coupon.entity";

@Injectable()
export class CouponRepository implements ICouponRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(entity: CouponEntity): Promise<CouponEntity> {
    const coupon = await this.prisma.coupon.create({
      data: entity.toPrismaCreate(),
      include: COUPON_FULL_INCLUDE,
    });
    return CouponEntity.fromPrisma(coupon);
  }

  async findUnique(
    args: Prisma.CouponFindUniqueArgs,
  ): Promise<CouponEntity | null> {
    const coupon = await this.prisma.coupon.findUnique(args);
    return coupon ? CouponEntity.fromPrisma(coupon) : null;
  }

  async findMany(
    args?: Prisma.CouponFindManyArgs,
  ): Promise<{ data: CouponEntity[]; total?: number }> {
    const rows = await this.prisma.coupon.findMany(args);
    const data = rows.map((row) => CouponEntity.fromPrisma(row));

    const hasPagination =
      typeof args?.skip === "number" || typeof args?.take === "number";
    if (hasPagination) {
      const total = await this.prisma.coupon.count({ where: args?.where });
      return { data, total };
    }
    return { data };
  }

  async update(args: Prisma.CouponUpdateArgs): Promise<CouponEntity> {
    const coupon = await this.prisma.coupon.update(args);
    return CouponEntity.fromPrisma(coupon);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.coupon.delete({ where: { id } });
  }

  async exists(args: Prisma.CouponCountArgs): Promise<boolean> {
    const count = await this.prisma.coupon.count(args);
    return count > 0;
  }

  async findByName(name: string): Promise<CouponEntity | null> {
    const coupon = await this.prisma.coupon.findUnique({
      where: { nameEs: name },
      include: COUPON_FULL_INCLUDE,
    });
    return coupon ? CouponEntity.fromPrisma(coupon) : null;
  }

  async consumeCoupon(
    couponId: string,
    userId: string,
    orderId: string,
  ): Promise<void> {
    await this.prisma.$transaction(async (prisma) => {
      await prisma.couponUsage.create({
        data: { couponId, userId, orderId },
      });
      const updated =
        await prisma.$executeRaw`UPDATE coupons SET used_quantity = used_quantity + 1 WHERE id = ${couponId}::uuid AND used_quantity < total_quantity`;
      if (updated === 0) {
        throw new Error("Coupon has no remaining uses");
      }
    });
  }
}
