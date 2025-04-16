"use client";

import { useState } from "react";
import { AlertTriangle, TrendingUp } from "lucide-react";
import CountUp from "react-countup";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";
import { Button } from "./ui/button";
import {
  LineChart,
  Bar,
  BarChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  LabelList,
} from "recharts";

const chartConfig = {
  available: {
    label: "Available Stock",
    color: "hsl(var(--chart-1))",
  },
  sold: {
    label: "Sold Items",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export const InventoryTrendChart: React.FC<InventoryTrendChartProps> = ({
  trendData,
  currentYearValue,
  currentMonthValue,
}) => {
  const [chartType, setChartType] = useState<"line" | "bar">("line");

  return (
    <Card className="col-span-1">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl font-semibold">
            {chartType === "line" ? (
              "Inventory Trends"
            ) : (
              <CountUp
                start={0}
                end={currentYearValue}
                prefix="$"
                separator=","
                decimals={2}
              />
            )}{" "}
          </CardTitle>
          <CardDescription>
            {chartType === "line" ? (
              <>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <span>Monthly stock level overview:</span>
                  <CountUp
                    start={0}
                    end={currentMonthValue}
                    prefix="$"
                    separator=","
                    decimals={2}
                    className="font-semibold text-primary"
                  />
                </div>
              </>
            ) : (
              `January - December ${new Date().getFullYear()}`
            )}
          </CardDescription>
        </div>
        <div className="flex gap-2">
          <Button
            variant={chartType === "line" ? "default" : "outline"}
            size="sm"
            onClick={() => setChartType("line")}
          >
            Line
          </Button>
          <Button
            variant={chartType === "bar" ? "default" : "outline"}
            size="sm"
            onClick={() => setChartType("bar")}
          >
            Bar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="h-96">
        {chartType === "line" ? (
          <>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={trendData}
                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip labelStyle={{ color: "hsl(var(--chart-6))", fontWeight: "bold" }} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="stock"
                  stroke="hsl(var(--chart-1))"
                  strokeWidth={3}
                  dot={{ r: 5 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
            <CardFooter className="flex items-center gap-2 text-sm text-muted-foreground">
              Trending up by 5.2% this year <TrendingUp className="h-4 w-4" />
            </CardFooter>
          </>
        ) : (
          <>
            <ChartContainer config={chartConfig}>
              <BarChart
                accessibilityLayer
                data={trendData}
                margin={{
                  left: -16,
                  right: 0,
                }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => value.slice(0, 3)}
                />
                <YAxis
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => value.toLocaleString()}
                  domain={[0, "dataMax"]}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar
                  dataKey="available"
                  stackId="a"
                  fill="var(--color-available)"
                  radius={[0, 0, 4, 4]}
                />
                <Bar
                  dataKey="sold"
                  stackId="a"
                  fill="var(--color-sold)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
            <CardFooter className="flex-col items-start gap-2 text-sm">
              <div className="flex gap-2 font-medium leading-none">
                Trending up by 7.3% this month{" "}
                <TrendingUp className="h-4 w-4" />
              </div>
              <div className="leading-none text-muted-foreground">
                Inventory Performance for the year {new Date().getFullYear()}
              </div>
            </CardFooter>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export const LowStockAlertsChart: React.FC<LowStockAlertsProps> = ({
  lowStockData,
}) => {
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Low Stock Alerts
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200 text-xs"
          >
            <AlertTriangle className="h-4 w-4 mr-1" />
            Critical
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {lowStockData.length > 0 ? (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart
              data={lowStockData}
              margin={{ top: 20, right: 30, left: 0, bottom: 10 }}
              barGap={8}
            >
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12 }}
                angle={-10}
                dy={10}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  borderRadius: 8,
                  border: "none",
                }}
                labelStyle={{ color: "hsl(var(--chart-6))", fontWeight: "bold" }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar
                dataKey="Threshold"
                fill="hsl(var(--chart-2))"
                radius={[8, 8, 0, 0]}
                barSize={20}
              >
                <LabelList
                  dataKey="Threshold"
                  position="top"
                  className="fill-muted-foreground text-xs"
                />
              </Bar>
              <Bar
                dataKey="Quantity"
                fill="#EF4444"
                radius={[8, 8, 0, 0]}
                barSize={20}
              >
                <LabelList
                  dataKey="Quantity"
                  position="top"
                  className="fill-white text-xs"
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-4 text-gray-500">
            No low stock items
          </div>
        )}
      </CardContent>
    </Card>
  );
};
