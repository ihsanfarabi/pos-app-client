import { useState } from 'react';

import { db } from '@/db/schema';
import { ticketsRepo } from '@/db/repositories/ticketRepo';
import { makeKey } from '@/lib/idempotency';
import { enqueue } from '@/services/sync/outbox';
import { useSession } from '@/stores/session';

type CartLine = {
  menuItemId: string;
  qty: number;
  price: number;
};

type Cart = {
  lines: CartLine[];
  totalCents: number;
};

export default function Checkout() {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string>();
  const [lastTicketId, setLastTicketId] = useState<string>();

  async function payCash(cart: Cart) {
    const sessionState = useSession.getState();
    if (
      !sessionState.tenantId ||
      !sessionState.storeId ||
      !sessionState.deviceId ||
      !sessionState.businessDate
    ) {
      setError('Device info missing – configure it in Settings first.');
      return;
    }

    setProcessing(true);
    setError(undefined);
    setLastTicketId(undefined);

    try {
      const localTicketId = crypto.randomUUID();
      const createdAt = new Date().toISOString();

      await ticketsRepo.createLocal(
        {
          localId: localTicketId,
          status: 'open',
          totalCents: cart.totalCents,
          createdAt,
          businessDate: sessionState.businessDate,
        },
        cart.lines.map((line) => ({
          id: crypto.randomUUID(),
          localTicketId,
          menuItemId: line.menuItemId,
          qty: line.qty,
        })),
      );

      const deviceContext = {
        tenantId: sessionState.tenantId,
        storeId: sessionState.storeId,
        deviceId: sessionState.deviceId,
        businessDate: sessionState.businessDate,
      };

      await enqueue({
        id: crypto.randomUUID(),
        kind: 'CreateTicket',
        key: makeKey({
          ...deviceContext,
          command: 'CreateTicket',
          entityId: localTicketId,
        }),
        payload: {},
        localTicketId,
      });

      const lines = await db.local_lines
        .where('localTicketId')
        .equals(localTicketId)
        .toArray();

      for (const line of lines) {
        await enqueue({
          id: crypto.randomUUID(),
          kind: 'AddLine',
          key: makeKey({
            ...deviceContext,
            command: 'AddLine',
            entityId: localTicketId,
            part: line.id,
          }),
          payload: {
            menuItemId: line.menuItemId,
            qty: line.qty,
          },
          localTicketId,
          partId: line.id,
        });
      }

      await enqueue({
        id: crypto.randomUUID(),
        kind: 'PayCash',
        key: makeKey({
          ...deviceContext,
          command: 'PayCash',
          entityId: localTicketId,
          part: crypto.randomUUID(),
        }),
        payload: {},
        localTicketId,
      });

      setLastTicketId(localTicketId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to enqueue payment');
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Checkout</h1>
      <p className="text-slate-500">
        Demo button queues a cash ticket for the outbox flusher.
      </p>
      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
      {lastTicketId ? (
        <p className="text-sm text-green-600">
          Ticket {lastTicketId.slice(0, 8)}… queued for sync.
        </p>
      ) : null}
      <button
        className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
        disabled={processing}
        onClick={() =>
          payCash({
            lines: [],
            totalCents: 0,
          })
        }
      >
        {processing ? 'Queuing…' : 'Confirm Cash'}
      </button>
    </div>
  );
}
