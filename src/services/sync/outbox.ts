import { db, type Outbox } from '@/db/schema';
import { mapRepo } from '@/db/repositories/mappingRepo';
import { ticketsRepo } from '@/db/repositories/ticketRepo';
import { ticketWriteRest } from '@/services/api/adapters/rest';
import type { TicketLinePayload } from '@/services/api/ports';
import { makeCommandKey } from '@/lib/idempotency';

const FLUSH_INTERVAL_MS = 3000;

type NewOutboxCommand = Omit<Outbox, 'key' | 'tries' | 'ts' | 'lastError'> & {
  entityId?: string;
  version?: number;
  businessDateOverride?: string;
};

export async function enqueue(command: NewOutboxCommand) {
  const {
    entityId,
    version,
    businessDateOverride,
    ...rest
  } = command;

  const key = makeCommandKey({
    command: rest.kind,
    entityId: entityId ?? rest.localTicketId,
    part: rest.partId,
    version,
    businessDateOverride,
  });

  await db.outbox.put({
    ...rest,
    key,
    tries: 0,
    ts: new Date().toISOString(),
  });
}

let ticking = false;

export function startFlusher() {
  if (ticking) {
    return;
  }

  ticking = true;

  const loop = async () => {
    try {
      const items = await db.outbox.orderBy('ts').toArray();
      for (const item of items) {
        try {
          if (item.kind === 'CreateTicket') {
            const result = await ticketWriteRest.createTicket(item.key);
            await mapRepo.set(item.localTicketId, result.id);
            await db.outbox.delete(item.id);
            continue;
          }

          if (item.kind === 'AddLine') {
            const mapping = await mapRepo.get(item.localTicketId);
            if (!mapping?.serverTicketId) {
              continue;
            }

            await ticketWriteRest.addLine(
              mapping.serverTicketId,
              item.payload as TicketLinePayload,
              item.key,
            );
            await db.outbox.delete(item.id);
            continue;
          }

          if (item.kind === 'PayCash') {
            const mapping = await mapRepo.get(item.localTicketId);
            if (!mapping?.serverTicketId) {
              continue;
            }

            await ticketWriteRest.payCash(mapping.serverTicketId, item.key);
            await ticketsRepo.markPaidLocal(item.localTicketId);
            await db.outbox.delete(item.id);
            continue;
          }

          if (item.kind === 'PayMock') {
            const mapping = await mapRepo.get(item.localTicketId);
            if (!mapping?.serverTicketId) {
              continue;
            }

            await ticketWriteRest.payMock(
              mapping.serverTicketId,
              item.payload,
              item.key,
            );
            await ticketsRepo.markPaidLocal(item.localTicketId);
            await db.outbox.delete(item.id);
          }
        } catch (error) {
          await db.outbox.update(item.id, {
            tries: (item.tries ?? 0) + 1,
            lastError: String(error),
          });
        }
      }
    } finally {
      setTimeout(loop, FLUSH_INTERVAL_MS);
    }
  };

  void loop();
}
