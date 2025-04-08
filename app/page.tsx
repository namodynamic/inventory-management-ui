"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertTriangle, ArrowDown, ArrowUp, Box, DollarSign, Package, Tag } from "lucide-react"
import { inventoryAPI, type InventoryItem, logAPI, type InventoryLog } from "@/lib/api"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

export default function Dashboard() {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
  const [logs, setLogs] = useState<InventoryLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true)
        const [itemsData, logsData] = await Promise.all([inventoryAPI.getItems(), logAPI.getLogs()])
        setInventoryItems(itemsData)
        setLogs(logsData.slice(0, 5)) // Get only the 5 most recent logs
      } catch (err) {
        setError("Failed to fetch dashboard data")
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  // Calculate dashboard metrics
  const totalItems = inventoryItems.length
  const lowStockItems = inventoryItems.filter((item) => item.is_low_stock).length
  const totalValue = inventoryItems.reduce((sum, item) => sum + Number.parseFloat(item.price) * item.quantity, 0)
  const totalCategories = new Set(inventoryItems.map((item) => item.category)).size

  // For demo purposes, let's create some mock data for the chart
  const mockMonthlyData = [
    { month: "Jan", value: 120 },
    { month: "Feb", value: 150 },
    { month: "Mar", value: 180 },
    { month: "Apr", value: 220 },
    { month: "May", value: 270 },
    { month: "Jun", value: 250 },
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-2">Loading dashboard data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-red-500">
          <AlertTriangle className="h-8 w-8 mx-auto" />
          <p className="mt-2">{error}</p>
          <p className="text-sm text-gray-500 mt-1">Please check your API connection</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
            <p className="text-xs text-gray-500">
              {inventoryItems.reduce((sum, item) => sum + item.quantity, 0)} units in stock
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockItems}</div>
            <p className="text-xs text-gray-500">
              {((lowStockItems / totalItems) * 100).toFixed(1)}% of inventory needs reordering
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalValue.toFixed(2)}</div>
            <p className="text-xs text-gray-500">Avg. ${(totalValue / totalItems).toFixed(2)} per item</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Tag className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCategories}</div>
            <p className="text-xs text-gray-500">{(totalItems / totalCategories).toFixed(1)} items per category avg.</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Inventory Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-end gap-2">
              {mockMonthlyData.map((data, i) => (
                <div key={i} className="relative flex-1 flex flex-col items-center">
                  <div className="bg-primary rounded-t w-full" style={{ height: `${(data.value / 300) * 100}%` }}></div>
                  <span className="text-xs mt-1">{data.month}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Low Stock Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            {inventoryItems
              .filter((item) => item.is_low_stock)
              .slice(0, 5)
              .map((item) => (
                <div key={item.id} className="mb-4 last:mb-0 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-gray-500">
                        {item.quantity} / {item.low_stock_threshold}
                      </p>
                      <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                        Low Stock
                      </Badge>
                    </div>
                  </div>
                  <div className="w-24">
                    <Progress
                      value={(item.quantity / item.low_stock_threshold) * 100}
                      className="h-2 bg-red-100"
                      // indicatorClassName="bg-red-500"
                    />
                  </div>
                </div>
              ))}
            {inventoryItems.filter((item) => item.is_low_stock).length === 0 && (
              <div className="text-center py-4 text-gray-500">No low stock items</div>
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
                <TableHead>Quantity</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>User</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">{log.item_name || `Item #${log.item}`}</TableCell>
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
                  <TableCell>
                    {log.action === "ADD" ? "+" : log.action === "REMOVE" ? "-" : "±"}
                    {log.quantity_change}
                  </TableCell>
                  <TableCell>{new Date(log.timestamp).toLocaleDateString()}</TableCell>
                  <TableCell>{log.user_name || `User #${log.user}`}</TableCell>
                </TableRow>
              ))}
              {logs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                    No recent activity
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
