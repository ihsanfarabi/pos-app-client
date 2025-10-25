import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { Banknote, CreditCard, QrCode, Search, Trash2 } from "lucide-react";

type Category = {
  id: string;
  name: string;
};

type CatalogueItem = {
  id: string;
  name: string;
  price: number;
  categoryId: string;
};

type OrderState = Record<
  CatalogueItem["id"],
  {
    item: CatalogueItem;
    quantity: number;
  }
>;

type PaymentMethod = "cash" | "debit-card" | "e-wallet";

const TAX_RATE = 0.1;

const PAYMENT_METHODS: {
  id: PaymentMethod;
  label: string;
  icon: LucideIcon;
}[] = [
  { id: "cash", label: "Cash", icon: Banknote },
  { id: "debit-card", label: "Debit Card", icon: CreditCard },
  { id: "e-wallet", label: "E-Wallet", icon: QrCode },
];

const categories: Category[] = [
  { id: "coffee", name: "Coffee" },
  { id: "tea", name: "Tea" },
  { id: "pastries", name: "Pastries" },
  { id: "sandwiches", name: "Sandwiches" },
  { id: "specials", name: "Seasonal Specials" },
  { id: "smoothies", name: "Smoothies" },
  { id: "breakfast", name: "Breakfast" },
  { id: "merch", name: "Merchandise" },
];

const catalogue: CatalogueItem[] = [
  {
    id: "americano",
    name: "Americano",
    price: 4250,
    categoryId: "coffee",
  },
  {
    id: "flat-white",
    name: "Flat White",
    price: 5250,
    categoryId: "coffee",
  },
  {
    id: "cortado",
    name: "Cortado",
    price: 4750,
    categoryId: "coffee",
  },
  {
    id: "iced-latte",
    name: "Iced Latte",
    price: 5750,
    categoryId: "coffee",
  },
  {
    id: "mocha",
    name: "Chocolate Mocha",
    price: 5950,
    categoryId: "coffee",
  },
  {
    id: "matcha",
    name: "Matcha Latte",
    price: 6000,
    categoryId: "tea",
  },
  {
    id: "chai",
    name: "Dirty Chai",
    price: 5500,
    categoryId: "tea",
  },
  {
    id: "earl-grey",
    name: "London Fog",
    price: 4850,
    categoryId: "tea",
  },
  {
    id: "cold-brew",
    name: "Cold Brew",
    price: 5000,
    categoryId: "tea",
  },
  {
    id: "hibiscus-iced",
    name: "Hibiscus Iced Tea",
    price: 4500,
    categoryId: "tea",
  },
  {
    id: "croissant",
    name: "Butter Croissant",
    price: 3500,
    categoryId: "pastries",
  },
  {
    id: "muffin",
    name: "Blueberry Muffin",
    price: 3750,
    categoryId: "pastries",
  },
  {
    id: "chocolate-chip-cookie",
    name: "Chocolate Chunk Cookie",
    price: 3250,
    categoryId: "pastries",
  },
  {
    id: "cinnamon-roll",
    name: "Cinnamon Roll",
    price: 4250,
    categoryId: "pastries",
  },
  {
    id: "bagel",
    name: "Everything Bagel",
    price: 4000,
    categoryId: "pastries",
  },
  {
    id: "club-sandwich",
    name: "Roasted Turkey Club",
    price: 9500,
    categoryId: "sandwiches",
  },
  {
    id: "caprese",
    name: "Caprese Ciabatta",
    price: 8750,
    categoryId: "sandwiches",
  },
  {
    id: "veggie-wrap",
    name: "Grilled Veggie Wrap",
    price: 8250,
    categoryId: "sandwiches",
  },
  {
    id: "prosciutto-panini",
    name: "Prosciutto Panini",
    price: 10250,
    categoryId: "sandwiches",
  },
  {
    id: "soup-combo",
    name: "Soup & Half Sandwich",
    price: 10000,
    categoryId: "specials",
  },
  {
    id: "pumpkin-latte",
    name: "Pumpkin Spice Latte",
    price: 6250,
    categoryId: "specials",
  },
  {
    id: "citrus-fizz",
    name: "Citrus Espresso Fizz",
    price: 5900,
    categoryId: "specials",
  },
  {
    id: "tasting-board",
    name: "Chef Tasting Board",
    price: 14500,
    categoryId: "specials",
  },
  {
    id: "avocado-toast",
    name: "Avocado Toast",
    price: 7250,
    categoryId: "specials",
  },
  {
    id: "berry-breeze",
    name: "Berry Breeze Smoothie",
    price: 6500,
    categoryId: "smoothies",
  },
  {
    id: "tropical-sunrise",
    name: "Tropical Sunrise Smoothie",
    price: 6750,
    categoryId: "smoothies",
  },
  {
    id: "breakfast-burrito",
    name: "Veggie Breakfast Burrito",
    price: 8950,
    categoryId: "breakfast",
  },
  {
    id: "overnight-oats",
    name: "Maple Overnight Oats",
    price: 5500,
    categoryId: "breakfast",
  },
  {
    id: "house-blend-beans",
    name: "House Blend Beans (12oz)",
    price: 15000,
    categoryId: "merch",
  },
  {
    id: "ceramic-mug",
    name: "Signature Ceramic Mug",
    price: 18000,
    categoryId: "merch",
  },
];

const currencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

function formatCurrency(amount: number) {
  return currencyFormatter.format(amount);
}

export default function Order() {
  const { state } = useSidebar();
  const isSidebarExpanded = state === "expanded";
  const [activeCategory, setActiveCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [order, setOrder] = useState<OrderState>({});
  const [shouldReduceColumns, setShouldReduceColumns] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState<"amount" | "percent">(
    "amount"
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [selectedOrderItemId, setSelectedOrderItemId] = useState<
    CatalogueItem["id"] | null
  >(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const evaluateShouldReduce = () => {
      setShouldReduceColumns(isSidebarExpanded && window.innerWidth < 1280);
    };

    evaluateShouldReduce();
    window.addEventListener("resize", evaluateShouldReduce);
    return () => window.removeEventListener("resize", evaluateShouldReduce);
  }, [isSidebarExpanded]);

  const items = useMemo(() => {
    const normalizedQuery = searchTerm.trim().toLowerCase();
    return catalogue.filter((product) => {
      const matchesCategory = activeCategory
        ? product.categoryId === activeCategory
        : true;
      const matchesSearch = normalizedQuery
        ? product.name.toLowerCase().includes(normalizedQuery)
        : true;
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchTerm]);

  const orderItems = useMemo(() => Object.values(order), [order]);

  const subtotal = useMemo(() => {
    return orderItems.reduce(
      (total, current) => total + current.item.price * current.quantity,
      0
    );
  }, [orderItems]);
  const discountAmount = useMemo(() => {
    if (subtotal <= 0) {
      return 0;
    }

    const sanitized = Number.isFinite(discount) ? Math.max(discount, 0) : 0;
    if (discountType === "percent") {
      const cappedPercent = Math.min(sanitized, 100);
      return subtotal * (cappedPercent / 100);
    }

    return Math.min(sanitized, subtotal);
  }, [discount, discountType, subtotal]);
  const taxableSubtotal = Math.max(subtotal - discountAmount, 0);
  const estimatedTax = taxableSubtotal * TAX_RATE;
  const totalDue = taxableSubtotal + estimatedTax;

  useEffect(() => {
    if (discountType === "percent") {
      if (discount <= 100) {
        return;
      }

      setDiscount(100);
      return;
    }

    if (discount <= subtotal) {
      return;
    }

    setDiscount(subtotal);
  }, [discount, discountType, subtotal]);

  const categoryGridClasses = cn(
    "grid w-full grid-cols-2 gap-2 sm:grid-cols-3",
    shouldReduceColumns ? "lg:grid-cols-3" : "lg:grid-cols-4"
  );

  const catalogueGridClasses = cn(
    "grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3",
    shouldReduceColumns ? "lg:grid-cols-3" : "lg:grid-cols-4"
  );

  function handleAddToOrder(item: CatalogueItem) {
    setOrder((previous) => {
      const existing = previous[item.id];
      return {
        ...previous,
        [item.id]: {
          item,
          quantity: existing ? existing.quantity + 1 : 1,
        },
      };
    });
  }

  function handleRemoveFromOrder(itemId: CatalogueItem["id"]) {
    setOrder((previous) => {
      const { [itemId]: removed, ...rest } = previous;
      return removed ? rest : previous;
    });
    setSelectedOrderItemId((current) =>
      current === itemId ? null : current
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/20">
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 p-4 pb-8 md:p-6 lg:p-8">
        <div className="grid flex-1 gap-6 lg:grid-cols-[2.5fr_1fr]">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between lg:col-span-2">
            <div className="relative w-full sm:max-w-xs">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id="order-search"
                type="search"
                placeholder="Search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                aria-label="Search menu items"
                className="w-full pl-9"
              />
            </div>
          </div>

          <section className="flex flex-col gap-4">
            <div className={categoryGridClasses}>
              {categories.map((category) => (
                <Button
                  key={category.id}
                  size="sm"
                  variant={
                    activeCategory === category.id ? "default" : "outline"
                  }
                  className="h-12 w-full justify-center text-sm font-medium"
                  onClick={() =>
                    setActiveCategory((current) =>
                      current === category.id ? "" : category.id
                    )
                  }
                >
                  {category.name}
                </Button>
              ))}
            </div>

            <div className={catalogueGridClasses}>
              {items.map((item) => (
                <Card
                  key={item.id}
                  className="flex h-full flex-col border-border/80 transition hover:border-primary/70 hover:shadow-lg"
                >
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-semibold">
                      {item.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-1 items-end justify-between">
                    <span className="text-base font-semibold text-foreground">
                      {formatCurrency(item.price)}
                    </span>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <Button
                      className="w-full"
                      onClick={() => handleAddToOrder(item)}
                    >
                      Add to order
                    </Button>
                  </CardFooter>
                </Card>
              ))}
              {items.length === 0 && (
                <Card className="col-span-full border-dashed border-primary/30 bg-background/70">
                  <CardContent className="flex min-h-[180px] items-center justify-center text-center text-muted-foreground">
                    {searchTerm.trim()
                      ? "No items found for your search."
                      : activeCategory
                        ? "No items available in this category yet."
                        : "No items available yet."}
                  </CardContent>
                </Card>
              )}
            </div>
          </section>

          <aside className="flex flex-col">
            <Card className="flex flex-col">
              <CardContent className="flex flex-1 flex-col p-0">
                <div className="flex-1 overflow-y-auto px-6 py-6">
                  {orderItems.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Looks a bit empty! Add something from the catalogue.{" "}
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {orderItems.map(({ item, quantity }) => {
                        const isSelected = selectedOrderItemId === item.id;
                        return (
                          <div
                            key={item.id}
                            role="button"
                            tabIndex={0}
                            onClick={() =>
                              setSelectedOrderItemId((current) =>
                                current === item.id ? null : item.id
                              )
                            }
                            onKeyDown={(event) => {
                              if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                setSelectedOrderItemId((current) =>
                                  current === item.id ? null : item.id
                                );
                              }
                            }}
                            className={cn(
                              "rounded-lg border border-border/80 bg-muted/40 p-4 shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                              "cursor-pointer",
                              isSelected && "border-destructive/70 bg-destructive/5"
                            )}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2">
                                <h3 className="text-base font-semibold">
                                  {item.name}
                                </h3>
                                <Badge variant="secondary" className="px-2">
                                  x{quantity}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-foreground">
                                  {formatCurrency(item.price * quantity)}
                                </span>
                                {isSelected && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      handleRemoveFromOrder(item.id);
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                <Separator />
                <div className="space-y-4 px-6 pb-6 pt-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="order-discount">Discount</Label>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant={
                            discountType === "amount" ? "default" : "outline"
                          }
                          onClick={() => setDiscountType("amount")}
                          disabled={orderItems.length === 0}
                        >
                          Amount
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant={
                            discountType === "percent" ? "default" : "outline"
                          }
                          onClick={() => setDiscountType("percent")}
                          disabled={orderItems.length === 0}
                        >
                          Percent
                        </Button>
                      </div>
                    </div>
                    <Input
                      id="order-discount"
                      type="number"
                      min={0}
                      step="0.01"
                      value={Number.isFinite(discount) ? discount : ""}
                      onChange={(event) => {
                        const { value } = event.target;
                        const normalizedValue =
                          value.length > 1 &&
                          value.startsWith("0") &&
                          !value.startsWith("0.")
                            ? value.replace(/^0+(?=\d)/, "")
                            : value;
                        if (normalizedValue !== value) {
                          event.target.value = normalizedValue;
                        }
                        const parsed = Number.parseFloat(normalizedValue);
                        if (!Number.isFinite(parsed)) {
                          setDiscount(0);
                          return;
                        }

                        const sanitized = Math.max(0, parsed);
                        setDiscount(
                          discountType === "percent"
                            ? Math.min(sanitized, 100)
                            : sanitized
                        );
                      }}
                      onKeyDown={(event) => {
                        if (event.key === ",") {
                          event.preventDefault();
                        }
                      }}
                      placeholder={discountType === "percent" ? "0" : "0.00"}
                      disabled={orderItems.length === 0}
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Subtotal</span>
                    <span className="font-medium text-foreground">
                      {formatCurrency(subtotal)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Discount</span>
                    <span className="font-medium text-foreground">
                      -{formatCurrency(discountAmount)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Tax 10%</span>
                    <span className="font-medium text-foreground">
                      {formatCurrency(estimatedTax)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-lg font-semibold text-foreground">
                    <span>Total</span>
                    <span>{formatCurrency(totalDue)}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t bg-muted/30 p-6">
                <div className="w-full space-y-8">
                  <div className="space-y-2">
                    <Label>Payment method</Label>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      {PAYMENT_METHODS.map((method) => (
                        <div
                          key={method.id}
                          className="flex flex-col items-center gap-2"
                        >
                          <Button
                            type="button"
                            aria-label={method.label}
                            title={method.label}
                            className="flex h-12 w-full items-center justify-center"
                            variant={
                              paymentMethod === method.id
                                ? "default"
                                : "outline"
                            }
                            onClick={() => setPaymentMethod(method.id)}
                            disabled={orderItems.length === 0}
                          >
                            <method.icon className="h-6 w-6" />
                          </Button>
                          <span className="text-xs font-medium text-muted-foreground">
                            {method.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full flex-1 py-6 text-base font-semibold"
                      disabled={orderItems.length === 0}
                    >
                      Save
                    </Button>
                    <Button
                      className="w-full flex-1 py-6 text-base font-semibold"
                      disabled={orderItems.length === 0}
                    >
                      Charge
                    </Button>
                  </div>
                </div>
              </CardFooter>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}
