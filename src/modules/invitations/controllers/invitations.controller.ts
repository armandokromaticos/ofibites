import {
  Controller,
  Get,
  ParseUUIDPipe,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";
import { Role } from "../../../core/domain/enums/role.enum";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { Roles } from "../../auth/decorators/roles.decorator";
import { PendingInvitationResponseDto } from "../../../core/application/dto/invitations/pending-invitation-response.dto";
import { GetPendingInvitationsUseCase } from "../../../core/application/use-cases/invitations/get-pending-invitations.use-case";

@ApiTags("Invitations")
@Controller("invitations")
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class InvitationsController {
  constructor(
    private readonly getPendingInvitationsUseCase: GetPendingInvitationsUseCase,
  ) {}

  @Get("pending")
  @Roles(Role.SUPER_ADMIN, Role.OPS_ADMIN)
  @ApiOperation({
    summary:
      "Invitaciones pendientes (usuarios invitados que aún no aceptaron en Supabase)",
  })
  @ApiQuery({
    name: "companyId",
    required: false,
    description: "Acota a las invitaciones de una empresa concreta.",
  })
  async getPendingInvitations(
    @Query("companyId", new ParseUUIDPipe({ version: "4", optional: true }))
    companyId?: string,
  ): Promise<PendingInvitationResponseDto[]> {
    return this.getPendingInvitationsUseCase.execute(companyId);
  }
}
