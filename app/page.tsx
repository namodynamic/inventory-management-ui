"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Box,
  DollarSign,
  Package,
  Tag,
} from "lucide-react";
import { inventoryAPI, logAPI, categoryAPI } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import { InventoryTrendChart } from "@/components/inventory-chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from "recharts";

export default function Dashboard() {
  const { user } = useAuth();
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [logs, setLogs] = useState<InventoryLog[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const [itemsData, logsData, categoriesData] = await Promise.all([
          inventoryAPI.getItems(),
          logAPI.getLogs({ limit: 5 }), // Get only the 5 most recent logs
          categoryAPI.getCategories(),
        ]);

        // Handle different response structures
        setInventoryItems(
          Array.isArray(itemsData) ? itemsData : itemsData.results || []
        );
        setLogs(
          Array.isArray(logsData)
            ? logsData.slice(0, 5)
            : logsData.results || []
        );
        setCategories(
          Array.isArray(categoriesData)
            ? categoriesData
            : categoriesData.results || []
        );
      } catch (err) {
        setError("Failed to fetch dashboard data");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Update the dashboard metrics calculations to handle empty arrays
  const totalItems = Array.isArray(inventoryItems) ? inventoryItems.length : 0;
  const lowStockItems = Array.isArray(inventoryItems)
    ? inventoryItems.filter((item) => item.is_low_stock).length
    : 0;
  const totalValue = Array.isArray(inventoryItems)
    ? inventoryItems.reduce(
        (sum, item) => sum + Number(item.price || 0) * (item.quantity || 0),
        0
      )
    : 0;
  const totalCategories = Array.isArray(inventoryItems)
    ? new Set(inventoryItems.map((item) => item.category)).size
    : 0;

  const lowStockData = inventoryItems
    .filter((item) => item.is_low_stock)
    .slice(0, 5)
    .map((item) => ({
      name: item.name,
      Quantity: item.quantity,
      Threshold: item.low_stock_threshold ?? 10,
    }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-2">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-red-500">
          <AlertTriangle className="h-8 w-8 mx-auto" />
          <p className="mt-2">{error}</p>
          <p className="text-sm text-gray-500 mt-1">
            Please check your API connection
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <h1 className="text-2xl font-bold">
          Welcome, {user?.first_name || user?.username}
        </h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
            <p className="text-xs text-gray-500">
              {inventoryItems.reduce((sum, item) => sum + item.quantity, 0)}{" "}
              units in stock
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Low Stock Items
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockItems}</div>
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
            <CardTitle className="text-sm font-medium">
              Inventory Value
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalValue.toFixed(2)}</div>
            <p className="text-xs text-gray-500">
              Avg. ${totalItems > 0 ? (totalValue / totalItems).toFixed(2) : 0}{" "}
              per item
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Tag className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCategories}</div>
            <p className="text-xs text-gray-500">
              {totalItems > 0 ? (totalItems / totalCategories).toFixed(1) : 0}{" "}
              items per category avg.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <InventoryTrendChart />

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
                    labelStyle={{ fontWeight: "bold" }}
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
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Initial Qty</TableHead>
                <TableHead>Qty Change</TableHead>
                <TableHead>Current Qty</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>User</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">
                    {log.item_name || `Item #${log.item}`}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        log.action === "ADD"
                          ? "bg-green-50 text-green-700 border-green-200"
                          : log.action === "REMOVE"
                          ? "bg-red-50 text-red-700 border-red-200"
                          : "bg-blue-50 text-blue-700 border-blue-200"
                      }
                    >
                      {log.action === "ADD" ? (
                        <ArrowUp className="h-3 w-3 mr-1" />
                      ) : log.action === "REMOVE" ? (
                        <ArrowDown className="h-3 w-3 mr-1" />
                      ) : (
                        <Box className="h-3 w-3 mr-1" />
                      )}
                      {log.action}
                    </Badge>
                  </TableCell>
                  <TableCell>{log.previous_quantity}</TableCell>
                  <TableCell>
                    {log.action === "ADD"
                      ? "+"
                      : log.action === "REMOVE"
                      ? "-"
                      : "±"}
                    {log.quantity_change}
                  </TableCell>
                  <TableCell>{log.new_quantity}</TableCell>
                  <TableCell>
                    {new Date(log.timestamp).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{log.username}</TableCell>
                </TableRow>
              ))}
              {logs.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-4 text-gray-500"
                  >
                    No recent activity
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Inventory by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => {
              const categoryItems = inventoryItems.filter(
                (item) => item.category === category.id
              );
              const categoryValue = categoryItems.reduce(
                (sum, item) => sum + Number(item.price) * item.quantity,
                0
              );

              return (
                <Card key={category.id} className="overflow-hidden">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm">{category.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs text-gray-500">Items</p>
                        <p className="font-medium">{categoryItems.length}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Value</p>
                        <p className="font-medium">
                          ${categoryValue.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Quantity</p>
                        <p className="font-medium">
                          {categoryItems.reduce(
                            (sum, item) => sum + item.quantity,
                            0
                          )}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {categories.length === 0 && (
              <div className="col-span-full text-center py-4 text-gray-500">
                No categories found
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
