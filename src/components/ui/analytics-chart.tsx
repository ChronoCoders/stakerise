import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface AnalyticsData {
  date: string;
  tvl: number;
  apy: number;
  stakes: number;
}

interface AnalyticsChartProps {
  data: AnalyticsData[];
  title: string;
  description?: string;
}

export function AnalyticsChart({
  data,
  title,
  description,
}: AnalyticsChartProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col gap-2 mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="tvlGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="apyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="stakesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ffc658" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#ffc658" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.5rem",
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="tvl"
                stroke="#8884d8"
                fillOpacity={1}
                fill="url(#tvlGradient)"
                name="TVL ($)"
              />
              <Area
                type="monotone"
                dataKey="apy"
                stroke="#82ca9d"
                fillOpacity={1}
                fill="url(#apyGradient)"
                name="APY (%)"
              />
              <Area
                type="monotone"
                dataKey="stakes"
                stroke="#ffc658"
                fillOpacity={1}
                fill="url(#stakesGradient)"
                name="Stakes"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
