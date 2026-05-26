import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class RejectCompanyRegistrationRequestDto {
  @ApiProperty({
    example:
      "El RIF no corresponde a una empresa activa en el registro mercantil.",
    description:
      "Motivo de rechazo visible para el solicitante (se enviará en el email de notificación).",
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  rejectionReason: string;
}
