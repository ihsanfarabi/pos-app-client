import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

type InventoryItem = {
  id: string;
  name: string;
  category: string;
  price: number;
  description?: string;
  tags?: string[];
};

type CartLineItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

type PaymentFeedback =
  | { status: 'success'; message: string; changeDue: number; reference: string }
  | { status: 'error'; message: string };

const INVENTORY: InventoryItem[] = [
  {
    id: 'kopi-tubruk',
    name: 'Kopi Tubruk',
    category: 'Coffee & Tea',
    price: 25000,
    description: 'Traditional Indonesian coffee brewed thick and bold.',
    tags: ['Hot'],
  },
  {
    id: 'es-teh-manis',
    name: 'Es Teh Manis',
    category: 'Coffee & Tea',
    price: 15000,
    description: 'Refreshing house-brewed sweet iced tea.',
    tags: ['Iced'],
  },
  {
    id: 'sate-ayam',
    name: 'Sate Ayam',
    category: 'Appetizers',
    price: 42000,
    description: 'Charcoal-grilled chicken skewers with peanut sauce.',
    tags: ['Signature'],
  },
  {
    id: 'nasi-goreng',
    name: 'Nasi Goreng Kampung',
    category: 'Main Courses',
    price: 48000,
    description: 'Wok-fried rice with shrimp paste, egg, and crackers.',
    tags: ['Best Seller'],
  },
  {
    id: 'rendang-sapi',
    name: 'Rendang Sapi',
    category: 'Specials',
    price: 68000,
    description: 'Slow-braised beef in rich coconut and spice gravy.',
    tags: ['Weekend Special'],
  },
  {
    id: 'es-cendol',
    name: 'Es Cendol',
    category: 'Desserts',
    price: 30000,
    description: 'Pandan jelly, coconut milk, and palm sugar over ice.',
    tags: ['Cold'],
  },
  {
    id: 'perkedel-kentang',
    name: 'Perkedel Kentang',
    category: 'Sides',
    price: 22000,
    description: 'Pan-fried mashed potato patties with scallions.',
  },
  {
    id: 'mini-nasi-goreng',
    name: 'Mini Nasi Goreng',
    category: 'Kids Meals',
    price: 32000,
    description: 'Kid-sized fried rice with chicken and sweet soy.',
  },
  {
    id: 'soto-ayam',
    name: 'Soto Ayam',
    category: 'Soups',
    price: 36000,
    description: 'Turmeric chicken soup with vermicelli and herbs.',
    tags: ['Comfort Food'],
  },
  {
    id: 'pisang-goreng',
    name: 'Pisang Goreng',
    category: 'Snacks',
    price: 28000,
    description: 'Crispy fried banana served with palm sugar drizzle.',
  },
];

const TAX_RATE = 0.0825;

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

