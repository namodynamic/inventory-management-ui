// Base API URL - replace with your actual API URL
const API_BASE_URL = "http://localhost:8000/api"

// Helper function for making API requests
async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`

  // Get auth token from localStorage
  const tokensStr = typeof window !== "undefined" ? localStorage.getItem("auth_tokens") : null
  const tokens = tokensStr ? JSON.parse(tokensStr) : null

  const headers = {
    "Content-Type": "application/json",
    ...(tokens?.access ? { Authorization: `Bearer ${tokens.access}` } : {}),
    ...options.headers,
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  if (!response.ok) {
    // Handle 401 Unauthorized by redirecting to login
    if (response.status === 401 && typeof window !== "undefined") {
      // Try to refresh the token if we have a refresh token
      if (tokens?.refresh) {
        try {
          const refreshResponse = await fetch(`${API_BASE_URL}/token/refresh/`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ refresh: tokens.refresh }),
          })

          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json()
            // Update the tokens in localStorage
            localStorage.setItem(
              "auth_tokens",
              JSON.stringify({
                access: refreshData.access,
                refresh: tokens.refresh,
              }),
            )

            // Retry the original request with the new token
            const retryHeaders = {
              "Content-Type": "application/json",
              Authorization: `Bearer ${refreshData.access}`,
              ...options.headers,
            }

            const retryResponse = await fetch(url, {
              ...options,
              headers: retryHeaders,
            })

            if (retryResponse.ok) {
              return retryResponse.json()
            }
          }
        } catch (error) {
          console.error("Token refresh failed:", error)
        }
      }

      // If refresh failed or we don't have a refresh token, redirect to login
      localStorage.removeItem("auth_tokens")
      window.location.href = "/login"
      throw new Error("Session expired. Please login again.")
    }

    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || error.detail || "An error occurred while fetching data")
  }

  return response.json()
}

// API functions for inventory items
export const inventoryAPI = {
  getItems: (params = {}) => {
    const queryParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      queryParams.append(key, String(value))
    })
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : ""
    return fetchAPI(`/inventory/items/${queryString}`)
  },
  getItem: (id: number) => fetchAPI(`/inventory/items/${id}/`),
  createItem: (data: any) =>
    fetchAPI("/inventory/items/", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateItem: (id: number, data: any) =>
    fetchAPI(`/inventory/items/${id}/`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteItem: (id: number) =>
    fetchAPI(`/inventory/items/${id}/`, {
      method: "DELETE",
    }),
  adjustQuantity: (id: number, data: { quantity_change: number; notes?: string }) =>
    fetchAPI(`/inventory/items/${id}/adjust_quantity/`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getItemLevel: (id: number) => fetchAPI(`/inventory/items/${id}/level/`),
  getAllLevels: () => fetchAPI(`/inventory/items/level/`),
}

// API functions for categories
export const categoryAPI = {
  getCategories: (search?: string) => {
    const queryString = search ? `?search=${encodeURIComponent(search)}` : ""
    return fetchAPI(`/inventory/categories/${queryString}`)
  },
  getCategory: (id: number) => fetchAPI(`/inventory/categories/${id}/`),
  createCategory: (data: any) =>
    fetchAPI("/inventory/categories/", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateCategory: (id: number, data: any) =>
    fetchAPI(`/inventory/categories/${id}/`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteCategory: (id: number) =>
    fetchAPI(`/inventory/categories/${id}/`, {
      method: "DELETE",
    }),
}

// API functions for suppliers
export const supplierAPI = {
  getSuppliers: (search?: string) => {
    const queryString = search ? `?search=${encodeURIComponent(search)}` : ""
    return fetchAPI(`/inventory/suppliers/${queryString}`)
  },
  getSupplier: (id: number) => fetchAPI(`/inventory/suppliers/${id}/`),
  createSupplier: (data: any) =>
    fetchAPI("/inventory/suppliers/", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateSupplier: (id: number, data: any) =>
    fetchAPI(`/inventory/suppliers/${id}/`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteSupplier: (id: number) =>
    fetchAPI(`/inventory/suppliers/${id}/`, {
      method: "DELETE",
    }),
}

// API functions for item suppliers
export const itemSupplierAPI = {
  getItemSuppliers: () => fetchAPI("/inventory/item-suppliers/"),
  getItemSupplier: (id: number) => fetchAPI(`/inventory/item-suppliers/${id}/`),
  createItemSupplier: (data: any) =>
    fetchAPI("/inventory/item-suppliers/", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateItemSupplier: (id: number, data: any) =>
    fetchAPI(`/inventory/item-suppliers/${id}/`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteItemSupplier: (id: number) =>
    fetchAPI(`/inventory/item-suppliers/${id}/`, {
      method: "DELETE",
    }),
}

// API functions for inventory logs
export const logAPI = {
  getLogs: (params = {}) => {
    const queryParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      queryParams.append(key, String(value))
    })
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : ""
    return fetchAPI(`/inventory/logs/${queryString}`)
  },
  getLog: (id: number) => fetchAPI(`/inventory/logs/${id}/`),
  getItemLogs: (itemId: number) => fetchAPI(`/inventory/logs/${itemId}/item/`),
  getRecentChanges: (days?: number) => {
    const queryString = days ? `?days=${days}` : ""
    return fetchAPI(`/inventory/logs/recent_changes/${queryString}`)
  },
  getChangesSummary: (groupBy: "day" | "item" | "user") => {
    return fetchAPI(`/inventory/logs/recent_changes/?group_by=${groupBy}`)
  },
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
  username?: string
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

export interface InventoryLevel {
  item_id: number
  item_name: string
  current_quantity: number
  low_stock_threshold: number
  is_low_stock: boolean
  last_updated: string
}
