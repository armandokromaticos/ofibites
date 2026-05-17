import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import type { ICouponRepository } from "../../../domain/repositories/coupon.repository.interface";
import {
  COUPON_FULL_INCLUDE,
  COUPON_REPOSITORY,
} from "../../../domain/repositories/coupon.repository.interface";
import type { ICompanyRepository } from "../../../domain/repositories/company.repository.interface";
import { COMPANY_REPOSITORY } from "../../../domain/repositories/company.repository.interface";
import { UpdateCouponDto } from "../../dto/coupons/update-coupon.dto";
import { CouponEntity } from "../../../domain/entities/coupon.entity";

@Injectable()
export class UpdateCouponUseCase {
  constructor(
    @Inject(COUPON_REPOSITORY)
    private readonly couponRepository: ICouponRepository,
    @Inject(COMPANY_REPOSITORY)
    private readonly companyRepository: ICompanyRepository,
  ) {}

  async execute(id: string, dto: UpdateCouponDto): Promise<CouponEntity> {
    const coupon = await this.couponRepository.findUnique({ where: { id } });
    if (!coupon) {
      throw new NotFoundException(`Coupon with id ${id} not found`);
    }

    const data: Prisma.CouponUpdateInput = {};

    if (dto.nameEs !== undefined) {
      const nameUpper = dto.nameEs.trim().toUpperCase();
      const existing = await this.couponRepository.findByName(nameUpper);
      if (existing && existing.id !== id) {
        throw new BadRequestException(
          `Coupon with name "${nameUpper}" already exists`,
        );
      }
      data.nameEs = nameUpper;
    }
    if (dto.nameEn !== undefined) {
      data.nameEn = dto.nameEn ? dto.nameEn.trim().toUpperCase() : null;
    }
    if (dto.discountPercent !== undefined) {
      data.discountPercent = new Prisma.Decimal(dto.discountPercent);
    }
    if (dto.maxDiscount !== undefined) {
      data.maxDiscount = new Prisma.Decimal(dto.maxDiscount);
    }
    if (dto.totalQuantity !== undefined) data.totalQuantity = dto.totalQuantity;
    if (dto.expiresAt !== undefined) data.expiresAt = new Date(dto.expiresAt);
    if (dto.isActive !== undefined) data.isActive = dto.isActive;
    if (dto.companyId !== undefined) {
      if (dto.companyId === null) {
        data.company = { disconnect: true };
      } else {
        const companyExists = await this.companyRepository.exists({
          where: { id: dto.companyId },
        });
        if (!companyExists) {
          throw new NotFoundException(`Company ${dto.companyId} not found`);
        }
        data.company = { connect: { id: dto.companyId } };
      }
    }

    return this.couponRepository.update({
      where: { id },
      data,
      include: COUPON_FULL_INCLUDE,
    });
  }
}
