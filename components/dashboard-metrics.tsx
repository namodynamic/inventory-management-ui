import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, AlertTriangle, DollarSign, Tag } from "lucide-react";
import CountUp from "react-countup";


export const DashboardMetrics: React.FC<DashboardMetricsProps> = ({
  totalItems,
  inventoryItems,
  lowStockItems,
  totalValue,
  totalCategories,
}) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
        </CardContent>
      </Card>
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
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Inventory Value</CardTitle>
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
            Avg. $
            {totalItems > 0 ? (totalValue / totalItems).toFixed(2) : 0} per item
          </p>
        </CardContent>
      </Card>
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
            {totalItems > 0
              ? (totalItems / totalCategories).toFixed(1)
              : 0}{" "}
            items per category avg.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};