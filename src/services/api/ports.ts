export type IdempotencyKey = string;

export type TicketLinePayload = {
  menuItemId: string;
  qty: number;
};

export type TicketCreateResponse = {
  id: string;
};

export interface TicketWritePort {
  createTicket(idempotencyKey: IdempotencyKey): Promise<TicketCreateResponse>;
  addLine(
    ticketId: string,
    payload: TicketLinePayload,
    idempotencyKey: IdempotencyKey,
  ): Promise<void>;
  payCash(ticketId: string, idempotencyKey: IdempotencyKey): Promise<void>;
  payMock(
    ticketId: string,
    payload: unknown,
    idempotencyKey: IdempotencyKey,
  ): Promise<void>;
}
