interface InventoryItem {
    id?: number;
    name: string;
    description?: string | null;
    quantity: number;
    price: string;
    category: number | null;
    category_name?: string;
    owner_username?: string | null;
    sku: string | null;
    location: string | null;
    low_stock_threshold?: number;
    date_added?: string;
    last_updated?: string;
    is_low_stock?: boolean;
  }
  
interface Supplier {
    id: number;
    name: string;
    contact_name: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
    owner: number;
    created_at: string;
    updated_at: string;
  }
  
interface InventoryLog {
    id: number;
    item: number;
    item_name?: string;
    user: number | null;
    username?: string;
    action: "ADD" | "REMOVE" | "UPDATE";
    quantity_change: number;
    previous_quantity: number;
    new_quantity: number;
    timestamp: string;
    notes: string | null;
  }
  
interface InventoryItemSupplier {
    id: number;
    item: number;
    supplier: number;
    supplier_name?: string;
    supplier_sku: string | null;
    supplier_price: string;
    lead_time_days: number | null;
    notes: string | null;
  }

interface User {
    id: number
    username: string
    email: string
    first_name?: string
    last_name?: string
  }
  
interface AuthTokens {
    access: string
    refresh: string
  }
  
interface AuthContextType {
    user: User | null
    tokens: AuthTokens | null
    isLoading: boolean
    login: (username: string, password: string) => Promise<void>
    register: (userData: RegisterData) => Promise<void>
    logout: () => Promise<void>
    changePassword: (currentPassword: string, newPassword: string) => Promise<void>
    updateProfile: (userData: Partial<User>) => Promise<void>
  }
  
interface RegisterData {
    username: string
    email: string
    password: string
    first_name?: string
    last_name?: string
  }

interface ChartConfig {
    [key: string]: {
      label: string
      color?: string
    }
  } 
  
interface Category {
  id: number
  name: string
  description: string | null
  created_at: string
  updated_at: string
}


interface InventoryLevel {
  item_id: number
  item_name: string
  current_quantity: number
  low_stock_threshold: number
  is_low_stock: boolean
  last_updated: string
}

interface LowStockAlertsProps {
  lowStockData: {
    name: string;
    Quantity: number;
    Threshold: number;
  }[];
}

interface InventoryByCategoryProps {
  categories: Category[];
  inventoryItems: InventoryItem[];
}

interface DashboardMetricsProps {
  totalItems: number;
  inventoryItems: InventoryItem[];
  lowStockItems: number;
  totalValue: number;
  totalCategories: number;
  activeCategories: number;
  lowStockData: { name: string; Quantity: number; Threshold: number; }[];
}

interface InventoryTrendChartProps {
  trendData: { month: string; stock: number; available: number; sold: number }[];
  currentYearValue: number;
  currentMonthValue: number;
};
  