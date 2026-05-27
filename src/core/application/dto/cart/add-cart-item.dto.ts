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

@ValidatorConstraint({ name: "CartItemMutuallyExclusiveIds", async: false })
class MutuallyExclusiveIdsConstraint implements ValidatorConstraintInterface {
  validate(_value: unknown, args: ValidationArguments) {
    const obj = args.object as AddCartItemDto;
    return !(obj.comboId && obj.productSizeId);
  }

  defaultMessage() {
    return "comboId and productSizeId cannot both be provided";
  }
}

@ValidatorConstraint({ name: "UniqueModifierIds", async: false })
class UniqueModifierIdsConstraint implements ValidatorConstraintInterface {
  validate(value: unknown) {
    if (!Array.isArray(value)) {
      return true;
    }
    const ids = value
      .map((modifier: CartItemModifierInputDto) => modifier?.modifierId)
      .filter((id): id is string => typeof id === "string");
    return new Set(ids).size === ids.length;
  }

  defaultMessage() {
    return "modifiers must not contain duplicate modifierId";
  }
}

export class CartItemModifierInputDto {
  @ApiProperty({ example: "uuid-of-modifier" })
  @IsUUID()
  modifierId: string;
}

export class AddCartItemDto {
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

  @ApiPropertyOptional({ type: () => [CartItemModifierInputDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartItemModifierInputDto)
  @Validate(UniqueModifierIdsConstraint)
  modifiers?: CartItemModifierInputDto[];
}
