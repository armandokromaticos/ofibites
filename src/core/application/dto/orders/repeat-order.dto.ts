import { ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsOptional,
  IsString,
  IsUUID,
  IsDateString,
  IsEnum,
  MaxLength,
  Matches,
} from "class-validator";
import { OrderPriority } from "../../../domain/enums/order-priority.enum";

/**
 * Overrides opcionales al repetir un pedido. Lo que no se envía se hereda del
 * pedido original, salvo `deliveryDate`/`deliveryTime` que nunca se replican
 * (decisión de producto): quedan null a menos que se envíen aquí.
 */
export class RepeatOrderDto {
  @ApiPropertyOptional({
    description: "Si se omite, hereda la del pedido original",
  })
  @IsOptional()
  @IsUUID()
  deliveryAddressId?: string;

  @ApiPropertyOptional({
    description: "Si se omite, hereda la del pedido original",
  })
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @ApiPropertyOptional({
    description: "Si se omite, hereda la del pedido original",
  })
  @IsOptional()
  @IsUUID()
  departmentId?: string;

  @ApiPropertyOptional({
    example: "2026-05-30",
    description: "No se hereda del original",
  })
  @IsOptional()
  @IsDateString()
  deliveryDate?: string;

  @ApiPropertyOptional({
    example: "09:30",
    description: "No se hereda del original",
  })
  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: "deliveryTime must be in HH:mm format",
  })
  deliveryTime?: string;

  @ApiPropertyOptional({
    description: "Si se omite, hereda las del pedido original",
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;

  @ApiPropertyOptional({ enum: OrderPriority })
  @IsOptional()
  @IsEnum(OrderPriority)
  priority?: OrderPriority;
}
