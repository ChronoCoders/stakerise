import React from "react";
import { format } from "date-fns";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { useTokenChart } from "@/lib/price-service";
import { Loader2 } from "lucide-react";

interface PriceChartProps {
  tokenId: string;
  name: string;
  color: string;
}

export function PriceChart({ tokenId, name, color }: PriceChartProps) {
  const { chartData, isLoading, isError } = useTokenChart(tokenId);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="h-[300px] flex items-center justify-center">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading chart data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError || !chartData || chartData.length === 0) {
    return (
      <Card>
        <CardContent className="h-[300px] flex flex-col items-center justify-center gap-2">
          <h3 className="text-lg font-semibold">{name} Price Chart</h3>
          <p className="text-sm text-destructive">Failed to load chart data</p>
        </CardContent>
      </Card>
    );
  }

  const formattedData = chartData.map((point) => ({
    ...point,
    date:
      typeof point.date === "string"
        ? new Date(point.date).getTime()
        : point.date,
    price: Number(point.price),
  }));

  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="text-lg font-semibold mb-4">{name} Price Chart</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={formattedData}>
              <defs>
                <linearGradient
                  id={`gradient-${tokenId}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                type="number"
                domain={["dataMin", "dataMax"]}
                tickFormatter={(timestamp) => format(timestamp, "MMM d")}
                scale="time"
              />
              <YAxis
                tickFormatter={(value) => `$${value.toLocaleString()}`}
                domain={["auto", "auto"]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.5rem",
                }}
                formatter={(value: number) => [
                  `$${value.toLocaleString()}`,
                  "Price",
                ]}
                labelFormatter={(timestamp) =>
                  format(timestamp, "MMM d, yyyy HH:mm")
                }
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke={color}
                fill={`url(#gradient-${tokenId})`}
                isAnimationActive={true}
                animationDuration={1000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
