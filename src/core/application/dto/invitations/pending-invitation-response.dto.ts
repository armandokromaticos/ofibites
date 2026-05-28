import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Role } from "../../../domain/enums/role.enum";
import { CompanyRole } from "../../../domain/enums/company-role.enum";

export class PendingInvitationMembershipDto {
  @ApiProperty()
  companyId: string;

  @ApiProperty()
  companyName: string;

  @ApiProperty({ enum: CompanyRole })
  companyRole: CompanyRole;

  @ApiPropertyOptional({ nullable: true, type: String })
  branchName: string | null;

  @ApiPropertyOptional({ nullable: true, type: String })
  departmentName: string | null;
}

export class PendingInvitationResponseDto {
  @ApiProperty({ description: "ID del usuario en Supabase Auth" })
  authId: string;

  @ApiPropertyOptional({
    nullable: true,
    type: String,
    description: "ID local del usuario (null si no hay fila local)",
  })
  userId: string | null;

  @ApiProperty()
  email: string;

  @ApiPropertyOptional({ nullable: true, type: String })
  name: string | null;

  @ApiPropertyOptional({
    enum: Role,
    nullable: true,
    description: "Rol global del usuario invitado",
  })
  role: Role | null;

  @ApiPropertyOptional({
    nullable: true,
    type: Date,
    description: "Fecha de la invitación (invited_at de Supabase)",
  })
  invitedAt: Date | null;

  @ApiProperty({
    type: () => [PendingInvitationMembershipDto],
    description:
      "Empresas a las que fue invitado (vacío si es usuario Ofibites)",
  })
  memberships: PendingInvitationMembershipDto[];
}
