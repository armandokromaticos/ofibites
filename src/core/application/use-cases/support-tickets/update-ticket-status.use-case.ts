import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { ISupportTicketRepository } from "../../../domain/repositories/support-ticket.repository.interface";
import {
  SUPPORT_TICKET_FULL_INCLUDE,
  SUPPORT_TICKET_REPOSITORY,
} from "../../../domain/repositories/support-ticket.repository.interface";
import { SupportTicketEntity } from "../../../domain/entities/support-ticket.entity";
import { TicketStatus } from "../../../domain/enums/ticket-status.enum";

@Injectable()
export class UpdateTicketStatusUseCase {
  constructor(
    @Inject(SUPPORT_TICKET_REPOSITORY)
    private readonly ticketRepository: ISupportTicketRepository,
  ) {}

  async execute(
    id: string,
    status: TicketStatus,
  ): Promise<SupportTicketEntity> {
    const exists = await this.ticketRepository.exists({ where: { id } });
    if (!exists) {
      throw new NotFoundException(`Reporte ${id} no encontrado`);
    }

    return this.ticketRepository.update({
      where: { id },
      data: {
        status,
        closedAt: status === TicketStatus.CLOSED ? new Date() : null,
      },
      include: SUPPORT_TICKET_FULL_INCLUDE,
    });
  }
}
