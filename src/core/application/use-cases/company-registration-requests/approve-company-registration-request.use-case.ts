import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import type { ICompanyRegistrationRequestRepository } from "../../../domain/repositories/company-registration-request.repository.interface";
import { COMPANY_REGISTRATION_REQUEST_REPOSITORY } from "../../../domain/repositories/company-registration-request.repository.interface";
import type { ICompanyRepository } from "../../../domain/repositories/company.repository.interface";
import { COMPANY_REPOSITORY } from "../../../domain/repositories/company.repository.interface";
import type { IUserRepository } from "../../../domain/repositories/user.repository.interface";
import { USER_REPOSITORY } from "../../../domain/repositories/user.repository.interface";
import type { ICompanyMemberRepository } from "../../../domain/repositories/company-member.repository.interface";
import { COMPANY_MEMBER_REPOSITORY } from "../../../domain/repositories/company-member.repository.interface";
import { SupabaseService } from "../../../infrastructure/supabase/supabase.service";
import { ApproveCompanyRegistrationRequestDto } from "../../dto/company-registration-requests/approve-company-registration-request.dto";
import { CompanyRegistrationRequestEntity } from "../../../domain/entities/company-registration-request.entity";
import { CompanyEntity } from "../../../domain/entities/company.entity";
import { UserEntity } from "../../../domain/entities/user.entity";
import { CompanyMemberEntity } from "../../../domain/entities/company-member.entity";
import { RegistrationRequestStatus } from "../../../domain/enums/registration-request-status.enum";
import { CompanyRole } from "../../../domain/enums/company-role.enum";

export interface ApproveCompanyRegistrationRequestResult {
  request: CompanyRegistrationRequestEntity;
  company: CompanyEntity;
  invitedAdmin: { email: string; name: string };
}

const EMAIL_EXISTS_HINT =
  "El email del contacto ya pertenece a un usuario de la plataforma. Edita la solicitud antes de aprobarla o invita manualmente al admin existente.";

const TAXID_EXISTS_HINT =
  "Ya existe una empresa registrada con este RIF. Edita la solicitud o rechaza el registro.";

@Injectable()
export class ApproveCompanyRegistrationRequestUseCase {
  private readonly logger = new Logger(
    ApproveCompanyRegistrationRequestUseCase.name,
  );

  constructor(
    @Inject(COMPANY_REGISTRATION_REQUEST_REPOSITORY)
    private readonly requestRepository: ICompanyRegistrationRequestRepository,
    @Inject(COMPANY_REPOSITORY)
    private readonly companyRepository: ICompanyRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(COMPANY_MEMBER_REPOSITORY)
    private readonly memberRepository: ICompanyMemberRepository,
    private readonly supabaseService: SupabaseService,
  ) {}

  async execute(
    id: string,
    reviewerUserId: string,
    dto: ApproveCompanyRegistrationRequestDto,
  ): Promise<ApproveCompanyRegistrationRequestResult> {
    const request = await this.requestRepository.findUnique({ where: { id } });
    if (!request) {
      throw new NotFoundException(`Solicitud ${id} no encontrada.`);
    }
    if (request.status !== RegistrationRequestStatus.PENDING) {
      throw new BadRequestException(
        `Solo se pueden aprobar solicitudes en estado PENDING (actual: ${request.status}).`,
      );
    }

    const email = request.contactEmail.trim().toLowerCase();

    const existingCompany = await this.companyRepository.findUnique({
      where: { taxId: request.taxId },
    });
    if (existingCompany) {
      throw new ConflictException(TAXID_EXISTS_HINT);
    }

    const existingUser = await this.userRepository.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException(EMAIL_EXISTS_HINT);
    }

    const company = await this.createCompanyOrThrow(request);

    const authId = await this.inviteOrRollback(email, request.contactName, dto, [
      () => this.tryDeleteCompany(company.id),
    ]);

    const createdUser = await this.createUserOrRollback(
      authId,
      email,
      request.contactName,
      request.contactPhone,
      [
        () => this.tryDeleteAuthUser(authId),
        () => this.tryDeleteCompany(company.id),
      ],
    );

    await this.createMemberOrRollback(createdUser.id, company.id, request.position, [
      () => this.tryDeleteUser(createdUser.id),
      () => this.tryDeleteAuthUser(authId),
      () => this.tryDeleteCompany(company.id),
    ]);

    const updated = await this.requestRepository.updateIfPending(id, {
      status: RegistrationRequestStatus.APPROVED,
      approvedCompanyId: company.id,
      reviewedAt: new Date(),
      reviewedById: reviewerUserId,
    });

