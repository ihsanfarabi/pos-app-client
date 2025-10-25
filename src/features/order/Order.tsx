import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

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

const TAX_RATE = 0.07;

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
    price: 4.25,
    categoryId: "coffee",
  },
  {
    id: "flat-white",
    name: "Flat White",
    price: 5.25,
    categoryId: "coffee",
  },
  {
    id: "cortado",
    name: "Cortado",
    price: 4.75,
    categoryId: "coffee",
  },
  {
    id: "iced-latte",
    name: "Iced Latte",
    price: 5.75,
    categoryId: "coffee",
  },
  {
    id: "mocha",
    name: "Chocolate Mocha",
    price: 5.95,
    categoryId: "coffee",
  },
  {
    id: "matcha",
    name: "Matcha Latte",
    price: 6.0,
    categoryId: "tea",
  },
  {
    id: "chai",
    name: "Dirty Chai",
    price: 5.5,
    categoryId: "tea",
  },
  {
    id: "earl-grey",
    name: "London Fog",
    price: 4.85,
    categoryId: "tea",
  },
  {
    id: "cold-brew",
    name: "Cold Brew",
    price: 5.0,
    categoryId: "tea",
  },
  {
    id: "hibiscus-iced",
    name: "Hibiscus Iced Tea",
    price: 4.5,
    categoryId: "tea",
  },
  {
    id: "croissant",
    name: "Butter Croissant",
    price: 3.5,
    categoryId: "pastries",
  },
  {
    id: "muffin",
    name: "Blueberry Muffin",
    price: 3.75,
    categoryId: "pastries",
  },
  {
    id: "chocolate-chip-cookie",
    name: "Chocolate Chunk Cookie",
    price: 3.25,
    categoryId: "pastries",
  },
  {
    id: "cinnamon-roll",
    name: "Cinnamon Roll",
    price: 4.25,
    categoryId: "pastries",
  },
  {
    id: "bagel",
    name: "Everything Bagel",
    price: 4.0,
    categoryId: "pastries",
  },
  {
    id: "club-sandwich",
    name: "Roasted Turkey Club",
    price: 9.5,
    categoryId: "sandwiches",
  },
  {
    id: "caprese",
    name: "Caprese Ciabatta",
    price: 8.75,
    categoryId: "sandwiches",
  },
  {
    id: "veggie-wrap",
    name: "Grilled Veggie Wrap",
    price: 8.25,
    categoryId: "sandwiches",
  },
  {
    id: "prosciutto-panini",
    name: "Prosciutto Panini",
    price: 10.25,
    categoryId: "sandwiches",
  },
  {
    id: "soup-combo",
    name: "Soup & Half Sandwich",
    price: 10.0,
    categoryId: "specials",
  },
  {
    id: "pumpkin-latte",
    name: "Pumpkin Spice Latte",
    price: 6.25,
    categoryId: "specials",
  },
  {
    id: "citrus-fizz",
    name: "Citrus Espresso Fizz",
    price: 5.9,
    categoryId: "specials",
  },
  {
    id: "tasting-board",
    name: "Chef Tasting Board",
    price: 14.5,
    categoryId: "specials",
  },
  {
    id: "avocado-toast",
    name: "Avocado Toast",
    price: 7.25,
    categoryId: "specials",
  },
  {
    id: "berry-breeze",
    name: "Berry Breeze Smoothie",
    price: 6.5,
    categoryId: "smoothies",
  },
  {
    id: "tropical-sunrise",
    name: "Tropical Sunrise Smoothie",
    price: 6.75,
    categoryId: "smoothies",
  },
  {
    id: "breakfast-burrito",
    name: "Veggie Breakfast Burrito",
    price: 8.95,
    categoryId: "breakfast",
  },
  {
    id: "overnight-oats",
    name: "Maple Overnight Oats",
    price: 5.5,
    categoryId: "breakfast",
  },
  {
    id: "house-blend-beans",
    name: "House Blend Beans (12oz)",
    price: 15.0,
    categoryId: "merch",
  },
  {
    id: "ceramic-mug",
    name: "Signature Ceramic Mug",
    price: 18.0,
    categoryId: "merch",
  },
];