export default function Order() {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartLineItem[]>([]);
  const [tendered, setTendered] = useState('');
  const [note, setNote] = useState('');
  const [feedback, setFeedback] = useState<PaymentFeedback | null>(null);

  const categories = useMemo(() => {
    return ['All', ...new Set(INVENTORY.map((item) => item.category))];
  }, []);

  const filteredItems = useMemo(() => {
    const normalizedTerm = searchTerm.trim().toLowerCase();
    return INVENTORY.filter((item) => {
      const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
      const matchesTerm =
        normalizedTerm.length === 0 || item.name.toLowerCase().includes(normalizedTerm);
      return matchesCategory && matchesTerm;
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [activeCategory, searchTerm]);

  const subtotal = useMemo(
    () => cart.reduce((acc, item) => acc + item.price * item.quantity, 0),
    [cart],
  );
  const tax = useMemo(() => subtotal * TAX_RATE, [subtotal]);
  const total = useMemo(() => subtotal + tax, [subtotal, tax]);
  const amountTendered = Number.parseFloat(tendered);
  const changeDue = !Number.isNaN(amountTendered) ? Math.max(amountTendered - total, 0) : 0;

  const handleAddItem = (item: InventoryItem) => {
    setCart((previous) => {
      const existing = previous.find((line) => line.id === item.id);
      if (existing) {
        return previous.map((line) =>
          line.id === item.id ? { ...line, quantity: line.quantity + 1 } : line,
        );
      }
      return [...previous, { id: item.id, name: item.name, price: item.price, quantity: 1 }];
    });
    setFeedback(null);
  };

  const handleAdjustQuantity = (id: string, delta: number) => {
    setCart((previous) =>
      previous
        .map((line) =>
          line.id === id ? { ...line, quantity: Math.max(line.quantity + delta, 0) } : line,
        )
        .filter((line) => line.quantity > 0),
    );
  };

  const handleRemoveItem = (id: string) => {
    setCart((previous) => previous.filter((line) => line.id !== id));
  };

  const handleCharge = () => {
    if (cart.length === 0) {
      setFeedback({ status: 'error', message: 'Add at least one item before charging.' });
      return;
    }

    const parsedTendered = Number.parseFloat(tendered);
    if (Number.isNaN(parsedTendered) || parsedTendered <= 0) {
      setFeedback({ status: 'error', message: 'Enter a valid amount tendered to continue.' });
      return;
    }

    if (parsedTendered < total) {
      setFeedback({ status: 'error', message: 'Amount tendered must cover the ticket total.' });
      return;
    }

    const reference = `TKT-${Date.now().toString().slice(-6)}`;
    setFeedback({
      status: 'success',
      message: 'Payment accepted. Ticket closed.',
      changeDue: parsedTendered - total,
      reference,
    });
    setCart([]);
    setTendered('');
    setNote('');
  };

  return (
    <div className="flex flex-col gap-3 p-2 sm:gap-6 sm:p-6">
      <div className="grid gap-3 sm:gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="min-w-0">
          <ClassicProductList
            categories={categories}
            activeCategory={activeCategory}
            onSelectCategory={setActiveCategory}
            searchTerm={searchTerm}
            onSearch={setSearchTerm}
            items={filteredItems}
            onAddItem={handleAddItem}
          />
        </div>
        <div className="min-w-0">
          <OrderPanel
            cart={cart}
            onAdjustQuantity={handleAdjustQuantity}
            onRemoveItem={handleRemoveItem}
            subtotal={subtotal}
            tax={tax}
            total={total}
            tendered={tendered}
            onTenderedChange={setTendered}
            note={note}
            onNoteChange={setNote}
            feedback={feedback}
            changeDue={changeDue}
            onCharge={handleCharge}
          />
        </div>
      </div>
    </div>
  );
}

type ClassicProductListProps = {
  categories: string[];
  activeCategory: string;
  onSelectCategory: (category: string) => void;
  searchTerm: string;
  onSearch: (value: string) => void;
  items: InventoryItem[];
  onAddItem: (item: InventoryItem) => void;
};

function ClassicProductList({
  categories,
  activeCategory,
  onSelectCategory,
  searchTerm,
  onSearch,
  items,
  onAddItem,
}: ClassicProductListProps) {
  return (
    <Card className="w-full min-w-0">
      <CardHeader className="space-y-4">
        <CardTitle className="text-lg">Menu</CardTitle>
        <div className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible">
          {categories.map((category) => (
            <Button
              key={category}
              variant={category === activeCategory ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => onSelectCategory(category)}
              className="shrink-0"
            >
              {category}
            </Button>
          ))}
        </div>
        <Input
          placeholder="Type to filter"
          value={searchTerm}
          onChange={(event) => onSearch(event.target.value)}
          className="h-10"
        />
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-[32rem] overflow-x-auto overflow-y-auto">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 bg-background">
              <tr className="text-left text-xs uppercase text-muted-foreground">
                <th className="px-4 py-3 font-medium">Item</th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell">Category</th>
                <th className="px-4 py-3 font-medium text-right">Price</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-6 text-center text-xs text-muted-foreground"
                  >
                    No items to display. Try a different search.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr
                    key={item.id}
                    className="border-t border-border/60 transition hover:bg-muted/60"
                  >
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium">{item.name}</div>
                      {item.description ? (
                        <div className="text-xs text-muted-foreground">{item.description}</div>
                      ) : null}
                    </td>
                    <td className="hidden px-4 py-3 text-xs text-muted-foreground sm:table-cell">
                      {item.category}
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-semibold">
                      {formatCurrency(item.price)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button size="sm" onClick={() => onAddItem(item)}>
                        Add
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

type OrderPanelProps = {
  cart: CartLineItem[];
  onAdjustQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  subtotal: number;
  tax: number;
  total: number;
  tendered: string;
  onTenderedChange: (value: string) => void;
  note: string;
  onNoteChange: (value: string) => void;
  feedback: PaymentFeedback | null;
  changeDue: number;
  onCharge: () => void;
};

function OrderPanel({
  cart,
  onAdjustQuantity,
  onRemoveItem,
  subtotal,
  tax,
  total,
  tendered,
  onTenderedChange,
  note,
  onNoteChange,
  feedback,
  changeDue,
  onCharge,
}: OrderPanelProps) {
  const displayChangeDue =
    feedback?.status === 'success' ? feedback.changeDue : changeDue;

  return (
    <Card className="w-full min-w-0 border bg-background shadow-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-lg">Order Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              <span>No items have been added yet.</span>
              <span>Use the menu to build the ticket.</span>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex items-center gap-3 rounded-lg border p-3">
                <div>
                  <div className="text-sm font-medium">{item.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {item.quantity} x {formatCurrency(item.price)}
                  </div>
                </div>
                <div className="ml-auto flex items-center gap-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => onAdjustQuantity(item.id, -1)}
                    aria-label={`Decrease ${item.name}`}
                  >
                    -
                  </Button>
                  <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => onAdjustQuantity(item.id, 1)}
                    aria-label={`Increase ${item.name}`}
                  >
                    +
                  </Button>
                </div>
                <div className="w-16 text-right text-sm font-semibold">
                  {formatCurrency(item.price * item.quantity)}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemoveItem(item.id)}
                  aria-label={`Remove ${item.name}`}
                >
                  x
                </Button>
              </div>
            ))
          )}
        </div>
        <Separator />
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Tax ({(TAX_RATE * 100).toFixed(1)}%)</span>
            <span className="font-medium">{formatCurrency(tax)}</span>
          </div>
          <div className="flex items-center justify-between text-base font-semibold">
            <span>Total due</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>
        <div className="space-y-3">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-muted-foreground">Amount tendered</span>
            <Input
              type="number"
              min="0"
              inputMode="decimal"
              value={tendered}
              onChange={(event) => onTenderedChange(event.target.value)}
              placeholder="0.00"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-muted-foreground">Ticket note (optional)</span>
            <textarea
              value={note}
              onChange={(event) => onNoteChange(event.target.value)}
              rows={3}
              className={cn(
                'w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
                'min-h-[4.5rem]',
              )}
              placeholder="Add note for the kitchen or customer"
            />
          </label>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-3">
        {feedback ? (
          <div
            className={cn('w-full rounded-md border px-3 py-2 text-sm', {
              'border-green-500/40 bg-green-500/10 text-emerald-900 dark:text-emerald-100':
                feedback.status === 'success',
              'border-destructive/40 bg-destructive/10 text-destructive':
                feedback.status === 'error',
            })}
          >
            <div className="font-medium">
              {feedback.status === 'success' ? 'Success' : 'Check ticket'}
            </div>
            <div>{feedback.message}</div>
            {feedback.status === 'success' ? (
              <div className="mt-1 text-xs text-muted-foreground">
                Reference: {feedback.reference} | Change due {formatCurrency(feedback.changeDue)}
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="flex w-full flex-col gap-2 sm:flex-row">
          <Button className="w-full text-base font-semibold" size="lg" onClick={onCharge}>
            Charge {formatCurrency(total)}
          </Button>
          {feedback?.status === 'success' ? (
            <div className="flex w-full flex-col justify-center rounded-md border border-dashed px-3 py-2 text-xs text-muted-foreground sm:w-auto">
              <span>Change due</span>
              <span className="text-sm font-semibold">{formatCurrency(displayChangeDue)}</span>
            </div>
          ) : null}
        </div>
      </CardFooter>
    </Card>
  );
}
