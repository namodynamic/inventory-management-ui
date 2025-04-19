"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle, ArrowDown, ArrowUp, Box, Search } from "lucide-react"
import { logAPI} from "@/lib/api"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { DateRangePicker } from "@/components/date-range-picker"

export default function LogsPage() {
  const [logs, setLogs] = useState<InventoryLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [actionFilter, setActionFilter] = useState<string>("all")
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined
    to: Date | undefined
  }>({
    from: undefined,
    to: undefined,
  })

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setIsLoading(true)
        const data = await logAPI.getLogs()
        // Ensure data is an array
        setLogs(Array.isArray(data.results) ? data.results : [])
      } catch (err) {
        setError("Failed to fetch logs")
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchLogs()
  }, [])


  // Filter logs based on search query, action filter, and date range
  const filteredLogs = Array.isArray(logs) 
    ? logs.filter((log) => {
        // Apply search filter
        const matchesSearch =
          searchQuery === "" ||
          (log.item_name && log.item_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (log.username && log.username.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (log.notes && log.notes.toLowerCase().includes(searchQuery.toLowerCase()))

        // Apply action filter
        const matchesAction = actionFilter === "all" || log.action === actionFilter

        // Apply date range filter
        const logDate = new Date(log.timestamp)
        const matchesDateRange =
          (!dateRange.from || logDate >= dateRange.from) && (!dateRange.to || logDate <= dateRange.to)

        return matchesSearch && matchesAction && matchesDateRange
      })
    : []

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-2">Loading logs...</p>
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
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center w-full sm:w-auto relative">
          <Search className="absolute left-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search logs..."
            className="pl-8 w-full sm:w-[300px]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="action-filter" className="whitespace-nowrap">
                Action:
              </Label>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger id="action-filter" className="w-[150px]">
                  <SelectValue placeholder="All Actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="ADD">Added</SelectItem>
                  <SelectItem value="REMOVE">Removed</SelectItem>
                  <SelectItem value="UPDATE">Updated</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="date-range" className="whitespace-nowrap">
                Date Range:
              </Label>
              <DateRangePicker date={dateRange} onDateChange={(date) => setDateRange({ from: date.from, to: date.to })} />
            </div>
            <div className="ml-auto">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("")
                  setActionFilter("all")
                  setDateRange({ from: undefined, to: undefined })
                }}
              >
                Reset Filters
              </Button>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date & Time</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Qty Change</TableHead>
                <TableHead>New Qty</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                    <TableCell>{log.item_name || `Item #${log.item}`}</TableCell>
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
                    <TableCell>{log.username || "-"}</TableCell>
                    <TableCell>
                      {log.action === "ADD" ? "+" : log.action === "REMOVE" ? "-" : "±"}
                      {log.quantity_change}
                    </TableCell>
                    <TableCell>{log.new_quantity}</TableCell>
                    <TableCell>{log.notes || "-"}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    No logs found.
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
