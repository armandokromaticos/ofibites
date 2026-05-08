import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { CompanyRole } from "../../../domain/enums/company-role.enum";
import { UserResponseDto } from "../users/user-response.dto";

export class MembershipDto {
  @ApiProperty()
  companyId: string;

  @ApiProperty()
  companyName: string;

  @ApiProperty()
  companyIsActive: boolean;

  @ApiProperty({ enum: CompanyRole })
  role: CompanyRole;

  @ApiPropertyOptional({ nullable: true, type: String })
  position: string | null;

  @ApiPropertyOptional({ nullable: true, type: String })
  branchId: string | null;

  @ApiPropertyOptional({ nullable: true, type: String })
  branchName: string | null;

  @ApiPropertyOptional({ nullable: true, type: String })
  departmentId: string | null;

  @ApiPropertyOptional({ nullable: true, type: String })
  departmentName: string | null;

  @ApiProperty()
  canPayInvoices: boolean;

  @ApiProperty()
  isActive: boolean;
}

export class MeResponseDto {
  @ApiProperty({ type: UserResponseDto })
  user: UserResponseDto;

  @ApiProperty({ type: [MembershipDto] })
  memberships: MembershipDto[];
}
