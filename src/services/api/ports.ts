export type IdempotencyKey = string;

export type TicketLinePayload = {
  menuItemId: string;
  qty: number;
};

export type MenuItemResponse = {
  id: string;
  name: string;
  price: number;
};

export type PaginatedResult<T> = {
  pageIndex: number;
  pageSize: number;
  count: number;
  data: T[];
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

export interface MenuReadPort {
  listMenuItems(
    query?: {
      term?: string;
      pageIndex?: number;
      pageSize?: number;
    },
  ): Promise<PaginatedResult<MenuItemResponse>>;
}
