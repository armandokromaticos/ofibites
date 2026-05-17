import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { ICouponRepository } from "../../../domain/repositories/coupon.repository.interface";
import { COUPON_REPOSITORY } from "../../../domain/repositories/coupon.repository.interface";
import type { ICompanyRepository } from "../../../domain/repositories/company.repository.interface";
import { COMPANY_REPOSITORY } from "../../../domain/repositories/company.repository.interface";
import { CreateCouponDto } from "../../dto/coupons/create-coupon.dto";
import { CouponEntity } from "../../../domain/entities/coupon.entity";

@Injectable()
export class CreateCouponUseCase {
  constructor(
    @Inject(COUPON_REPOSITORY)
    private readonly couponRepository: ICouponRepository,
    @Inject(COMPANY_REPOSITORY)
    private readonly companyRepository: ICompanyRepository,
  ) {}

  async execute(dto: CreateCouponDto): Promise<CouponEntity> {
    const nameUpper = dto.nameEs.trim().toUpperCase();
    const existing = await this.couponRepository.findByName(nameUpper);
    if (existing) {
      throw new BadRequestException(
        `Coupon with name "${nameUpper}" already exists`,
      );
    }

    if (dto.companyId) {
      const companyExists = await this.companyRepository.exists({
        where: { id: dto.companyId },
      });
      if (!companyExists) {
        throw new NotFoundException(`Company ${dto.companyId} not found`);
      }
    }

    const entity = CouponEntity.fromCreateDto({
      type: dto.type,
      nameEs: dto.nameEs,
      nameEn: dto.nameEn,
      discountPercent: dto.discountPercent,
      maxDiscount: dto.maxDiscount,
      totalQuantity: dto.totalQuantity,
      expiresAt: new Date(dto.expiresAt),
      isActive: dto.isActive ?? true,
      companyId: dto.companyId,
    });

    return await this.couponRepository.create(entity);
  }
}
