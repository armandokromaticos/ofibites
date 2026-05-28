import { ApiProperty } from "@nestjs/swagger";
import { CompanyResponseDto } from "./company-response.dto";
import { CompanyMemberResponseDto } from "../company-members/company-member-response.dto";

export class CreateManualCompanyResponseDto {
  @ApiProperty({ type: () => CompanyResponseDto })
  company: CompanyResponseDto;

  @ApiProperty({ type: () => CompanyMemberResponseDto })
  member: CompanyMemberResponseDto;

  @ApiProperty({
    example:
      "Empresa creada e invitación enviada al primer administrador vía Supabase.",
  })
  inviteMessage: string;
}
