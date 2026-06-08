import { Prisma, SupportTicket as PrismaSupportTicket } from "@prisma/client";
import { TicketStatus } from "../enums/ticket-status.enum";
import { SupportMessageEntity } from "./support-message.entity";

export interface SupportTicketCompanyInfo {
  id: string;
  legalName: string;
}

export interface SupportTicketRequesterInfo {
  id: string;
  name: string;
  email: string;
}

export interface CreateSupportTicketParams {
  companyId: string;
  createdById: string;
  subject?: string | null;
}

type PrismaSupportTicketWithRelations = PrismaSupportTicket & {
  company?: { id: string; legalName: string } | null;
  createdBy?: { id: string; name: string; email: string } | null;
  messages?: Parameters<typeof SupportMessageEntity.fromPrisma>[0][];
};

export class SupportTicketEntity {
  id: string;
  ticketNumber: number;
  companyId: string;
  createdById: string;
  subject: string | null;
  status: TicketStatus;
  firstRespondedAt: Date | null;
  closedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;

  company?: SupportTicketCompanyInfo;
  createdBy?: SupportTicketRequesterInfo;
  messages?: SupportMessageEntity[];

  static fromPrisma(
    prisma: PrismaSupportTicketWithRelations,
  ): SupportTicketEntity {
    const entity = new SupportTicketEntity();
    entity.id = prisma.id;
    entity.ticketNumber = prisma.ticketNumber;
    entity.companyId = prisma.companyId;
    entity.createdById = prisma.createdById;
    entity.subject = prisma.subject;
    if (!Object.values(TicketStatus).includes(prisma.status as TicketStatus)) {
      throw new Error(`Invalid TicketStatus value: ${prisma.status}`);
    }
    entity.status = prisma.status as TicketStatus;
    entity.firstRespondedAt = prisma.firstRespondedAt;
    entity.closedAt = prisma.closedAt;
    entity.createdAt = prisma.createdAt;
    entity.updatedAt = prisma.updatedAt;

    if (prisma.company) {
      entity.company = {
        id: prisma.company.id,
        legalName: prisma.company.legalName,
      };
    }
    if (prisma.createdBy) {
      entity.createdBy = {
        id: prisma.createdBy.id,
        name: prisma.createdBy.name,
        email: prisma.createdBy.email,
      };
    }
    if (prisma.messages) {
      entity.messages = prisma.messages.map((message) =>
        SupportMessageEntity.fromPrisma(message),
      );
    }
    return entity;
  }

  static fromCreateParams(
    params: CreateSupportTicketParams,
  ): SupportTicketEntity {
    const entity = new SupportTicketEntity();
    entity.id = "";
    entity.ticketNumber = 0;
    entity.companyId = params.companyId;
    entity.createdById = params.createdById;
    entity.subject = params.subject?.trim() || null;
    entity.status = TicketStatus.OPEN;
    entity.firstRespondedAt = null;
    entity.closedAt = null;
    entity.createdAt = new Date();
    entity.updatedAt = new Date();
    return entity;
  }

  toPrismaCreate(): Prisma.SupportTicketUncheckedCreateInput {
    return {
      companyId: this.companyId,
      createdById: this.createdById,
      subject: this.subject,
      status: this.status,
    };
  }
}
