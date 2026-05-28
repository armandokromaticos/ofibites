import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { InvitationsController } from "./controllers/invitations.controller";
import { GetPendingInvitationsUseCase } from "../../core/application/use-cases/invitations/get-pending-invitations.use-case";

@Module({
  imports: [AuthModule],
  controllers: [InvitationsController],
  providers: [GetPendingInvitationsUseCase],
})
export class InvitationsModule {}
