import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { OrderResponseDto } from "./order-response.dto";

/** Motivo por el que un ítem del pedido original se omitió al repetir. */
export enum RepeatOrderOmissionReason {
  PRODUCT_NOT_FOUND = "product_not_found",
  PRODUCT_INACTIVE = "product_inactive",
  SIZE_NOT_FOUND = "size_not_found",
  SIZE_INACTIVE = "size_inactive",
  COMBO_NOT_FOUND = "combo_not_found",
  COMBO_INACTIVE = "combo_inactive",
  PRICING_FAILED = "pricing_failed",
}

export class SkippedOrderItemDto {
  @ApiProperty()
  productId: string;

  @ApiPropertyOptional({ nullable: true, type: String })
  comboId: string | null;

  @ApiProperty({
    enum: RepeatOrderOmissionReason,
    description: "Motivo de la omisión",
  })
  reason: RepeatOrderOmissionReason;
}

export class RepeatOrderResponseDto {
  @ApiProperty({
    type: () => OrderResponseDto,
    description: "Pedido nuevo creado",
  })
  order: OrderResponseDto;

  @ApiProperty({
    type: () => [SkippedOrderItemDto],
    description:
      "Ítems del pedido original que se omitieron por no estar disponibles",
  })
  skippedItems: SkippedOrderItemDto[];
}
