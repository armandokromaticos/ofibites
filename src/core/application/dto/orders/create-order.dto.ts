import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsOptional,
  IsString,
  IsArray,
  ArrayMinSize,
  ValidateNested,
  IsUUID,
  IsDateString,
  IsEnum,
  MaxLength,
  Matches,
} from "class-validator";
import { Type } from "class-transformer";
import { CreateOrderItemDto } from "./create-order-item.dto";
import { OrderPriority } from "../../../domain/enums/order-priority.enum";

export class CreateOrderDto {
  @ApiPropertyOptional({
    example: "VERANO2026",
    description: "Codigo del cupon a aplicar",
  })
  @IsOptional()
  @IsString()
  couponCode?: string;

  @ApiPropertyOptional({
    example: "uuid-of-company-address",
    description: "Direccion de entrega (sede de la empresa)",
  })
  @IsOptional()
  @IsUUID()
  deliveryAddressId?: string;

  @ApiPropertyOptional({
    example: "2026-05-12",
    description: "Fecha de entrega (ISO date)",
  })
  @IsOptional()
  @IsDateString()
  deliveryDate?: string;

  @ApiPropertyOptional({
    example: "09:30",
    description: "Hora de entrega (HH:mm)",
  })
  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: "deliveryTime must be in HH:mm format",
  })
  deliveryTime?: string;

  @ApiPropertyOptional({ example: "Entregar en recepción" })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;

  @ApiPropertyOptional({ enum: OrderPriority, example: OrderPriority.MEDIUM })
  @IsOptional()
  @IsEnum(OrderPriority)
  priority?: OrderPriority;

  @ApiProperty({ type: () => [CreateOrderItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];
}
