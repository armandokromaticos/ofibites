import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, IsUrl, MaxLength } from "class-validator";

export class ResendCompanyRegistrationRequestInviteDto {
  @ApiPropertyOptional({
    example: "https://ofibites.com/auth/set-password",
    description:
      "URL a la que Supabase redirige tras aceptar la invitación. Si se omite, usa SUPABASE_INVITE_REDIRECT_URL o el Site URL del dashboard.",
  })
  @IsOptional()
  @IsString()
  @IsUrl({ require_tld: false })
  @MaxLength(500)
  redirectTo?: string;
}
