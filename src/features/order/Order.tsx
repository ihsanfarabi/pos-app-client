import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useSidebar } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

// Shared CSS class constants to reduce repetition and keep styling consistent
const css = {
  card: 'w-full min-w-0 border bg-background shadow-sm',
  sectionYTight: 'space-y-0.5 sm:space-y-1',
  sectionY: 'space-y-2.5 sm:space-y-3',
  sectionYLoose: 'space-y-3 sm:space-y-4 md:landscape:space-y-2.5',
  subtle: 'text-xs text-muted-foreground',
  priceCell: 'px-4 py-3 text-right text-sm font-semibold',
  itemRow: 'border-t border-border/60 transition hover:bg-muted/60',
  primaryAction: 'w-full text-sm font-semibold sm:text-base',
} as const;

// Consolidated responsive layout rules for the category section
function categoryLayout(isSidebarExpanded: boolean) {
  const collapsed = !isSidebarExpanded;
  return {
    wrapper: cn('flex flex-col xl:flex-row', collapsed && 'sm:flex-row'),
    nav: cn(
      'border-b border-border/60 px-2.5 py-3 xl:w-36 xl:border-b-0 xl:border-r',
      collapsed && 'sm:w-36 sm:border-b-0 sm:border-r',
    ),
    navInner: cn(
      'flex gap-2 overflow-x-auto pb-1 xl:flex-col xl:gap-1.5 xl:overflow-visible',
      collapsed && 'sm:flex-col sm:gap-1.5 sm:overflow-visible',
    ),
    categoryBtn: cn(
      'whitespace-normal break-words text-center leading-tight max-w-[9rem] xl:w-full xl:max-w-none',
      collapsed && 'sm:w-full sm:max-w-none',
    ),
  } as const;
}

type InventoryItem = {
  id: string;
  name: string;
  category: string;
  price: number;
  description?: string;
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
    id: 'double-espresso',
    name: 'Double Espresso',
    category: 'Espresso Bar',
    price: 28000,
    description:
      'Two shots of house-roasted espresso pulled to showcase dark chocolate and orange zest notes.',
  },
  {
    id: 'flat-white',
    name: 'Flat White',
    category: 'Espresso Bar',
    price: 35000,
    description: 'Silky microfoam poured over ristretto shots for a balanced, velvety cup.',
  },
  {
    id: 'oat-latte',
    name: 'Oat Milk Latte',
    category: 'Espresso Bar',
    price: 38000,
    description: 'Classic latte sweetened with panela syrup and finished with barista oat milk.',
  },
  {
    id: 'v60-sumatra',
    name: 'V60 Single Origin: Sumatra Lintong',
    category: 'Brew Bar',
    price: 45000,
    description: 'Hand-poured filter brew with syrupy body, sweet tobacco aroma, and spice finish.',
  },
  {
    id: 'aeropress-ethiopia',
    name: 'Aeropress Ethiopia Guji',
    category: 'Brew Bar',
    price: 42000,
    description: 'Clean cup with jasmine florals and bright citrus, brewed to order in five minutes.',
  },
  {
    id: 'nitro-cold-brew',
    name: 'Nitro Cold Brew',
    category: 'Cold Coffee',
    price: 48000,
    description: 'Slow-steeped concentrate charged with nitrogen for a silky cascade and cocoa aroma.',
  },
  {
    id: 'salted-caramel-cold-brew',
    name: 'Salted Caramel Cream Cold Brew',
    category: 'Cold Coffee',
    price: 52000,
    description: 'House cold brew topped with caramel foam and smoked sea salt for a sweet-savory sip.',
  },
  {
    id: 'matcha-tonic',
    name: 'Matcha Tonic',
    category: 'Tea & Refreshers',
    price: 42000,
    description: 'Ceremonial matcha shaken with citrus tonic for a sparkling herbal refresher.',
  },
  {
    id: 'spiced-chai',
    name: 'Spiced Chai Latte',
    category: 'Tea & Refreshers',
    price: 36000,
    description: 'Masala chai concentrate simmered with spices and finished with steamed milk.',
  },
  {
    id: 'brown-butter-croissant',
    name: 'Brown Butter Croissant',
    category: 'Pastry Case',
    price: 32000,
    description: 'Flaky laminated pastry baked daily with browned butter for a nutty finish.',
  },
  {
    id: 'walnut-banana-bread',
    name: 'Walnut Banana Bread',
    category: 'Pastry Case',
    price: 28000,
    description: 'Moist banana loaf slices studded with toasted walnuts and espresso glaze.',
  },
  {
    id: 'cold-brew-oats',
    name: 'Vanilla Cold Brew Oats',
    category: 'Grab & Go',
    price: 34000,
    description: 'Overnight oats soaked in cold brew with vanilla yogurt and cacao nib crunch.',
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
  const { state: sidebarState } = useSidebar();
  const isSidebarExpanded = sidebarState === 'expanded';

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

  const handleClearOrder = () => {
    setCart([]);
    setTendered('');
    setNote('');
    setFeedback(null);
  };

  return (
    <div className="flex flex-col gap-2 p-1 sm:gap-3 sm:p-2 md:p-3">
      <div className="grid gap-3 sm:gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="min-w-0">
          <ProductList
            categories={categories}
            activeCategory={activeCategory}
            onSelectCategory={setActiveCategory}
            searchTerm={searchTerm}
            onSearch={setSearchTerm}
            items={filteredItems}
            onAddItem={handleAddItem}
            isSidebarExpanded={isSidebarExpanded}
          />
        </div>
        <div className="min-w-0">
          <OrderPanel
            cart={cart}
            onAdjustQuantity={handleAdjustQuantity}
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
            onClear={handleClearOrder}
          />
        </div>
      </div>
    </div>
  );
}