    if (!updated) {
      this.logger.error(
        `Race: solicitud ${id} dejó de estar PENDING tras crear company/user/member. Revirtiendo.`,
      );
      await this.runRollbacks([
        () => this.tryDeleteMemberByUserAndCompany(createdUser.id, company.id),
        () => this.tryDeleteUser(createdUser.id),
        () => this.tryDeleteAuthUser(authId),
        () => this.tryDeleteCompany(company.id),
      ]);
      throw new ConflictException(
        `La solicitud ${id} cambió de estado antes de completar la aprobación.`,
      );
    }

    this.logger.log(
      `Solicitud ${id} aprobada por ${reviewerUserId}. Company ${company.id}, COMPANY_ADMIN ${createdUser.id} invitado a ${email}.`,
    );

    return {
      request: updated,
      company,
      invitedAdmin: { email, name: request.contactName },
    };
  }

  private async createCompanyOrThrow(
    request: CompanyRegistrationRequestEntity,
  ): Promise<CompanyEntity> {
    const entity = CompanyEntity.fromCreateParams({
      legalName: request.legalName,
      taxId: request.taxId,
      email: request.contactEmail,
      phone: request.contactPhone,
    });
    try {
      return await this.companyRepository.create(entity);
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2002"
      ) {
        throw new ConflictException(TAXID_EXISTS_HINT);
      }
      throw err;
    }
  }

  private async inviteOrRollback(
    email: string,
    name: string,
    dto: ApproveCompanyRegistrationRequestDto,
    rollbacks: Array<() => Promise<void>>,
  ): Promise<string> {
    this.logger.log(`Invitando primer COMPANY_ADMIN ${email}.`);
    const supabase = this.supabaseService.getAdmin();
    const redirectTo =
      dto.redirectTo?.trim() ||
      process.env.SUPABASE_INVITE_REDIRECT_URL?.trim();

    const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
      data: { name },
      ...(redirectTo ? { redirectTo } : {}),
    });

    if (error) {
      this.logger.warn(
        `Supabase inviteUserByEmail falló para ${email}: ${error.message} (code=${error.code ?? "?"})`,
      );
      await this.runRollbacks(rollbacks);
      if (
        error.code === "email_exists" ||
        error.code === "user_already_exists"
      ) {
        throw new ConflictException(EMAIL_EXISTS_HINT);
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

    const authId = data.user?.id;
    if (!authId) {
      await this.runRollbacks(rollbacks);
      throw new InternalServerErrorException(
        "Supabase devolvió una invitación sin authId.",
      );
    }
    return authId;
  }

  private async createUserOrRollback(
    authId: string,
    email: string,
    name: string,
    phone: string,
    rollbacks: Array<() => Promise<void>>,
  ): Promise<UserEntity> {
    try {
      const entity = UserEntity.fromCreateParams({
        authId,
        email,
        name: name.trim(),
        phone,
      });
      return await this.userRepository.create(entity);
    } catch (err) {
      await this.runRollbacks(rollbacks);
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2002"
      ) {
        throw new ConflictException(EMAIL_EXISTS_HINT);
      }
      throw new InternalServerErrorException(
        "Error al crear el usuario en la base de datos. Se revirtió la aprobación.",
      );
    }
  }

  private async createMemberOrRollback(
    userId: string,
    companyId: string,
    position: string | null,
    rollbacks: Array<() => Promise<void>>,
  ): Promise<CompanyMemberEntity> {
    try {
      const entity = CompanyMemberEntity.fromCreateParams({
        userId,
        companyId,
        role: CompanyRole.COMPANY_ADMIN,
        position,
        canPayInvoices: true,
        isActive: true,
      });
      return await this.memberRepository.create(entity);
    } catch (err) {
      await this.runRollbacks(rollbacks);
      throw err;
    }
  }

  private async runRollbacks(
    rollbacks: Array<() => Promise<void>>,
  ): Promise<void> {
    for (const fn of rollbacks) {
      try {
        await fn();
      } catch (err) {
        this.logger.error(
          `Rollback falló: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }
  }

  private async tryDeleteCompany(companyId: string): Promise<void> {
    await this.companyRepository.delete(companyId);
  }

  private async tryDeleteAuthUser(authId: string): Promise<void> {
    await this.supabaseService.getAdmin().auth.admin.deleteUser(authId);
  }

  private async tryDeleteUser(userId: string): Promise<void> {
    await this.userRepository.delete(userId);
  }

  private async tryDeleteMemberByUserAndCompany(
    userId: string,
    companyId: string,
  ): Promise<void> {
    const member =
      await this.memberRepository.findActiveByUserAndCompany(
        userId,
        companyId,
      );
    if (member) {
      await this.memberRepository.delete(member.id);
    }
  }
}
