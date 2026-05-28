import { ApiProperty } from "@nestjs/swagger";

export class OrdersPerDayPointDto {
  @ApiProperty({
    example: "2026-05-28",
    description: "Fecha en hora de Caracas",
  })
  date: string;

  @ApiProperty({ example: 3 })
  count: number;
}

export class TopOrderDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ type: Number })
  total: number;

  @ApiProperty()
  status: string;

  @ApiProperty({ type: Date })
  createdAt: Date;
}

export class ClientDashboardResponseDto {
  @ApiProperty({ description: "Total de pedidos del scope (histórico)" })
  totalOrders: number;

  @ApiProperty({ description: "Pedidos en estados no terminales" })
  inProgressOrders: number;

  @ApiProperty({
    type: () => [OrdersPerDayPointDto],
    description:
      "Pedidos realizados por día (mes actual, por fecha de creación)",
  })
  ordersPerDay: OrdersPerDayPointDto[];

  @ApiProperty({
    type: () => [TopOrderDto],
    description: "Top 5 pedidos del mes por monto total",
  })
  topOrders: TopOrderDto[];
}
