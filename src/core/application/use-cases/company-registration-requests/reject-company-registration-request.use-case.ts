import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import type { ICompanyRegistrationRequestRepository } from "../../../domain/repositories/company-registration-request.repository.interface";
import { COMPANY_REGISTRATION_REQUEST_REPOSITORY } from "../../../domain/repositories/company-registration-request.repository.interface";
import { RejectCompanyRegistrationRequestDto } from "../../dto/company-registration-requests/reject-company-registration-request.dto";
import { CompanyRegistrationRequestEntity } from "../../../domain/entities/company-registration-request.entity";
import { RegistrationRequestStatus } from "../../../domain/enums/registration-request-status.enum";

@Injectable()
export class RejectCompanyRegistrationRequestUseCase {
  private readonly logger = new Logger(
    RejectCompanyRegistrationRequestUseCase.name,
  );

  constructor(
    @Inject(COMPANY_REGISTRATION_REQUEST_REPOSITORY)
    private readonly requestRepository: ICompanyRegistrationRequestRepository,
  ) {}

  async execute(
    id: string,
    reviewerUserId: string,
    dto: RejectCompanyRegistrationRequestDto,
  ): Promise<CompanyRegistrationRequestEntity> {
    const current = await this.requestRepository.findUnique({ where: { id } });
    if (!current) {
      throw new NotFoundException(`Solicitud ${id} no encontrada.`);
    }

    if (current.status !== RegistrationRequestStatus.PENDING) {
      throw new BadRequestException(
        `Solo se pueden rechazar solicitudes en estado PENDING (actual: ${current.status}).`,
      );
    }

    const updated = await this.requestRepository.update({
      where: { id },
      data: {
        status: RegistrationRequestStatus.REJECTED,
        rejectionReason: dto.rejectionReason.trim(),
        reviewedAt: new Date(),
        reviewedBy: { connect: { id: reviewerUserId } },
      },
    });

    // TODO(C2.b): enviar email de rechazo al contacto con `rejectionReason` y CTA "Contacto con Ofibites".
    // Postergado hasta decidir proveedor de email transaccional (Supabase no envía emails arbitrarios).
    this.logger.log(
      `Solicitud ${id} rechazada por ${reviewerUserId}. Email de notificación pendiente (TODO).`,
    );

    return updated;
  }
}