function formatCurrency(amount: number) {
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  });
}

export default function Order() {
  const { state } = useSidebar();
  const isSidebarExpanded = state === "expanded";
  const [activeCategory, setActiveCategory] = useState("");
  const [order, setOrder] = useState<OrderState>({});

  const items = useMemo(
    () =>
      catalogue.filter((product) =>
        activeCategory ? product.categoryId === activeCategory : true
      ),
    [activeCategory]
  );

  const orderItems = useMemo(() => Object.values(order), [order]);

  const subtotal = useMemo(() => {
    return orderItems.reduce(
      (total, current) => total + current.item.price * current.quantity,
      0
    );
  }, [orderItems]);
  const estimatedTax = subtotal * TAX_RATE;
  const totalDue = subtotal + estimatedTax;

  const categoryGridClasses = cn(
    "grid w-full grid-cols-2 gap-2 sm:grid-cols-3",
    isSidebarExpanded ? "lg:grid-cols-3" : "lg:grid-cols-4"
  );

  const catalogueGridClasses = cn(
    "grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3",
    isSidebarExpanded ? "lg:grid-cols-3" : "lg:grid-cols-4"
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

  function handleDecrease(itemId: string) {
    setOrder((previous) => {
      const existing = previous[itemId];
      if (!existing) return previous;

      if (existing.quantity === 1) {
        const updatedState = { ...previous };
        delete updatedState[itemId];
        return updatedState;
      }

      return {
        ...previous,
        [itemId]: {
          ...existing,
          quantity: existing.quantity - 1,
        },
      };
    });
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/20">
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 p-4 pb-8 md:p-6 lg:p-8">
        <div className="grid flex-1 gap-6 lg:grid-cols-[2.5fr_1fr]">
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
                    No items available in this category yet.
                  </CardContent>
                </Card>
              )}
            </div>
          </section>

          <aside className="flex flex-col">
            <Card className="flex h-full flex-col">
              <CardHeader className="flex flex-col gap-1">
                <CardTitle>Order List</CardTitle>
                <CardDescription>
                  Review selections before sending to the bar.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-4 p-0">
                <Separator />
                <div className="flex-1 overflow-y-auto px-6 py-4">
                  {orderItems.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Nothing added yet. Tap catalogue items to build the order.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {orderItems.map(({ item, quantity }) => (
                        <div
                          key={item.id}
                          className="rounded-lg border border-border/80 bg-muted/40 p-4 shadow-sm"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h3 className="text-base font-semibold">
                                {item.name}
                              </h3>
                              <p className="text-xs text-muted-foreground">
                                {formatCurrency(item.price)} ·{" "}
                                {item.categoryId.charAt(0).toUpperCase() +
                                  item.categoryId.slice(1)}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                size="icon"
                                variant="outline"
                                onClick={() => handleDecrease(item.id)}
                                aria-label={`Decrease ${item.name} quantity`}
                              >
                                –
                              </Button>
                              <span className="w-6 text-center text-sm font-medium">
                                {quantity}
                              </span>
                              <Button
                                size="icon"
                                onClick={() => handleAddToOrder(item)}
                                aria-label={`Increase ${item.name} quantity`}
                              >
                                +
                              </Button>
                            </div>
                          </div>
                          <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
                            <span>Line total</span>
                            <span className="font-semibold text-foreground">
                              {formatCurrency(item.price * quantity)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <Separator />
                <div className="space-y-3 px-6 pb-6">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Subtotal</span>
                    <span className="font-medium text-foreground">
                      {formatCurrency(subtotal)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Estimated tax</span>
                    <span className="font-medium text-foreground">
                      {formatCurrency(estimatedTax)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-lg font-semibold text-foreground">
                    <span>Total due</span>
                    <span>{formatCurrency(totalDue)}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t bg-muted/30 p-6">
                <Button
                  className="w-full py-6 text-base font-semibold"
                  disabled={orderItems.length === 0}
                >
                  Send order · {formatCurrency(totalDue)}
                </Button>
              </CardFooter>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}
