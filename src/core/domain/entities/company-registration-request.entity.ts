import {
  CompanyRegistrationRequest as PrismaCompanyRegistrationRequest,
  Prisma,
} from "@prisma/client";
import { RegistrationRequestStatus } from "../enums/registration-request-status.enum";

export interface CreateCompanyRegistrationRequestParams {
  legalName: string;
  taxId: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  position?: string | null;
  employeeCount?: number | null;
}

export class CompanyRegistrationRequestEntity {
  id: string;
  legalName: string;
  taxId: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  position: string | null;
  employeeCount: number | null;
  status: RegistrationRequestStatus;
  rejectionReason: string | null;
  reviewedAt: Date | null;
  reviewedById: string | null;
  approvedCompanyId: string | null;
  createdAt: Date;
  updatedAt: Date;

  static fromPrisma(
    prisma: PrismaCompanyRegistrationRequest,
  ): CompanyRegistrationRequestEntity {
    const entity = new CompanyRegistrationRequestEntity();
    entity.id = prisma.id;
    entity.legalName = prisma.legalName;
    entity.taxId = prisma.taxId;
    entity.contactName = prisma.contactName;
    entity.contactEmail = prisma.contactEmail;
    entity.contactPhone = prisma.contactPhone;
    entity.position = prisma.position;
    entity.employeeCount = prisma.employeeCount;
    if (
      !Object.values(RegistrationRequestStatus).includes(
        prisma.status as RegistrationRequestStatus,
      )
    ) {
      throw new Error(
        `Invalid RegistrationRequestStatus value: ${prisma.status}`,
      );
    }
    entity.status = prisma.status as RegistrationRequestStatus;
    entity.rejectionReason = prisma.rejectionReason;
    entity.reviewedAt = prisma.reviewedAt;
    entity.reviewedById = prisma.reviewedById;
    entity.approvedCompanyId = prisma.approvedCompanyId;
    entity.createdAt = prisma.createdAt;
    entity.updatedAt = prisma.updatedAt;
    return entity;
  }

  static fromCreateParams(
    params: CreateCompanyRegistrationRequestParams,
  ): CompanyRegistrationRequestEntity {
    const entity = new CompanyRegistrationRequestEntity();
    entity.id = "";
    entity.legalName = params.legalName.trim();
    entity.taxId = params.taxId.trim();
    entity.contactName = params.contactName.trim();
    entity.contactEmail = params.contactEmail.trim().toLowerCase();
    entity.contactPhone = params.contactPhone.trim();
    entity.position = params.position?.trim() || null;
    entity.employeeCount = params.employeeCount ?? null;
    entity.status = RegistrationRequestStatus.PENDING;
    entity.rejectionReason = null;
    entity.reviewedAt = null;
    entity.reviewedById = null;
    entity.approvedCompanyId = null;
    entity.createdAt = new Date();
    entity.updatedAt = new Date();
    return entity;
  }

  toPrismaCreate(): Prisma.CompanyRegistrationRequestCreateInput {
    return {
      legalName: this.legalName,
      taxId: this.taxId,
      contactName: this.contactName,
      contactEmail: this.contactEmail,
      contactPhone: this.contactPhone,
      position: this.position,
      employeeCount: this.employeeCount,
      status: this.status,
    };
  }
}
