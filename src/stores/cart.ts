import { create } from 'zustand';

export type CartLine = {
  menuItemId: string;
  name: string;
  price: number;
  qty: number;
};

type CartState = {
  lines: Record<string, CartLine>;
  addItem: (item: Omit<CartLine, 'qty'>) => void;
  increment: (menuItemId: string) => void;
  decrement: (menuItemId: string) => void;
  setQuantity: (menuItemId: string, qty: number) => void;
  remove: (menuItemId: string) => void;
  clear: () => void;
};

function nextLines(
  state: CartState['lines'],
  menuItemId: string,
  updater: (line: CartLine | undefined) => CartLine | undefined,
) {
  const current = state[menuItemId];
  const updated = updater(current);
  const next = { ...state };

  if (!updated) {
    delete next[menuItemId];
    return next;
  }

  next[menuItemId] = updated;
  return next;
}

export const useCartStore = create<CartState>((set) => ({
  lines: {},
  addItem: (item) =>
    set((state) => ({
      lines: nextLines(state.lines, item.menuItemId, (line) => {
        if (!line) {
          return { ...item, qty: 1 };
        }

        return { ...line, qty: line.qty + 1 };
      }),
    })),
  increment: (menuItemId) =>
    set((state) => ({
      lines: nextLines(state.lines, menuItemId, (line) => {
        if (!line) {
          return undefined;
        }

        return { ...line, qty: line.qty + 1 };
      }),
    })),
  decrement: (menuItemId) =>
    set((state) => ({
      lines: nextLines(state.lines, menuItemId, (line) => {
        if (!line) {
          return undefined;
        }

        const nextQty = line.qty - 1;
        if (nextQty <= 0) {
          return undefined;
        }

        return { ...line, qty: nextQty };
      }),
    })),
  setQuantity: (menuItemId, qty) =>
    set((state) => ({
      lines: nextLines(state.lines, menuItemId, (line) => {
        if (!line) {
          return undefined;
        }

        const nextQty = Number.isFinite(qty) ? Math.max(0, Math.floor(qty)) : 0;

        if (nextQty <= 0) {
          return undefined;
        }

        if (nextQty === line.qty) {
          return line;
        }

        return { ...line, qty: nextQty };
      }),
    })),
  remove: (menuItemId) =>
    set((state) => ({
      lines: nextLines(state.lines, menuItemId, () => undefined),
    })),
  clear: () => set({ lines: {} }),
}));

export function selectCartLines(state: CartState) {
  return Object.values(state.lines);
}

export function selectCartTotals(state: CartState) {
  const lines = Object.values(state.lines);
  const totalQty = lines.reduce((sum, line) => sum + line.qty, 0);
  const totalCents = lines.reduce(
    (sum, line) => sum + line.qty * line.price,
    0,
  );
  return { totalQty, totalCents };
}

export function selectCart(state: CartState) {
  const lines = Object.values(state.lines);
  const cartLines = lines.map((line) => ({
    menuItemId: line.menuItemId,
    price: line.price,
    qty: line.qty,
  }));
  const totalCents = cartLines.reduce(
    (sum, line) => sum + line.qty * line.price,
    0,
  );

  return {
    lines: cartLines,
    totalCents,
  };
}
