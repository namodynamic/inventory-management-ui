import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, AlertTriangle, DollarSign, Tag } from "lucide-react";
import CountUp from "react-countup";
import { Bar, BarChart, Line, LineChart, XAxis } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  inventoryValue: {
    label: "Value",
    color: "hsl(var(--chart-7))",
  },
  totalItems: {
    label: "Quantity",
    color: "hsl(var(--chart-7))",
  },
} satisfies ChartConfig;

export const DashboardMetrics: React.FC<DashboardMetricsProps> = ({
  totalItems,
  inventoryItems,
  lowStockItems,
  totalValue,
  lowStockData,
  totalCategories,
}) => {
  // Limit the number of items for the chart to most recent 10
  const maxItems = 10;
  const limitedInventoryItems = inventoryItems
    .sort(
      (a, b) =>
        new Date(b.last_updated || "").getTime() -
        new Date(a.last_updated || "").getTime() // Sort by most recent
    )
    .slice(0, maxItems);

  // dynamic chart data
  const chartData = limitedInventoryItems.map((item) => ({
    inventoryValue: Number(item.price || 0) * (item.quantity || 0),
    totalItems: item.quantity || 0,
    name: item.name,
  }));

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      
      {/* Total Items Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Items</CardTitle>
          <Package className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            <CountUp start={0} end={totalItems} />
          </div>
          <p className="text-xs text-gray-500">
            {inventoryItems.reduce((sum, item) => sum + item.quantity, 0)} units
            in stock
          </p>
          <ChartContainer config={chartConfig} className="h-[80px] w-full">
            <BarChart data={chartData}>
              <ChartTooltip content={<ChartTooltipContent />} />
              <XAxis dataKey="name" tick={{ fontSize: 6 }} angle={10} dy={10} />
              <Bar
                dataKey="totalItems"
                fill="var(--color-totalItems)"
                radius={4}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Low Stock Items Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
          <AlertTriangle className="h-4 w-4 text-amber-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            <CountUp start={0} end={lowStockItems} />
          </div>
          <p className="text-xs text-gray-500">
            {totalItems > 0
              ? ((lowStockItems / totalItems) * 100).toFixed(1)
              : 0}
            % of inventory needs reordering
          </p>

          <ChartContainer config={chartConfig} className="h-[80px] w-full">
            <LineChart
              data={lowStockData}
              margin={{
                top: 5,
                right: 10,
                left: 10,
                bottom: 0,
              }}
            >
              <Line
                type="monotone"
                strokeWidth={2}
                dataKey="Quantity"
                stroke="#EF4444"
                activeDot={{
                  r: 6,
                }}
              />
              <XAxis dataKey="name" tick={{ fontSize: 6 }} angle={10} dy={10} />
              <ChartTooltip content={<ChartTooltipContent />} />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Total Inventory Value Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">
            Total Inventory Value
          </CardTitle>
          <DollarSign className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            <CountUp
              start={0}
              prefix="$"
              end={totalValue}
              separator=","
              decimals={2}
              decimal="."
            />
          </div>
          <p className="text-xs text-gray-500">
            Avg. ${totalItems > 0 ? (totalValue / totalItems).toFixed(2) : 0}{" "}
            per item
          </p>
          <ChartContainer config={chartConfig} className="h-[80px] w-full">
            <LineChart
              data={chartData}
              margin={{
                top: 5,
                right: 10,
                left: 10,
                bottom: 0,
              }}
            >
              <Line
                type="monotone"
                strokeWidth={2}
                dataKey="inventoryValue"
                stroke="var(--color-inventoryValue)"
                activeDot={{
                  r: 6,
                }}
              />
              <XAxis dataKey="name" tick={{ fontSize: 6 }} angle={10} dy={10} />
              <ChartTooltip content={<ChartTooltipContent />} />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Total Categories Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Categories</CardTitle>
          <Tag className="h-4 w-4 text-purple-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            <CountUp start={0} end={totalCategories} />
          </div>
          <p className="text-xs text-gray-500">
            {totalItems > 0 ? (totalItems / totalCategories).toFixed(1) : 0}{" "}
            items per category avg.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
