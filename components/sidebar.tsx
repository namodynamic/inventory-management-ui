"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { BarChart3, Box, ClipboardList, Home, LogOut, Package, Settings, Tag, Truck, BaggageClaimIcon } from "lucide-react"
import { useAuth } from "@/lib/auth"

const routes = [
  {
    label: "Dashboard",
    icon: Home,
    href: "/",
    color: "text-sky-500",
  },
  {
    label: "Inventory",
    icon: Package,
    href: "/inventory",
    color: "text-violet-500",
  },
  {
    label: "Categories",
    icon: Tag,
    href: "/categories",
    color: "text-pink-700",
  },
  {
    label: "Suppliers",
    icon: Truck,
    href: "/suppliers",
    color: "text-orange-500",
  },
  {
    label: "Item Suppliers",
    icon: BaggageClaimIcon,
    href: "/item-suppliers",
    color: "text-orange-200",
  },
  {
    label: "Logs",
    icon: ClipboardList,
    href: "/logs",
    color: "text-emerald-500",
  },
  {
    label: "Reports",
    icon: BarChart3,
    href: "/reports",
    color: "text-blue-500",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/settings",
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { logout } = useAuth()

  return (
    <div className="hidden md:flex h-full flex-col bg-white dark:bg-gray-800 shadow-sm border-r border-gray-200 dark:border-gray-700">
      <div className="p-6">
        <Link href="/">
          <div className="flex items-center gap-2">
            <Box className="h-8 w-8 text-indigo-600" />
            <h1 className="text-xl font-bold">Inventory</h1>
          </div>
        </Link>
      </div>
      <div className="flex flex-col w-60">
        <nav className="flex-1 px-2 py-4 space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors",
                pathname === route.href
                  ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white",
              )}
            >
              <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
              {route.label}
            </Link>
          ))}
        </nav>
        <div className="px-2 py-4 mt-auto">
          <button
            onClick={logout}
            className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <LogOut className="h-5 w-5 mr-3 text-gray-500" />
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}
