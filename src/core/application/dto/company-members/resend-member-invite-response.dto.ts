import { ApiProperty } from "@nestjs/swagger";

export class ResendMemberInviteResponseDto {
  @ApiProperty()
  email: string;

  @ApiProperty()
  name: string;

  @ApiProperty({
    example:
      "Se reenvió la invitación vía Supabase. El usuario recibirá un email para establecer su contraseña.",
  })
  message: string;
}
