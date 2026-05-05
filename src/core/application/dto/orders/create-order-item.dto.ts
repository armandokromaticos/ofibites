import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsUUID,
  IsInt,
  Min,
  IsOptional,
  ValidateNested,
  IsArray,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  Validate,
} from "class-validator";
import { Type } from "class-transformer";
import { CreateOrderItemModifierDto } from "./create-order-item-modifier.dto";

@ValidatorConstraint({ name: "MutuallyExclusiveIds", async: false })
class MutuallyExclusiveIdsConstraint implements ValidatorConstraintInterface {
  validate(_value: unknown, args: ValidationArguments) {
    const obj = args.object as CreateOrderItemDto;
    return !(obj.comboId && obj.productSizeId);
  }

  defaultMessage() {
    return "comboId and productSizeId cannot both be provided";
  }
}

export class CreateOrderItemDto {
  @ApiProperty({ example: "uuid-of-product" })
  @IsUUID()
  productId: string;

  @ApiPropertyOptional({ example: "uuid-of-product-size" })
  @IsOptional()
  @IsUUID()
  productSizeId?: string;

  @ApiPropertyOptional({ example: "uuid-of-combo" })
  @IsOptional()
  @IsUUID()
  @Validate(MutuallyExclusiveIdsConstraint)
  comboId?: string;

  @ApiProperty({ example: 2 })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiPropertyOptional({ type: () => [CreateOrderItemModifierDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemModifierDto)
  modifiers?: CreateOrderItemModifierDto[];
}
