import { ApiProperty } from "@nestjs/swagger";
import { IsString, MaxLength, MinLength } from "class-validator";

export class AddSupportMessageDto {
  @ApiProperty({
    description: "Cuerpo del mensaje del chat",
    maxLength: 2000,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  body: string;
}
