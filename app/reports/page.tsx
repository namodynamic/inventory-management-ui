"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Download } from "lucide-react"
import { inventoryAPI, type InventoryItem, categoryAPI, type Category } from "@/lib/api"
import { DateRangePicker } from "@/components/date-range-picker"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function ReportsPage() {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reportType, setReportType] = useState<string>("inventory-value")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined
    to: Date | undefined
  }>({
    from: undefined,
    to: undefined,
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const [itemsData, categoriesData] = await Promise.all([inventoryAPI.getItems(), categoryAPI.getCategories()])
        setInventoryItems(itemsData)
        setCategories(categoriesData)
      } catch (err) {
        setError("Failed to fetch data for reports")
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Filter items based on category filter
  const filteredItems = inventoryItems.filter((item) => {
    return categoryFilter === "all" || item.category?.toString() === categoryFilter
  })

  // Generate report data based on report type
  const generateReportData = () => {
    switch (reportType) {
      case "inventory-value":
        return filteredItems.map((item) => ({
          id: item.id,
          name: item.name,
          sku: item.sku,
          quantity: item.quantity,
          price: Number.parseFloat(item.price),
          value: item.quantity * Number.parseFloat(item.price),
          category: categories.find((c) => c.id === item.category)?.name || "-",
        }))
      case "low-stock":
        return filteredItems
          .filter((item) => item.is_low_stock)
          .map((item) => ({
            id: item.id,
            name: item.name,
            sku: item.sku,
            quantity: item.quantity,
            threshold: item.low_stock_threshold,
            needed: item.low_stock_threshold - item.quantity,
            category: categories.find((c) => c.id === item.category)?.name || "-",
          }))
      case "category-summary":
        const categorySummary: Record<string, { count: number; totalValue: number; avgPrice: number }> = {}

        filteredItems.forEach((item) => {
          const categoryName = categories.find((c) => c.id === item.category)?.name || "Uncategorized"

          if (!categorySummary[categoryName]) {
            categorySummary[categoryName] = {
              count: 0,
              totalValue: 0,
              avgPrice: 0,
            }
          }

          categorySummary[categoryName].count += 1
          categorySummary[categoryName].totalValue += item.quantity * Number.parseFloat(item.price)
        })

        // Calculate average price
        Object.keys(categorySummary).forEach((key) => {
          categorySummary[key].avgPrice = categorySummary[key].totalValue / categorySummary[key].count
        })

        return Object.entries(categorySummary).map(([category, data]) => ({
          category,
          itemCount: data.count,
          totalValue: data.totalValue,
          avgPrice: data.avgPrice,
        }))
      default:
        return []
    }
  }

  const reportData = generateReportData()

  // Calculate totals for inventory value report
  const calculateTotals = () => {
    if (reportType === "inventory-value") {
      return {
        totalItems: reportData.length,
        totalQuantity: reportData.reduce((sum, item) => sum + item.quantity, 0),
        totalValue: reportData.reduce((sum, item) => sum + item.value, 0),
      }
    }
    if (reportType === "low-stock") {
      return {
        totalItems: reportData.length,
        totalNeeded: reportData.reduce((sum, item) => sum + item.needed, 0),
      }
    }
    if (reportType === "category-summary") {
      return {
        totalCategories: reportData.length,
        totalItems: reportData.reduce((sum, item) => sum + item.itemCount, 0),
        totalValue: reportData.reduce((sum, item) => sum + item.totalValue, 0),
      }
    }
    return {}
  }

  const totals = calculateTotals()

  // Function to export report as CSV
  const exportReportCSV = () => {
    let csvContent = ""

    // Add headers
    if (reportType === "inventory-value") {
      csvContent = "ID,Name,SKU,Category,Quantity,Price,Total Value\n"
      reportData.forEach((item) => {
        csvContent += `${item.id},"${item.name}",${item.sku || ""},"${item.category}",${item.quantity},${item.price.toFixed(2)},${item.value.toFixed(2)}\n`
      })
    } else if (reportType === "low-stock") {
      csvContent = "ID,Name,SKU,Category,Current Quantity,Threshold,Needed\n"
      reportData.forEach((item) => {
        csvContent += `${item.id},"${item.name}",${item.sku || ""},"${item.category}",${item.quantity},${item.threshold},${item.needed}\n`
      })
    } else if (reportType === "category-summary") {
      csvContent = "Category,Item Count,Total Value,Average Price\n"
      reportData.forEach((item) => {
        csvContent += `"${item.category}",${item.itemCount},${item.totalValue.toFixed(2)},${item.avgPrice.toFixed(2)}\n`
      })
    }

    // Create and download the file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `${reportType}-report.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-2">Loading report data...</p>
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
      <Card>
        <CardHeader>
          <CardTitle>Generate Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="space-y-2">
              <Label htmlFor="report-type">Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger id="report-type">
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inventory-value">Inventory Value</SelectItem>
                  <SelectItem value="low-stock">Low Stock Items</SelectItem>
                  <SelectItem value="category-summary">Category Summary</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category-filter">Category</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger id="category-filter">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date-range">Date Range (Optional)</Label>
              <DateRangePicker date={dateRange} onDateChange={setDateRange} />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={exportReportCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {reportType === "inventory-value"
              ? "Inventory Value Report"
              : reportType === "low-stock"
                ? "Low Stock Items Report"
                : "Category Summary Report"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {reportType === "inventory-value" && (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Total Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.length > 0 ? (
                    reportData.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.sku || "-"}</TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                        <TableCell className="text-right">${item.value.toFixed(2)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        No items found for this report.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              {reportData.length > 0 && (
                <div className="mt-4 flex justify-end">
                  <div className="space-y-1 text-right">
                    <p className="text-sm text-gray-500">Total Items: {totals.totalItems}</p>
                    <p className="text-sm text-gray-500">Total Quantity: {totals.totalQuantity}</p>
                    <p className="text-base font-medium">Total Value: ${totals.totalValue.toFixed(2)}</p>
                  </div>
                </div>
              )}
            </>
          )}

          {reportType === "low-stock" && (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Current Quantity</TableHead>
                    <TableHead className="text-right">Threshold</TableHead>
                    <TableHead className="text-right">Needed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.length > 0 ? (
                    reportData.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.sku || "-"}</TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">{item.threshold}</TableCell>
                        <TableCell className="text-right">{item.needed}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        No low stock items found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              {reportData.length > 0 && (
                <div className="mt-4 flex justify-end">
                  <div className="space-y-1 text-right">
                    <p className="text-sm text-gray-500">Total Low Stock Items: {totals.totalItems}</p>
                    <p className="text-base font-medium">Total Units Needed: {totals.totalNeeded}</p>
                  </div>
                </div>
              )}
            </>
          )}

          {reportType === "category-summary" && (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Item Count</TableHead>
                    <TableHead className="text-right">Total Value</TableHead>
                    <TableHead className="text-right">Average Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.length > 0 ? (
                    reportData.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.category}</TableCell>
                        <TableCell className="text-right">{item.itemCount}</TableCell>
                        <TableCell className="text-right">${item.totalValue.toFixed(2)}</TableCell>
                        <TableCell className="text-right">${item.avgPrice.toFixed(2)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                        No categories found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              {reportData.length > 0 && (
                <div className="mt-4 flex justify-end">
                  <div className="space-y-1 text-right">
                    <p className="text-sm text-gray-500">Total Categories: {totals.totalCategories}</p>
                    <p className="text-sm text-gray-500">Total Items: {totals.totalItems}</p>
                    <p className="text-base font-medium">Total Value: ${totals.totalValue.toFixed(2)}</p>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
