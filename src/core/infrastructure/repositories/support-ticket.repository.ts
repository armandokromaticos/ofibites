import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../database/prisma/prisma.service";
import {
  ISupportTicketRepository,
  SUPPORT_TICKET_FULL_INCLUDE,
} from "../../domain/repositories/support-ticket.repository.interface";
import { SupportTicketEntity } from "../../domain/entities/support-ticket.entity";
import {
  CreateSupportMessageParams,
  SupportMessageEntity,
} from "../../domain/entities/support-message.entity";

@Injectable()
export class SupportTicketRepository implements ISupportTicketRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUnique(
    args: Prisma.SupportTicketFindUniqueArgs,
  ): Promise<SupportTicketEntity | null> {
    const row = await this.prisma.supportTicket.findUnique(args);
    return row ? SupportTicketEntity.fromPrisma(row) : null;
  }

  async findMany(
    args?: Prisma.SupportTicketFindManyArgs,
  ): Promise<{ data: SupportTicketEntity[]; total?: number }> {
    const rows = await this.prisma.supportTicket.findMany(args);
    const data = rows.map((row) => SupportTicketEntity.fromPrisma(row));

    const hasPagination =
      typeof args?.skip === "number" || typeof args?.take === "number";
    if (hasPagination) {
      const total = await this.prisma.supportTicket.count({
        where: args?.where,
      });
      return { data, total };
    }
    return { data };
  }

  async exists(args: Prisma.SupportTicketCountArgs): Promise<boolean> {
    const count = await this.prisma.supportTicket.count(args);
    return count > 0;
  }

  async createWithFirstMessage(
    ticket: SupportTicketEntity,
    message: Omit<CreateSupportMessageParams, "ticketId">,
  ): Promise<SupportTicketEntity> {
    const row = await this.prisma.$transaction(async (tx) => {
      const created = await tx.supportTicket.create({
        data: ticket.toPrismaCreate(),
      });
      const firstMessage = SupportMessageEntity.fromCreateParams({
        ...message,
        ticketId: created.id,
      });
      await tx.supportMessage.create({ data: firstMessage.toPrismaCreate() });
      return tx.supportTicket.findUniqueOrThrow({
        where: { id: created.id },
        include: SUPPORT_TICKET_FULL_INCLUDE,
      });
    });
    return SupportTicketEntity.fromPrisma(row);
  }

  async addMessage(params: CreateSupportMessageParams): Promise<void> {
    const message = SupportMessageEntity.fromCreateParams(params);
    await this.prisma.supportMessage.create({ data: message.toPrismaCreate() });
  }

  async markFirstRespondedIfNull(ticketId: string, at: Date): Promise<void> {
    await this.prisma.supportTicket.updateMany({
      where: { id: ticketId, firstRespondedAt: null },
      data: { firstRespondedAt: at },
    });
  }

  async update(
    args: Prisma.SupportTicketUpdateArgs,
  ): Promise<SupportTicketEntity> {
    const row = await this.prisma.supportTicket.update(args);
    return SupportTicketEntity.fromPrisma(row);
  }
}
