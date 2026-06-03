import { Prisma } from "@prisma/client";
import { SupportTicketEntity } from "../entities/support-ticket.entity";
import { CreateSupportMessageParams } from "../entities/support-message.entity";

export const SUPPORT_TICKET_REPOSITORY = Symbol("SUPPORT_TICKET_REPOSITORY");

// Detalle: ticket + empresa + autor + todo el chat ordenado.
export const SUPPORT_TICKET_FULL_INCLUDE = {
  company: { select: { id: true, legalName: true } },
  createdBy: { select: { id: true, name: true, email: true } },
  messages: {
    orderBy: { createdAt: "asc" },
    include: { author: { select: { id: true, name: true, role: true } } },
  },
} as const satisfies Prisma.SupportTicketInclude;

// Listado: sin el chat (los días/estado salen de escalares del propio ticket).
export const SUPPORT_TICKET_LIST_INCLUDE = {
  company: { select: { id: true, legalName: true } },
  createdBy: { select: { id: true, name: true, email: true } },
} as const satisfies Prisma.SupportTicketInclude;

export interface ISupportTicketRepository {
  findUnique(
    args: Prisma.SupportTicketFindUniqueArgs,
  ): Promise<SupportTicketEntity | null>;
  findMany(
    args?: Prisma.SupportTicketFindManyArgs,
  ): Promise<{ data: SupportTicketEntity[]; total?: number }>;
  exists(args: Prisma.SupportTicketCountArgs): Promise<boolean>;

  /**
   * Un ticket siempre nace con su primer mensaje (el reporte). Crea ambos en
   * una transacción y devuelve el ticket con sus relaciones cargadas.
   */
  createWithFirstMessage(
    ticket: SupportTicketEntity,
    message: Omit<CreateSupportMessageParams, "ticketId">,
  ): Promise<SupportTicketEntity>;

  /** Agrega un mensaje al chat de un ticket existente. */
  addMessage(params: CreateSupportMessageParams): Promise<void>;

  /**
   * Marca `firstRespondedAt` solo si aún es null (primera respuesta de
   * Ofibites). Idempotente: no pisa la fecha si ya estaba seteada.
   */
  markFirstRespondedIfNull(ticketId: string, at: Date): Promise<void>;

  update(args: Prisma.SupportTicketUpdateArgs): Promise<SupportTicketEntity>;
}
