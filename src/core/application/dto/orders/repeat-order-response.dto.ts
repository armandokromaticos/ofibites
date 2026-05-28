import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { OrderResponseDto } from "./order-response.dto";

export class SkippedOrderItemDto {
  @ApiProperty()
  productId: string;

  @ApiPropertyOptional({ nullable: true, type: String })
  comboId: string | null;

  @ApiProperty({
    description:
      "Motivo de la omisión: product_not_found | product_inactive | size_not_found | size_inactive | combo_not_found | combo_inactive | pricing_failed",
  })
  reason: string;
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
