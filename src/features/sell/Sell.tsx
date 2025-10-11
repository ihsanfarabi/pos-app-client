import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { type MenuItem } from '@/db/schema';
import { menuRepo } from '@/db/repositories/menuRepo';
import { formatCurrency } from '@/lib/currency';
import { menuRest } from '@/services/api/adapters/menu.rest';
import { useCartStore } from '@/stores/cart';

const MENU_QUERY_KEY = 'menu-items';

function useMenu(search: string) {
  return useQuery({
    queryKey: [MENU_QUERY_KEY, search],
    queryFn: () => menuRepo.list(search),
    staleTime: 1000 * 60 * 5,
  });
}

function useMenuSync() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const result = await menuRest.listMenuItems({
        pageIndex: 0,
        pageSize: 100,
      });

      const items = result.data.map(
        (item): MenuItem => ({
          id: item.id,
          name: item.name,
          price: Number(item.price),
        }),
      );

      await menuRepo.replaceAll(items);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [MENU_QUERY_KEY] });
    },
  });
}

export default function Sell() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const menuQuery = useMenu(search);
  const syncMenu = useMenuSync();
  const addItem = useCartStore((state) => state.addItem);
  const increment = useCartStore((state) => state.increment);
  const decrement = useCartStore((state) => state.decrement);
  const remove = useCartStore((state) => state.remove);
  const clear = useCartStore((state) => state.clear);
  const cartLineMap = useCartStore((state) => state.lines);
  const initialisedRef = useRef(false);

  useEffect(() => {
    if (initialisedRef.current) {
      return;
    }

    initialisedRef.current = true;
    syncMenu.mutate();
  }, [syncMenu]);

  const menuItems = menuQuery.data ?? [];
  const loadingMenu = menuQuery.isLoading || menuQuery.isFetching;
  const totalLineItems = menuItems.length;

  const syncErrorMessage = useMemo(() => {
    if (!syncMenu.isError) {
      return undefined;
    }

    const error = syncMenu.error;
    if (error instanceof Error) {
      return error.message;
    }

    return 'Failed to refresh menu.';
  }, [syncMenu.error, syncMenu.isError]);

  const cartLines = useMemo(
    () => Object.values(cartLineMap),
    [cartLineMap],
  );
  const totals = useMemo(() => {
    const totalQty = cartLines.reduce((sum, line) => sum + line.qty, 0);
    const totalCents = cartLines.reduce(
      (sum, line) => sum + line.qty * line.price,
      0,
    );
    return { totalQty, totalCents };
  }, [cartLines]);

  const noMenuItems = !loadingMenu && totalLineItems === 0;
  const isSyncing = syncMenu.isPending;
  const cartIsEmpty = cartLines.length === 0;

  function handleSelect(menuItem: MenuItem) {
    addItem({
      menuItemId: menuItem.id,
      name: menuItem.name,
      price: menuItem.price,
    });
  }

  function handleCheckout() {
    if (cartIsEmpty) {
      return;
    }

    navigate('/checkout');
  }

  return (
    <div className="flex flex-col gap-6 p-6 lg:flex-row">
      <Card className="flex-1 border-dashed">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <CardTitle className="text-3xl">Sell</CardTitle>
            <CardDescription>
              Select menu items to build a customer order.
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => syncMenu.mutate()}
            disabled={isSyncing}
          >
            {isSyncing ? 'Refreshing…' : 'Refresh menu'}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search menu items…"
              autoComplete="off"
            />
            <Badge variant="secondary" className="w-fit">
              {loadingMenu
                ? 'Loading menu…'
                : `${totalLineItems} item${totalLineItems === 1 ? '' : 's'}`}
            </Badge>
          </div>
          {syncErrorMessage ? (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {syncErrorMessage}
            </div>
          ) : null}
          {noMenuItems ? (
            <div className="flex min-h-[12rem] flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              {syncMenu.isPending
                ? 'Syncing menu…'
                : 'No menu items available yet.'}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
              {menuItems.map((item) => (
                <Button
                  key={item.id}
                  type="button"
                  variant="outline"
                  className="h-32 flex-col items-start justify-between gap-2 text-left"
                  onClick={() => handleSelect(item)}
                >
                  <span className="text-sm font-medium text-foreground">
                    {item.name}
                  </span>
                  <span className="text-base font-semibold">
                    {formatCurrency(item.price)}
                  </span>
                </Button>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter className="justify-end">
          <Button
            variant="secondary"
            onClick={handleCheckout}
            disabled={cartIsEmpty}
          >
            Proceed to checkout
          </Button>
        </CardFooter>
      </Card>

      <Card className="w-full lg:w-96">
        <CardHeader className="flex flex-row items-start justify-between space-y-0">
          <div className="space-y-1">
            <CardTitle>Current order</CardTitle>
            <CardDescription>
              {cartIsEmpty
                ? 'No items in the cart yet.'
                : `${cartLines.length} item${cartLines.length === 1 ? '' : 's'} in cart`}
            </CardDescription>
          </div>
          {!cartIsEmpty ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => clear()}
            >
              Clear
            </Button>
          ) : null}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {cartLines.map((line) => (
              <div
                key={line.menuItemId}
                className="rounded-md border bg-card px-3 py-2"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {line.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(line.price)} each
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => remove(line.menuItemId)}
                  >
                    Remove
                  </Button>
                </div>
                <Separator className="my-2" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => decrement(line.menuItemId)}
                    >
                      –
                    </Button>
                    <span className="min-w-[2ch] text-center text-sm font-semibold">
                      {line.qty}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => increment(line.menuItemId)}
                    >
                      +
                    </Button>
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    {formatCurrency(line.price * line.qty)}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <Separator />
          <dl className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center justify-between">
              <dt>Items</dt>
              <dd>{cartLines.length}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt>Quantity</dt>
              <dd>{totals.totalQty}</dd>
            </div>
          </dl>
        </CardContent>
        <CardFooter className="flex-col gap-3 border-t pt-4">
          <div className="flex w-full items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Total
            </span>
            <span className="text-xl font-semibold text-foreground">
              {formatCurrency(totals.totalCents)}
            </span>
          </div>
          <Button
            className="w-full"
            onClick={handleCheckout}
            disabled={cartIsEmpty}
          >
            Proceed to checkout
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
