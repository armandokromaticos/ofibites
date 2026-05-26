import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import type { ICompanyRegistrationRequestRepository } from "../../../domain/repositories/company-registration-request.repository.interface";
import { COMPANY_REGISTRATION_REQUEST_REPOSITORY } from "../../../domain/repositories/company-registration-request.repository.interface";
import { SupabaseService } from "../../../infrastructure/supabase/supabase.service";
import { ResendCompanyRegistrationRequestInviteDto } from "../../dto/company-registration-requests/resend-company-registration-request-invite.dto";
import { RegistrationRequestStatus } from "../../../domain/enums/registration-request-status.enum";

export interface ResendInviteResult {
  email: string;
  name: string;
  message: string;
}

@Injectable()
export class ResendCompanyRegistrationRequestInviteUseCase {
  private readonly logger = new Logger(
    ResendCompanyRegistrationRequestInviteUseCase.name,
  );

  constructor(
    @Inject(COMPANY_REGISTRATION_REQUEST_REPOSITORY)
    private readonly requestRepository: ICompanyRegistrationRequestRepository,
    private readonly supabaseService: SupabaseService,
  ) {}

  async execute(
    id: string,
    dto: ResendCompanyRegistrationRequestInviteDto,
  ): Promise<ResendInviteResult> {
    const request = await this.requestRepository.findUnique({ where: { id } });
    if (!request) {
      throw new NotFoundException(`Solicitud ${id} no encontrada.`);
    }
    if (request.status !== RegistrationRequestStatus.APPROVED) {
      throw new BadRequestException(
        `Solo se puede reenviar la invitación de solicitudes APPROVED (actual: ${request.status}).`,
      );
    }

    const email = request.contactEmail.trim().toLowerCase();
    const supabase = this.supabaseService.getAdmin();
    const redirectTo =
      dto.redirectTo?.trim() ||
      process.env.SUPABASE_INVITE_REDIRECT_URL?.trim();

    this.logger.log(`Reenviando invitación a ${email} (request ${id}).`);

    const { error } = await supabase.auth.admin.inviteUserByEmail(email, {
      data: { name: request.contactName },
      ...(redirectTo ? { redirectTo } : {}),
    });

    if (error) {
      this.logger.warn(
        `Reenvío de invitación falló para ${email}: ${error.message} (code=${error.code ?? "?"})`,
      );
      if (
        error.code === "email_exists" ||
        error.code === "user_already_exists"
      ) {
        throw new ConflictException(
          "El usuario ya aceptó una invitación previa o tiene una cuenta activa. Para resetear su acceso, usa el flujo de recuperación de contraseña.",
        );
      }
      if (
        error.code === "over_email_send_rate_limit" ||
        error.code === "over_request_rate_limit"
      ) {
        throw new HttpException(
          "Supabase rechazó el envío por límite de tasa. Reintenta más tarde.",
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
      throw new BadRequestException(error.message);
    }

    return {
      email,
      name: request.contactName,
      message:
        "Invitación reenviada vía Supabase. El usuario recibirá un nuevo email para establecer contraseña.",
    };
  }
}
