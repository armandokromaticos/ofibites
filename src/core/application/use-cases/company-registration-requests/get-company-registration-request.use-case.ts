import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { ICompanyRegistrationRequestRepository } from "../../../domain/repositories/company-registration-request.repository.interface";
import { COMPANY_REGISTRATION_REQUEST_REPOSITORY } from "../../../domain/repositories/company-registration-request.repository.interface";
import { CompanyRegistrationRequestEntity } from "../../../domain/entities/company-registration-request.entity";

@Injectable()
export class GetCompanyRegistrationRequestUseCase {
  constructor(
    @Inject(COMPANY_REGISTRATION_REQUEST_REPOSITORY)
    private readonly requestRepository: ICompanyRegistrationRequestRepository,
  ) {}

  async execute(id: string): Promise<CompanyRegistrationRequestEntity> {
    const entity = await this.requestRepository.findUnique({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`Solicitud ${id} no encontrada.`);
    }
    return entity;
  }
}
