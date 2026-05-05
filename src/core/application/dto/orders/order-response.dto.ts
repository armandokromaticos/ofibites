import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { OrderPriority } from "../../../domain/enums/order-priority.enum";

export class OrderItemModifierResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  modifierId: string;

  @ApiProperty()
  priceAdjustment: number;
}

export class OrderItemResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  productId: string;

  @ApiPropertyOptional({ nullable: true, type: String })
  productSizeId: string | null;

  @ApiPropertyOptional({ nullable: true, type: String })
  comboId: string | null;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  unitPrice: number;

  @ApiProperty()
  subtotal: number;

  @ApiPropertyOptional({ type: () => [OrderItemModifierResponseDto] })
  modifiers?: OrderItemModifierResponseDto[];
}

export class OrderResponseDto {
  @ApiProperty()
  id: string;

  @ApiPropertyOptional({ nullable: true, type: String })
  userId: string | null;

  @ApiPropertyOptional({ nullable: true, type: String })
  couponId: string | null;

  @ApiPropertyOptional({ nullable: true, type: String })
  companyId: string | null;

  @ApiPropertyOptional({ nullable: true, type: String })
  branchId: string | null;

  @ApiPropertyOptional({ nullable: true, type: String })
  departmentId: string | null;

  @ApiPropertyOptional({ nullable: true, type: String })
  createdById: string | null;

  @ApiPropertyOptional({ nullable: true, type: String })
  deliveryAddressId: string | null;

  @ApiPropertyOptional({ nullable: true, type: Date })
  deliveryDate: Date | null;

  @ApiPropertyOptional({ nullable: true, type: String })
  deliveryTime: string | null;

  @ApiPropertyOptional({ nullable: true, type: String })
  notes: string | null;

  @ApiProperty({ enum: OrderPriority })
  priority: OrderPriority;

  @ApiProperty()
  status: string;

  @ApiProperty()
  subtotal: number;

  @ApiProperty()
  discount: number;

  @ApiProperty()
  total: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional({ type: () => [OrderItemResponseDto] })
  items?: OrderItemResponseDto[];
}
