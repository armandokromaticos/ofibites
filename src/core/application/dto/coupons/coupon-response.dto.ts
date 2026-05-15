import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { CouponType } from "../../../domain/enums/coupon-type.enum";

export class CouponUsageResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  orderId: string;

  @ApiProperty()
  usedAt: Date;
}

export class CouponResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: CouponType })
  type: CouponType;

  @ApiProperty()
  name: string;

  @ApiProperty()
  nameEs: string;

  @ApiPropertyOptional({ nullable: true, type: String })
  nameEn: string | null;

  @ApiProperty()
  discountPercent: number;

  @ApiProperty()
  maxDiscount: number;

  @ApiProperty()
  totalQuantity: number;

  @ApiProperty()
  usedQuantity: number;

  @ApiProperty()
  expiresAt: Date;

  @ApiProperty()
  isActive: boolean;

  @ApiPropertyOptional({ nullable: true, type: String })
  companyId: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional({ type: () => [CouponUsageResponseDto] })
  usages?: CouponUsageResponseDto[];
}
