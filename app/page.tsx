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
import { AlertTriangle, ArrowDown, ArrowUp, Box } from "lucide-react";
import { inventoryAPI, logAPI, categoryAPI } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import {
  InventoryTrendChart,
  LowStockAlertsChart,
} from "@/components/inventory-charts";
import { DashboardMetrics } from "@/components/dashboard-metrics";
import { InventoryByCategory } from "@/components/inventory-category-card";

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

      <DashboardMetrics
        totalItems={totalItems}
        inventoryItems={inventoryItems}
        lowStockItems={lowStockItems}
        totalValue={totalValue}
        totalCategories={totalCategories}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <InventoryTrendChart />

        <LowStockAlertsChart lowStockData={lowStockData} />
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

      <InventoryByCategory
        categories={categories}
        inventoryItems={inventoryItems}
      />
    </div>
  );
}
