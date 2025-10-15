import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Minus,
  Plus,
  Receipt,
  Search,
  ShoppingCart,
  Trash2,
} from 'lucide-react';

const categories = [
  { name: 'All Items', count: 42, active: true },
  { name: 'Coffee & Tea', count: 12 },
  { name: 'Pastries', count: 8 },
  { name: 'Breakfast', count: 6 },
  { name: 'Bowls', count: 5 },
  { name: 'Seasonal', count: 4 },
  { name: 'Extras', count: 11 },
];

const products = [
  {
    id: 'americano',
    name: 'Jakarta Iced Americano',
    description: 'Robusta blend over ice with a bright citrus finish.',
    price: 45000,
    stock: 24,
    imageUrl:
      'https://images.unsplash.com/photo-1497636577773-f1231844b336?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'matcha',
    name: 'Ceremonial Matcha Oat Latte',
    description:
      'Stone-ground matcha whisked with oat milk and pandan syrup for a velvety cup.',
    price: 57500,
    stock: 12,
    imageUrl:
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'flat-white',
    name: 'Single Origin Flat White',
    description: 'Sulawesi beans with silky microfoam and caramel notes.',
    price: 49500,
    stock: 18,
    imageUrl:
      'https://images.unsplash.com/photo-1504753793650-d4a2b783c15e?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'salmon-bagel',
    name: 'Smoked Salmon Sunrise Bagel',
    description:
      'Toasted sesame bagel stacked with salmon, dill labneh, and pickled shallots.',
    price: 95000,
    stock: 6,
    imageUrl:
      'https://images.unsplash.com/photo-1571068316344-75bc76f77890?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'chia-bowl',
    name: 'Tropical Superfood Chia Bowl',
    description:
      'Chia coconut pudding layered with dragon fruit, mango pearls, and cacao nibs.',
    price: 72500,
    stock: 10,
    imageUrl:
      'https://images.unsplash.com/photo-1484980972926-edee96e0960d?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'cookie',
    name: 'Sea Salt Chocolate Chunk Cookie',
    description:
      'Brown butter cookie with dark chocolate shards and flaky sea salt.',
    price: 22500,
    stock: 32,
    imageUrl:
      'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
  },
];

const cartItems = [
  {
    id: 'matcha',
    name: 'Ceremonial Matcha Oat Latte',
    quantity: 2,
    price: 57500,
  },
  {
    id: 'salmon-bagel',
    name: 'Smoked Salmon Sunrise Bagel',
    quantity: 1,
    price: 95000,
  },
  {
    id: 'cookie',
    name: 'Sea Salt Chocolate Chunk Cookie',
    quantity: 3,
    price: 22500,
  },
];

const currencyFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export default function Checkout() {
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const taxes = subtotal * 0.0825;
  const discount = subtotal * 0.1;
  const total = subtotal - discount + taxes;
  const handleProductClick = (productId: string) => {
    console.log(`Add product ${productId} to cart`);
  };

  return (
    <div className="min-h-screen bg-muted/20 pb-16 text-left">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 md:px-6 lg:py-10">
        <div className="grid gap-6 md:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)] md:items-start">
          <section className="flex flex-col gap-5 rounded-2xl bg-card/50 p-4 shadow-sm md:p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="h-12 rounded-xl border border-border/40 bg-background/95 pl-12 text-base shadow focus-visible:ring-2 focus-visible:ring-primary/30"
                  placeholder="Search items"
                  aria-label="Search menu"
                />
              </div>
              <div className="flex gap-2">
                <Button size="lg" className="h-12 rounded-xl px-6">
                  Start New Order
                </Button>
              </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
              {categories.map((category) => (
                <Button
                  key={category.name}
                  size="lg"
                  variant={category.active ? 'default' : 'secondary'}
                  className="h-11 rounded-xl px-4"
                >
                  {category.name}
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-4">
              {products.map((product) => (
                <Card
                  key={product.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleProductClick(product.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      handleProductClick(product.id);
                    }
                  }}
                  className="group flex h-full cursor-pointer flex-col justify-between rounded-2xl border border-border/50 bg-background transition hover:border-primary/40 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                >
                  <div className="relative h-40 overflow-hidden rounded-t-2xl bg-muted/30 transition group-hover:brightness-[1.03]">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <CardHeader className="space-y-1 px-5 pt-4 pb-1">
                    <CardTitle className="text-lg font-semibold leading-tight">
                      {product.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col justify-end px-5 pb-5 pt-3">
                    <div className="flex items-baseline justify-between">
                      <p className="text-lg font-semibold">
                        {currencyFormatter.format(product.price)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <aside className="flex h-full flex-col gap-4 rounded-2xl bg-card p-4 shadow-lg md:p-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-semibold md:text-2xl">
                  Current Cart
                </h2>
              </div>
              <Badge
                variant="secondary"
                className="rounded-full px-3 py-1 whitespace-nowrap"
              >
                {cartItems.length} items
              </Badge>
            </div>

            <div className="flex-1 space-y-3 overflow-hidden rounded-2xl bg-muted/20 p-3">
              <div className="flex h-full flex-col gap-3 overflow-y-auto pr-1">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-border/45 bg-background/90 p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-base font-semibold md:text-lg">
                          {item.name}
                        </p>
                      </div>
                      <span className="text-sm font-semibold md:text-base">
                        {currencyFormatter.format(item.price * item.quantity)}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 rounded-xl"
                      >
                        <Minus className="size-4" />
                      </Button>
                      <span className="w-10 text-center text-sm font-semibold md:text-base">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 rounded-xl"
                      >
                        <Plus className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="ml-auto h-10 w-10 rounded-xl text-destructive transition-none hover:bg-destructive/10"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3 rounded-2xl border border-border/50 bg-background p-4 shadow-sm">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold">
                  {currencyFormatter.format(subtotal)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Discount</span>
                <span className="font-semibold text-green-600">
                  -{currencyFormatter.format(discount)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Taxes</span>
                <span className="font-semibold">
                  {currencyFormatter.format(taxes)}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-lg font-semibold md:text-xl">
                <span>Total</span>
                <span>{currencyFormatter.format(total)}</span>
              </div>
            </div>

            <div className="grid gap-2 md:grid-cols-2">
              <Button
                variant="outline"
                size="lg"
                className="h-12 rounded-xl text-base"
              >
                <Receipt className="size-5" />
                Hold Order
              </Button>
              <Button size="lg" className="h-12 rounded-xl text-base">
                <ShoppingCart className="size-5" />
                Charge
              </Button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
