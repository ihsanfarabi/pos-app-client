import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { db } from '@/db/schema';
import { ticketsRepo } from '@/db/repositories/ticketRepo';
import { formatCurrency } from '@/lib/currency';
import { makeKey } from '@/lib/idempotency';
import { enqueue } from '@/services/sync/outbox';
import { useCartStore } from '@/stores/cart';
import { useSession } from '@/stores/session';

type CartSnapshot = {
  lines: {
    menuItemId: string;
    qty: number;
    price: number;
  }[];
  totalCents: number;
};

export default function Checkout() {
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string>();
  const [lastTicketId, setLastTicketId] = useState<string>();
  const cartLineMap = useCartStore((state) => state.lines);
  const clearCart = useCartStore((state) => state.clear);

  const cartLines = useMemo(
    () => Object.values(cartLineMap),
    [cartLineMap],
  );
  const cartSummary = useMemo(() => {
    const items = cartLines.map((line) => ({
      ...line,
      lineTotal: line.qty * line.price,
    }));

    const totalQty = items.reduce((sum, line) => sum + line.qty, 0);

    return {
      items,
      totalQty,
      totalAmount: items.reduce(
        (sum, line) => sum + line.lineTotal,
        0,
      ),
    };
  }, [cartLines]);

  async function payCash(snapshot: CartSnapshot) {
    const sessionState = useSession.getState();
    if (
      !sessionState.tenantId ||
      !sessionState.storeId ||
      !sessionState.deviceId ||
      !sessionState.businessDate
    ) {
      setError('Device info missing – configure it in Settings first.');
      return false;
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
          totalCents: snapshot.totalCents,
          createdAt,
          businessDate: sessionState.businessDate,
        },
        snapshot.lines.map((line) => ({
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
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to enqueue payment');
      return false;
    } finally {
      setProcessing(false);
    }
  }

  const cartIsEmpty = cartLines.length === 0;

  async function handleConfirmCash() {
    if (cartIsEmpty) {
      setError('Add at least one item before checkout.');
      return;
    }

    const snapshot: CartSnapshot = {
      lines: cartLines.map((line) => ({
        menuItemId: line.menuItemId,
        qty: line.qty,
        price: line.price,
      })),
      totalCents: cartSummary.totalAmount,
    };

    const success = await payCash(snapshot);
    if (success) {
      clearCart();
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Checkout</h1>
        <p className="text-muted-foreground">
          Review the order before confirming payment.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Order items</CardTitle>
            <CardDescription>
              Double-check the order before taking the payment.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {cartSummary.items.length === 0 ? (
              <div className="flex min-h-[12rem] flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                No items in the order. Return to Sell to add menu items.
              </div>
            ) : (
              <ul className="space-y-3">
                {cartSummary.items.map((item) => (
                  <li
                    key={item.menuItemId}
                    className="flex items-center justify-between gap-3 rounded-md border bg-card px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {item.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(item.price)} × {item.qty}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      {formatCurrency(item.lineTotal)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
          <CardFooter className="justify-start">
            <Button variant="outline" onClick={() => navigate('/sell')}>
              Back to sell
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
            <CardDescription>
              Device context is required before confirming payment.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <dl className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center justify-between">
                <dt>Items</dt>
                <dd>{cartSummary.items.length}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt>Quantity</dt>
                <dd>{cartSummary.totalQty}</dd>
              </div>
            </dl>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-base font-medium text-muted-foreground">
                Total
              </span>
              <span className="text-xl font-semibold text-foreground">
                {formatCurrency(cartSummary.totalAmount)}
              </span>
            </div>
            {error ? (
              <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            ) : null}
            {lastTicketId ? (
              <p className="rounded-md border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-700">
                Ticket {lastTicketId.slice(0, 8)}… queued for sync.
              </p>
            ) : null}
          </CardContent>
          <CardFooter className="flex-col gap-3">
            <Button
              className="w-full"
              disabled={processing || cartIsEmpty}
              onClick={handleConfirmCash}
            >
              {processing ? 'Queuing…' : 'Confirm cash'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              onClick={() => navigate('/sell')}
            >
              Back to sell
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
