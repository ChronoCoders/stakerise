import React from "react";
import { Card, CardContent } from "./card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./tabs";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { format } from "date-fns";

interface PortfolioData {
  totalValue: number;
  totalRewards: number;
  averageAPY: number;
  distribution: {
    token: string;
    value: number;
    color: string;
  }[];
  performance: {
    date: string;
    value: number;
    rewards: number;
  }[];
}

const SAMPLE_DATA: PortfolioData = {
  totalValue: 25000,
  totalRewards: 1250,
  averageAPY: 12.5,
  distribution: [
    { token: "STR", value: 10000, color: "#8884d8" },
    { token: "BTC", value: 8000, color: "#f7931a" },
    { token: "ETH", value: 7000, color: "#627eea" },
  ],
  performance: Array.from({ length: 30 }, (_, i) => ({
    date: format(new Date(2025, 2, i + 1), "MMM dd"),
    value: 20000 + Math.random() * 10000,
    rewards: 1000 + Math.random() * 500,
  })),
};

export function PortfolioAnalytics() {
  return (
    <Card>
      <CardContent className="pt-6">
        <h2 className="text-lg font-semibold mb-6">Portfolio Analytics</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-lg bg-muted/50">
            <p className="text-sm text-muted-foreground mb-1">
              Total Value Staked
            </p>
            <p className="text-2xl font-semibold">
              ${SAMPLE_DATA.totalValue.toLocaleString()}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-muted/50">
            <p className="text-sm text-muted-foreground mb-1">Total Rewards</p>
            <p className="text-2xl font-semibold">
              ${SAMPLE_DATA.totalRewards.toLocaleString()}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-muted/50">
            <p className="text-sm text-muted-foreground mb-1">Average APY</p>
            <p className="text-2xl font-semibold">{SAMPLE_DATA.averageAPY}%</p>
          </div>
        </div>

        <Tabs defaultValue="performance" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="distribution">Distribution</TabsTrigger>
          </TabsList>

          <TabsContent value="performance" className="mt-4">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={SAMPLE_DATA.performance}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient
                      id="colorRewards"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-muted"
                  />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.5rem",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#8884d8"
                    fillOpacity={1}
                    fill="url(#colorValue)"
                    name="Portfolio Value"
                  />
                  <Area
                    type="monotone"
                    dataKey="rewards"
                    stroke="#82ca9d"
                    fillOpacity={1}
                    fill="url(#colorRewards)"
                    name="Rewards"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="distribution" className="mt-4">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={SAMPLE_DATA.distribution}
                    dataKey="value"
                    nameKey="token"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ token, value }) =>
                      `${token} (${((value / SAMPLE_DATA.totalValue) * 100).toFixed(1)}%)`
                    }
                  >
                    {SAMPLE_DATA.distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.5rem",
                    }}
                    formatter={(value: number) => [
                      `$${value.toLocaleString()}`,
                      "Value",
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
