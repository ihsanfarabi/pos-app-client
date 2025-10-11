import { http } from '@/lib/fetcher';
import type {
  IdempotencyKey,
  TicketCreateResponse,
  TicketLinePayload,
  TicketWritePort,
} from '@/services/api/ports';

function withKey(headers: HeadersInit | undefined, key: IdempotencyKey) {
  return {
    ...(headers ?? {}),
    'Idempotency-Key': key,
  };
}

export const ticketWriteRest: TicketWritePort = {
  async createTicket(idempotencyKey) {
    const response = await http('/api/tickets', {
      method: 'POST',
      headers: withKey(undefined, idempotencyKey),
      body: JSON.stringify({}),
    });

    return (await response.json()) as TicketCreateResponse;
  },

  async addLine(ticketId, payload, idempotencyKey) {
    await http(`/api/tickets/${ticketId}/lines`, {
      method: 'POST',
      headers: withKey(undefined, idempotencyKey),
      body: JSON.stringify(payload satisfies TicketLinePayload),
    });
  },

  async payCash(ticketId, idempotencyKey) {
    await http(`/api/tickets/${ticketId}/pay/cash`, {
      method: 'POST',
      headers: withKey(undefined, idempotencyKey),
      body: JSON.stringify({}),
    });
  },

  async payMock(ticketId, payload, idempotencyKey) {
    await http(`/api/tickets/${ticketId}/pay/mock`, {
      method: 'POST',
      headers: withKey(undefined, idempotencyKey),
      body: JSON.stringify(payload ?? {}),
    });
  },
};
