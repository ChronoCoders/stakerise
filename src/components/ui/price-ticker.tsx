import React from "react";
import { useTokenPrices } from "@/lib/price-service";
import { TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "./button";
import { toast } from "sonner";

const tokens = [
  { id: "stakerise", symbol: "STR" },
  { id: "bitcoin", symbol: "BTC" },
  { id: "ethereum", symbol: "ETH" },
  { id: "litecoin", symbol: "LTC" },
  { id: "tether", symbol: "USDT" },
  { id: "usd-coin", symbol: "USDC" },
];

const formatPrice = (price: number, symbol: string) => {
  switch (symbol) {
    case "STR":
      return price < 0.01 ? price.toFixed(18) : price.toFixed(8);
    case "ETH":
      return price < 0.01 ? price.toFixed(18) : price.toFixed(8);
    case "BTC":
      return price.toFixed(8);
    case "USDT":
    case "USDC":
      return price.toFixed(6);
    default:
      return price < 0.01 ? price.toFixed(8) : price.toFixed(2);
  }
};

export function PriceTicker() {
  const { prices, isLoading, isError, refresh } = useTokenPrices(
    tokens.map((t) => t.id),
  );

  React.useEffect(() => {
    if (isError) {
      toast.error("Failed to load prices. Retrying...");
    }
  }, [isError]);

  const handleRefresh = () => {
    toast.promise(refresh(), {
      loading: "Refreshing prices...",
      success: "Prices updated successfully",
      error: "Failed to refresh prices",
    });
  };

  if (isLoading) {
    return (
      <div className="h-12 bg-background/80 backdrop-blur-sm border-b flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading prices...</p>
      </div>
    );
  }

  return (
    <div className="h-12 bg-background/80 backdrop-blur-sm border-b">
      <div className="max-w-7xl mx-auto h-full px-4">
        <div className="flex items-center justify-between h-full">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 flex-1">
            {tokens.map(({ id, symbol }) => {
              const price = prices?.[id]?.usd;
              const change = prices?.[id]?.usd_24h_change;
              const isPositive = change && change > 0;

              return (
                <motion.div
                  key={id}
                  className="flex items-center gap-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <span className="font-medium">{symbol}</span>
                  <span className="text-sm">
                    {price ? `$${formatPrice(price, symbol)}` : "---"}
                  </span>
                  {change && (
                    <span
                      className={`flex items-center text-xs ${isPositive ? "text-green-500" : "text-red-500"}`}
                    >
                      {isPositive ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      {Math.abs(change).toFixed(2)}%
                    </span>
                  )}
                </motion.div>
              );
            })}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            className="ml-4 shrink-0"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
