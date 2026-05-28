import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean } from "class-validator";

export class SetCompanyActiveDto {
  @ApiProperty({
    example: false,
    description: "true = reactivar empresa, false = desactivar.",
  })
  @IsBoolean()
  isActive: boolean;
}
