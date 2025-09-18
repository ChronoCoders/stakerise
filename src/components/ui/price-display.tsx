import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useTokenPrices } from "@/lib/price-service";

interface PriceDisplayProps {
  tokenId: string;
  symbol: string;
}

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

export function PriceDisplay({ tokenId, symbol }: PriceDisplayProps) {
  const { prices, isLoading, isError } = useTokenPrices([tokenId]);

  if (isLoading)
    return <span className="text-muted-foreground">Loading...</span>;
  if (isError)
    return <span className="text-destructive">Error loading price</span>;

  const priceData = prices?.[tokenId];
  const price = priceData?.usd;
  const change = priceData?.usd_24h_change;
  const isPositive = change && change > 0;

  if (!price) return <span className="text-muted-foreground">N/A</span>;

  return (
    <div className="flex items-center gap-2">
      <span className="font-medium">${formatPrice(price, symbol)}</span>
      {change !== undefined && (
        <span
          className={`flex items-center text-sm ${isPositive ? "text-green-500" : "text-red-500"}`}
        >
          {isPositive ? (
            <TrendingUp className="w-4 h-4" />
          ) : (
            <TrendingDown className="w-4 h-4" />
          )}
          {Math.abs(change).toFixed(2)}%
        </span>
      )}
    </div>
  );
}
