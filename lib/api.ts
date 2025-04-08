// Base API URL - replace with your actual API URL
const API_BASE_URL = "http://localhost:8000/api/inventory/"

// Helper function for making API requests
async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || "An error occurred while fetching data")
  }

  return response.json()
}

// API functions for inventory items
export const inventoryAPI = {
  getItems: (params = {}) => fetchAPI("/items/"),
  getItem: (id: number) => fetchAPI(`/items/${id}/`),
  createItem: (data: any) =>
    fetchAPI("/items/", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateItem: (id: number, data: any) =>
    fetchAPI(`/items/${id}/`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteItem: (id: number) =>
    fetchAPI(`/items/${id}/`, {
      method: "DELETE",
    }),
}

// API functions for categories
export const categoryAPI = {
  getCategories: () => fetchAPI("/categories/"),
  getCategory: (id: number) => fetchAPI(`/categories/${id}/`),
  createCategory: (data: any) =>
    fetchAPI("/categories/", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateCategory: (id: number, data: any) =>
    fetchAPI(`/categories/${id}/`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteCategory: (id: number) =>
    fetchAPI(`/categories/${id}/`, {
      method: "DELETE",
    }),
}

// API functions for suppliers
export const supplierAPI = {
  getSuppliers: () => fetchAPI("/suppliers/"),
  getSupplier: (id: number) => fetchAPI(`/suppliers/${id}/`),
  createSupplier: (data: any) =>
    fetchAPI("/suppliers/", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateSupplier: (id: number, data: any) =>
    fetchAPI(`/suppliers/${id}/`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteSupplier: (id: number) =>
    fetchAPI(`/suppliers/${id}/`, {
      method: "DELETE",
    }),
}

// API functions for inventory logs
export const logAPI = {
  getLogs: () => fetchAPI("/logs/"),
}

// Types based on Django models
export interface Category {
  id: number
  name: string
  description: string | null
  created_at: string
  updated_at: string
}

export interface InventoryItem {
  id: number
  name: string
  description: string | null
  quantity: number
  price: string
  category: number | null
  category_name?: string
  owner: number | null
  sku: string | null
  location: string | null
  low_stock_threshold: number
  date_added: string
  last_updated: string
  is_low_stock: boolean
}

export interface Supplier {
  id: number
  name: string
  contact_name: string | null
  email: string | null
  phone: string | null
  address: string | null
  owner: number
  created_at: string
  updated_at: string
}

export interface InventoryLog {
  id: number
  item: number
  item_name?: string
  user: number | null
  user_name?: string
  action: "ADD" | "REMOVE" | "UPDATE"
  quantity_change: number
  previous_quantity: number
  new_quantity: number
  timestamp: string
  notes: string | null
}

export interface InventoryItemSupplier {
  id: number
  item: number
  supplier: number
  supplier_name?: string
  supplier_sku: string | null
  supplier_price: string
  lead_time_days: number | null
  notes: string | null
}
