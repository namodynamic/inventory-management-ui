"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AlertTriangle, Edit, MoreHorizontal, Plus, Search, Trash2 } from "lucide-react"
import { inventoryAPI, supplierAPI, itemSupplierAPI } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {toast} from "react-hot-toast"


export default function InventorySuppliersPage() {
  const [itemSuppliers, setItemSuppliers] = useState<InventoryItemSupplier[]>([])
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [itemFilter, setItemFilter] = useState("all")
  const [supplierFilter, setSupplierFilter] = useState<string>("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedInventorySupplier, setSelectedInventorySupplier] = useState<InventoryItemSupplier | null>(null)
  const [newInventorySupplier, setNewInventorySupplier] = useState({
    item: "",
    supplier: "",
    supplier_sku: "",
    supplier_price: "",
    lead_time_days: "",
    notes: "",
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const [itemSuppliersData, itemsData, suppliersData] = await Promise.all([
          itemSupplierAPI.getItemSuppliers(),
          inventoryAPI.getItems(),
          supplierAPI.getSuppliers(),
        ])

        setItemSuppliers(Array.isArray(itemSuppliersData.results) ? itemSuppliersData.results : [])
        setInventoryItems(Array.isArray(itemsData.results) ? itemsData.results : [])
        setSuppliers(Array.isArray(suppliersData.results) ? suppliersData.results : [])

      } catch (err) {
        setError("Failed to fetch inventory supplier data")
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredInventorySuppliers = Array.isArray(itemSuppliers)
    ? itemSuppliers.filter((itemSupplier) => {
        const item = inventoryItems.find((i) => i.id === itemSupplier.item)
        const supplier = suppliers.find((s) => s.id === itemSupplier.supplier)

        // Apply search filter
        const matchesSearch =
          searchQuery === "" ||
          (item && item.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (supplier && supplier.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (itemSupplier.supplier_sku &&
            itemSupplier.supplier_sku.toLowerCase().includes(searchQuery.toLowerCase()))

        // Apply item filter
        const matchesItem = itemFilter === "all" || itemSupplier.item.toString() === itemFilter

        // Apply supplier filter
        const matchesSupplier = supplierFilter === "all" || itemSupplier.supplier.toString() === supplierFilter

        return matchesSearch && matchesItem && matchesSupplier
      })
    : []

  const handleAddInventorySupplier = async () => {
    try {
      const data = {
        id: 0,
        item: Number(newInventorySupplier.item),
        supplier: Number(newInventorySupplier.supplier),
        supplier_sku: newInventorySupplier.supplier_sku,
        supplier_price: newInventorySupplier.supplier_price,
        lead_time_days: newInventorySupplier.lead_time_days ? Number(newInventorySupplier.lead_time_days) : null,
        notes: newInventorySupplier.notes,
      }
      await itemSupplierAPI.createItemSupplier(data)
      const updatedInventorySuppliers = await itemSupplierAPI.getItemSuppliers()
      setItemSuppliers(Array.isArray(updatedInventorySuppliers.results) ? updatedInventorySuppliers.results : [])
      setIsAddDialogOpen(false)
      setNewInventorySupplier({
        item: "",
        supplier: "",
        supplier_sku: "",
        supplier_price: "",
        lead_time_days: "",
        notes: "",
      })
      toast.success("Inventory supplier added successfully")
    } catch (err) {
      console.error("Failed to add inventory supplier:", err)
      toast.error("Failed to add inventory supplier")
    }
  }

  const handleEditInventorySupplier = async () => {
    if (!selectedInventorySupplier) return

    try {
      const data = {
        id: selectedInventorySupplier.id,
        item: Number(newInventorySupplier.item),
        supplier: Number(newInventorySupplier.supplier),
        supplier_sku: newInventorySupplier.supplier_sku,
        supplier_price: newInventorySupplier.supplier_price,
        lead_time_days: newInventorySupplier.lead_time_days ? Number(newInventorySupplier.lead_time_days) : null,
        notes: newInventorySupplier.notes,
      }

      await itemSupplierAPI.updateItemSupplier(selectedInventorySupplier.id, data)
      const updatedInventorySuppliers = await itemSupplierAPI.getItemSuppliers()
      setItemSuppliers(Array.isArray(updatedInventorySuppliers.results) ? updatedInventorySuppliers.results : [])
      setIsEditDialogOpen(false)
      setSelectedInventorySupplier(null)
      setNewInventorySupplier({
        item: "",
        supplier: "",
        supplier_sku: "",
        supplier_price: "",
        lead_time_days: "",
        notes: "",
      })
      toast.success("Inventory supplier updated successfully")
    } catch (err) {
      console.error("Failed to update inventory supplier:", err)
      toast.error("Failed to update inventory supplier")
    }
  }

  const handleDeleteInventorySupplier = async () => {
    if (!selectedInventorySupplier) return

    try {
      await itemSupplierAPI.deleteItemSupplier(selectedInventorySupplier.id)
      const updatedInventorySuppliers = await itemSupplierAPI.getItemSuppliers()
      setItemSuppliers(Array.isArray(updatedInventorySuppliers.results) ? updatedInventorySuppliers.results : [])
      setIsDeleteDialogOpen(false)
      setSelectedInventorySupplier(null)

      toast.success("Inventory supplier deleted successfully")
    } catch (err) {
      console.error("Failed to delete inventory supplier:", err)
      toast.error("Failed to delete inventory supplier")
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-2">Loading inventory supplier data...</p>
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
            placeholder="Search inventory suppliers..."
            className="pl-8 w-full sm:w-[300px]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Inventory Supplier
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inventory Suppliers</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 gap-4">
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <div className="flex items-center gap-2">
                <Label htmlFor="item-filter" className="whitespace-nowrap">
                  Item:
                </Label>
                <Select value={itemFilter} onValueChange={setItemFilter}>
                  <SelectTrigger id="item-filter" className="w-[180px]">
                    <SelectValue placeholder="All Items" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Items</SelectItem>
                    {inventoryItems.map((item) => (
                      <SelectItem key={item.id} value={item.id.toString()}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Label htmlFor="supplier-filter" className="whitespace-nowrap">
                  Supplier:
                </Label>
                <Select value={supplierFilter} onValueChange={setSupplierFilter}>
                  <SelectTrigger id="supplier-filter" className="w-[180px]">
                    <SelectValue placeholder="All Suppliers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Suppliers</SelectItem>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id.toString()}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Supplier SKU</TableHead>
                <TableHead>Supplier Price</TableHead>
                <TableHead>Lead Time (Days)</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInventorySuppliers.length > 0 ? (
                filteredInventorySuppliers.map((inventorySupplier) => {
                  const item = inventoryItems.find((i) => i.id === inventorySupplier.item)
                  const supplier = suppliers.find((s) => s.id === inventorySupplier.supplier)
                  return (
                    <TableRow key={inventorySupplier.id}>
                      <TableCell className="font-medium">
                        {item ? item.name : `${inventorySupplier.item}`}
                      </TableCell>
                      <TableCell>{supplier ? supplier.name : `${inventorySupplier.supplier_name}`}</TableCell>
                      <TableCell>{inventorySupplier.supplier_sku || "-"}</TableCell>
                      <TableCell>${inventorySupplier.supplier_price}</TableCell>
                      <TableCell>{inventorySupplier.lead_time_days || "-"}</TableCell>
                      <TableCell>{inventorySupplier.notes || "-"}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedInventorySupplier(inventorySupplier)
                                setNewInventorySupplier({
                                  item: inventorySupplier.item.toString(),
                                  supplier: inventorySupplier.supplier.toString(),
                                  supplier_sku: inventorySupplier.supplier_sku || "",
                                  supplier_price: inventorySupplier.supplier_price,
                                  lead_time_days: inventorySupplier.lead_time_days?.toString() || "",
                                  notes: inventorySupplier.notes || "",
                                })
                                setIsEditDialogOpen(true)
                              }}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => {
                                setSelectedInventorySupplier(inventorySupplier)
                                setIsDeleteDialogOpen(true)
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    No inventory suppliers found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Inventory Supplier Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add Inventory Supplier</DialogTitle>
            <DialogDescription>Link an inventory item with a supplier.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="item">Item</Label>
                <Select
                  value={newInventorySupplier.item}
                  onValueChange={(value) => setNewInventorySupplier({ ...newInventorySupplier, item: value })}
                >
                  <SelectTrigger id="item">
                    <SelectValue placeholder="Select an item" />
                  </SelectTrigger>
                  <SelectContent>
                    {inventoryItems.map((item) => (
                      <SelectItem key={item.id} value={item.id.toString()}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="supplier">Supplier</Label>
                <Select
                  value={newInventorySupplier.supplier}
                  onValueChange={(value) => setNewInventorySupplier({ ...newInventorySupplier, supplier: value })}
                >
                  <SelectTrigger id="supplier">
                    <SelectValue placeholder="Select a supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id.toString()}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="supplier_sku">Supplier SKU</Label>
                <Input
                  id="supplier_sku"
                  value={newInventorySupplier.supplier_sku}
                  onChange={(e) => setNewInventorySupplier({ ...newInventorySupplier, supplier_sku: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supplier_price">Supplier Price ($)</Label>
                <Input
                  id="supplier_price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={newInventorySupplier.supplier_price}
                  onChange={(e) => setNewInventorySupplier({ ...newInventorySupplier, supplier_price: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="lead_time_days">Lead Time (Days)</Label>
              <Input
                id="lead_time_days"
                type="number"
                min="0"
                value={newInventorySupplier.lead_time_days}
                onChange={(e) => setNewInventorySupplier({ ...newInventorySupplier, lead_time_days: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                value={newInventorySupplier.notes}
                onChange={(e) => setNewInventorySupplier({ ...newInventorySupplier, notes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddInventorySupplier}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Inventory Supplier Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Inventory Supplier</DialogTitle>
            <DialogDescription>Update the supplier information for this inventory item.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-item">Item</Label>
                <Select
                  value={newInventorySupplier.item}
                  onValueChange={(value) => setNewInventorySupplier({ ...newInventorySupplier, item: value })}
                >
                  <SelectTrigger id="edit-item">
                    <SelectValue placeholder="Select an item" />
                  </SelectTrigger>
                  <SelectContent>
                    {inventoryItems.map((item) => (
                      <SelectItem key={item.id} value={item.id.toString()}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-supplier">Supplier</Label>
                <Select
                  value={newInventorySupplier.supplier}
                  onValueChange={(value) => setNewInventorySupplier({ ...newInventorySupplier, supplier: value })}
                >
                  <SelectTrigger id="edit-supplier">
                    <SelectValue placeholder="Select a supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id.toString()}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-supplier_sku">Supplier SKU</Label>
                <Input
                  id="edit-supplier_sku"
                  value={newInventorySupplier.supplier_sku}
                  onChange={(e) => setNewInventorySupplier({ ...newInventorySupplier, supplier_sku: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-supplier_price">Supplier Price ($)</Label>
                <Input
                  id="edit-supplier_price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={newInventorySupplier.supplier_price}
                  onChange={(e) => setNewInventorySupplier({ ...newInventorySupplier, supplier_price: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-lead_time_days">Lead Time (Days)</Label>
              <Input
                id="edit-lead_time_days"
                type="number"
                min="0"
                value={newInventorySupplier.lead_time_days}
                onChange={(e) => setNewInventorySupplier({ ...newInventorySupplier, lead_time_days: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-notes">Notes</Label>
              <Input
                id="edit-notes"
                value={newInventorySupplier.notes}
                onChange={(e) => setNewInventorySupplier({ ...newInventorySupplier, notes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditInventorySupplier}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this inventory supplier relationship? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteInventorySupplier}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
