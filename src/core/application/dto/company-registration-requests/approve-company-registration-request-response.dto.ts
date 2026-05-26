import { ApiProperty } from "@nestjs/swagger";
import { CompanyRegistrationRequestResponseDto } from "./company-registration-request-response.dto";
import { CompanyResponseDto } from "../companies/company-response.dto";

export class InvitedAdminInfoDto {
  @ApiProperty({ example: "admin@empresa.com" })
  email: string;

  @ApiProperty({ example: "María García" })
  name: string;

  @ApiProperty({
    example: "Invitación enviada vía Supabase. El usuario recibirá un email para establecer contraseña.",
  })
  inviteMessage: string;
}

export class ApproveCompanyRegistrationRequestResponseDto {
  @ApiProperty({ type: CompanyRegistrationRequestResponseDto })
  request: CompanyRegistrationRequestResponseDto;

  @ApiProperty({ type: CompanyResponseDto })
  company: CompanyResponseDto;

  @ApiProperty({ type: InvitedAdminInfoDto })
  invitedAdmin: InvitedAdminInfoDto;
}
