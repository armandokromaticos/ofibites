import {
  Coupon as PrismaCoupon,
  CouponUsage as PrismaCouponUsage,
  Prisma,
} from "@prisma/client";
import { CouponType } from "../enums/coupon-type.enum";
import {
  CouponResponseDto,
  CouponUsageResponseDto,
} from "../../application/dto/coupons/coupon-response.dto";

type PrismaCouponWithUsages = PrismaCoupon & {
  usages?: PrismaCouponUsage[];
};

interface CouponUsageInfo {
  id: string;
  userId: string;
  orderId: string;
  usedAt: Date;
}

interface CouponProps {
  id: string | undefined;
  type: CouponType;
  nameEs: string;
  nameEn: string | null;
  discountPercent: number;
  maxDiscount: number;
  totalQuantity: number;
  usedQuantity: number;
  expiresAt: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  usages?: CouponUsageInfo[];
}

export interface CreateCouponParams {
  type: CouponType;
  nameEs: string;
  nameEn?: string | null;
  discountPercent: number;
  maxDiscount: number;
  totalQuantity: number;
  expiresAt: Date;
  isActive: boolean;
}

export class CouponEntity {
  private props: CouponProps;

  constructor(props: CouponProps) {
    this.props = props;
  }

  get id(): string | undefined {
    return this.props.id;
  }
  get type(): CouponType {
    return this.props.type;
  }
  get nameEs(): string {
    return this.props.nameEs;
  }
  get nameEn(): string | null {
    return this.props.nameEn;
  }
  get discountPercent(): number {
    return this.props.discountPercent;
  }
  get maxDiscount(): number {
    return this.props.maxDiscount;
  }
  get totalQuantity(): number {
    return this.props.totalQuantity;
  }
  get usedQuantity(): number {
    return this.props.usedQuantity;
  }
  get expiresAt(): Date {
    return this.props.expiresAt;
  }
  get isActive(): boolean {
    return this.props.isActive;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }
  get updatedAt(): Date {
    return this.props.updatedAt;
  }
  get usages(): CouponUsageInfo[] | undefined {
    return this.props.usages;
  }

  isValid(): boolean {
    return (
      this.props.isActive &&
      this.props.expiresAt > new Date() &&
      this.props.usedQuantity < this.props.totalQuantity
    );
  }

  hasBeenUsedByUser(userId: string): boolean {
    if (!this.props.usages) return false;
    return this.props.usages.some((usage) => usage.userId === userId);
  }

  calculateDiscount(subtotal: number): number {
    const discount =
      Math.round(subtotal * (this.props.discountPercent / 100) * 100) / 100;
    return Math.min(discount, this.props.maxDiscount);
  }

  static fromCreateDto(params: CreateCouponParams): CouponEntity {
    return new CouponEntity({
      id: undefined,
      type: params.type,
      nameEs: params.nameEs.toUpperCase(),
      nameEn: params.nameEn?.toUpperCase() || null,
      discountPercent: params.discountPercent,
      maxDiscount: params.maxDiscount,
      totalQuantity: params.totalQuantity,
      usedQuantity: 0,
      expiresAt: params.expiresAt,
      isActive: params.isActive,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static fromPrisma(prisma: PrismaCouponWithUsages): CouponEntity {
    const props: CouponProps = {
      id: prisma.id,
      type: prisma.type as CouponType,
      nameEs: prisma.nameEs,
      nameEn: prisma.nameEn ?? null,
      discountPercent: Number(prisma.discountPercent),
      maxDiscount: Number(prisma.maxDiscount),
      totalQuantity: prisma.totalQuantity,
      usedQuantity: prisma.usedQuantity,
      expiresAt: prisma.expiresAt,
      isActive: prisma.isActive,
      createdAt: prisma.createdAt,
      updatedAt: prisma.updatedAt,
    };

    if (prisma.usages) {
      props.usages = prisma.usages.map((usage) => ({
        id: usage.id,
        userId: usage.userId,
        orderId: usage.orderId,
        usedAt: usage.usedAt,
      }));
    }

    return new CouponEntity(props);
  }

  toPrismaCreate(): Prisma.CouponCreateInput {
    return {
      type: this.props.type,
      nameEs: this.props.nameEs,
      nameEn: this.props.nameEn,
      discountPercent: new Prisma.Decimal(this.props.discountPercent),
      maxDiscount: new Prisma.Decimal(this.props.maxDiscount),
      totalQuantity: this.props.totalQuantity,
      usedQuantity: this.props.usedQuantity,
      expiresAt: this.props.expiresAt,
      isActive: this.props.isActive,
    };
  }

  toResponseDto(lang: "es" | "en" = "es"): CouponResponseDto {
    if (!this.props.id) {
      throw new Error("Cannot convert unpersisted entity to response DTO");
    }
    const dto = new CouponResponseDto();
    dto.id = this.props.id;
    dto.type = this.props.type;
    dto.name =
      lang === "en"
        ? this.props.nameEn?.trim() || this.props.nameEs
        : this.props.nameEs;
    dto.nameEs = this.props.nameEs;
    dto.nameEn = this.props.nameEn;
    dto.discountPercent = this.props.discountPercent;
    dto.maxDiscount = this.props.maxDiscount;
    dto.totalQuantity = this.props.totalQuantity;
    dto.usedQuantity = this.props.usedQuantity;
    dto.expiresAt = this.props.expiresAt;
    dto.isActive = this.props.isActive;
    dto.createdAt = this.props.createdAt;
    dto.updatedAt = this.props.updatedAt;

    if (this.props.usages) {
      dto.usages = this.props.usages.map((usage) => {
        const usageDto = new CouponUsageResponseDto();
        usageDto.id = usage.id;
        usageDto.userId = usage.userId;
        usageDto.orderId = usage.orderId;
        usageDto.usedAt = usage.usedAt;
        return usageDto;
      });
    }

    return dto;
  }
}