type ProductListProps = {
  categories: string[];
  activeCategory: string;
  onSelectCategory: (category: string) => void;
  searchTerm: string;
  onSearch: (value: string) => void;
  items: InventoryItem[];
  onAddItem: (item: InventoryItem) => void;
  isSidebarExpanded: boolean;
};

function ProductList({
  categories,
  activeCategory,
  onSelectCategory,
  searchTerm,
  onSearch,
  items,
  onAddItem,
  isSidebarExpanded,
}: ProductListProps) {
  return (
    <Card className={css.card}>
      <CardHeader className="space-y-0">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-lg">Catalogue</CardTitle>
          <div className="relative flex-1 min-w-[8rem] sm:max-w-[16rem]">
            <Label htmlFor="catalogue-search" className="sr-only">
              Filter catalogue
            </Label>
            <Input
              id="catalogue-search"
              type="search"
              placeholder="Search catalogue"
              value={searchTerm}
              onChange={(event) => onSearch(event.target.value)}
              className="h-10 w-full pl-8"
            />
            <Search className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {(() => {
          const layout = categoryLayout(isSidebarExpanded);
          return (
            <div className={layout.wrapper}>
              <div className={layout.nav}>
                <div className={layout.navInner}>
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant={category === activeCategory ? 'secondary' : 'outline'}
                      size="sm"
                      onClick={() => onSelectCategory(category)}
                      className={layout.categoryBtn}
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="flex-1">
                <div className="max-h-[32rem] sm:max-h-[36rem] overflow-auto">
                  <table className="min-w-full text-sm">
                    <tbody>
                      {items.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="px-4 py-6 text-center text-xs text-muted-foreground">
                            No items to display. Try a different search.
                          </td>
                        </tr>
                      ) : (
                        items.map((item) => (
                          <tr key={item.id} className={css.itemRow}>
                            <td className="px-4 py-3">
                              <div className="text-sm font-medium">{item.name}</div>
                              {item.description ? (
                                <div className={css.subtle}>{item.description}</div>
                              ) : null}
                            </td>
                            <td className={css.priceCell}>{formatCurrency(item.price)}</td>
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
              </div>
            </div>
          );
        })()}
      </CardContent>
    </Card>
  );
}

type OrderPanelProps = {
  cart: CartLineItem[];
  onAdjustQuantity: (id: string, delta: number) => void;
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
  onClear: () => void;
};

function OrderPanel({
  cart,
  onAdjustQuantity,
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
  onClear,
}: OrderPanelProps) {
  const displayChangeDue =
    feedback?.status === 'success' ? feedback.changeDue : changeDue;
  const hasOrderDetails =
    cart.length > 0 ||
    tendered.trim().length > 0 ||
    note.trim().length > 0 ||
    feedback !== null;

  return (
    <Card className={css.card}>
      <CardHeader className={css.sectionYTight}>
        <CardTitle className="text-lg">Order Details</CardTitle>
      </CardHeader>
      <CardContent className={css.sectionYLoose}>
        <div className="space-y-2.5 sm:space-y-3 md:landscape:space-y-2">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground sm:gap-2 sm:p-6 sm:text-sm">
              <span>No items have been added yet.</span>
              <span>Add something tasty from the menu.</span>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-2.5 rounded-lg border p-2.5 sm:gap-3 sm:p-3 md:landscape:gap-2 md:landscape:rounded-md"
              >
                <div>
                  <div className="text-sm font-medium">{item.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {item.quantity} x {formatCurrency(item.price)}
                  </div>
                </div>
                <div className="ml-auto flex items-center gap-2.5 sm:gap-4 md:landscape:gap-2">
                  <div className="flex items-center gap-1 md:landscape:gap-0.5">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => onAdjustQuantity(item.id, -1)}
                      aria-label={`Decrease ${item.name}`}
                      className="md:landscape:h-8 md:landscape:w-8"
                    >
                      -
                    </Button>
                    <span className="w-8 text-center text-sm font-medium md:landscape:w-7 md:landscape:text-xs">
                      {item.quantity}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => onAdjustQuantity(item.id, 1)}
                      aria-label={`Increase ${item.name}`}
                      className="md:landscape:h-8 md:landscape:w-8"
                    >
                      +
                    </Button>
                  </div>
                  <div className="min-w-[5.5rem] whitespace-nowrap text-right text-sm font-semibold tabular-nums sm:min-w-[6rem] md:landscape:min-w-[4.75rem] md:landscape:text-xs">
                    {formatCurrency(item.price * item.quantity)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        <Separator />
        <div className={css.sectionY}>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Tax ({(TAX_RATE * 100).toFixed(1)}%)</span>
            <span className="font-medium">{formatCurrency(tax)}</span>
          </div>
          <div className="flex items-center justify-between text-sm font-semibold sm:text-base">
            <span>Total due</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>
        <div className={css.sectionY}>
          <div className="flex flex-col gap-1 text-sm">
            <Label htmlFor="amount-tendered" className="text-muted-foreground">
              Payment received
            </Label>
            <Input
              id="amount-tendered"
              type="number"
              min="0"
              inputMode="decimal"
              value={tendered}
              onChange={(event) => onTenderedChange(event.target.value)}
              placeholder="0.00"
            />
          </div>
          <div className="flex flex-col gap-1 text-sm">
            <Label htmlFor="ticket-note" className="text-muted-foreground">
              Ticket note (optional)
            </Label>
            <Textarea
              id="ticket-note"
              value={note}
              onChange={(event) => onNoteChange(event.target.value)}
              placeholder="Add note for the customer"
              rows={3}
              className="min-h-[3.5rem] sm:min-h-[4.5rem]"
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-2 sm:gap-3">
        {feedback ? (
          <div
            className={cn('w-full rounded-md border px-2.5 py-2 text-xs sm:px-3 sm:text-sm', {
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

        <div className="flex w-full flex-col gap-1.5 sm:flex-row sm:gap-2">
          <Button
            type="button"
            variant="outline"
            className={css.primaryAction}
            size="lg"
            onClick={onClear}
            disabled={!hasOrderDetails}
          >
            Clear order
          </Button>
          <Button className={css.primaryAction} size="lg" onClick={onCharge}>
            Charge
          </Button>
          {feedback?.status === 'success' ? (
            <div className="flex w-full flex-col justify-center rounded-md border border-dashed px-2.5 py-2 text-xs text-muted-foreground sm:w-auto sm:px-3 sm:text-sm">
              <span>Change due</span>
              <span className="text-sm font-semibold">{formatCurrency(displayChangeDue)}</span>
            </div>
          ) : null}
        </div>
      </CardFooter>
    </Card>
  );
}
