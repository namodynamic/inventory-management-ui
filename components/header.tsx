"use client"

import { useState, useEffect, useRef } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Bell, Menu, Search, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ModeToggle } from "@/components/mode-toggle"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { useAuth } from "@/lib/auth"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { inventoryAPI } from "@/lib/api"
import { Badge } from "@/components/ui/badge"

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const router = useRouter()

  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<InventoryItem[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const searchResultsRef = useRef<HTMLDivElement>(null)

  // Get page title based on current path
  const getPageTitle = () => {
    const path = pathname.split("/")[1]
    if (path === "") return "Dashboard"
    return path.charAt(0).toUpperCase() + path.slice(1)
  }

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user) return "U"
    if (user.first_name && user.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
    }
    return user.username.substring(0, 2).toUpperCase()
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    if (query.trim().length === 0) {
      setSearchResults([])
      setIsSearching(false)
      setShowResults(false)
      return
    }

    setIsSearching(true)
    setShowResults(true)


    // Debounce search to avoid too many API calls
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const items = await inventoryAPI.getItems({ search: query })
        
        const filteredItems = Array.isArray(items.results) ? items.results.slice(0, 10) : []

        setSearchResults(filteredItems) 
      } catch (error) {
        console.error("Error searching items:", error)
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }, 300)
  }

  const handleSelectItem = (item: InventoryItem) => {
    router.push(`/inventory/${item.id}`)
    setShowResults(false)
    setSearchQuery("")
    setSearchResults([])
  }

  // click outside handler to close search results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchResultsRef.current && !searchResultsRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <Button variant="outline" size="icon" className="md:hidden" onClick={() => setIsMobileMenuOpen(true)}>
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle menu</span>
      </Button>
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="w-60 p-0">
          <div className="p-6 border-b">
            <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xl">Inventory</span>
              </div>
            </Link>
          </div>
          <nav className="flex flex-col gap-1 p-4">
            {[
              { name: "Dashboard", path: "/" },
              { name: "Inventory", path: "/inventory" },
              { name: "Categories", path: "/categories" },
              { name: "Suppliers", path: "/suppliers" },
              { name: "Item Suppliers", path: "/item-suppliers" },
              { name: "Logs", path: "/logs" },
              { name: "Reports", path: "/reports" },
              { name: "Settings", path: "/settings" },
            ].map((item) => (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium",
                  pathname === item.path
                    ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50"
                    : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50",
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
      <div className="flex-1">
        <h1 className="text-xl font-semibold">{getPageTitle()}</h1>
      </div>
      <div className="flex items-center gap-4">
      <div className="hidden md:flex items-center relative">
          <Search className="absolute left-2.5 h-4 w-4 text-muted-foreground z-10" />
          <Input
            type="search"
            placeholder="Search inventory item..."
            className="w-64 pl-8 bg-background"
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => setShowResults(true)}
          />
          {isSearching && (
            <div className="absolute right-2.5 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          )}
          {showResults && (
            <div
              ref={searchResultsRef}
              className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg z-50 max-h-64 overflow-y-auto"
            >
              {isSearching ? (
                <div className="p-4 text-center">
                  <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                  <p className="text-sm text-muted-foreground">Searching...</p>
                </div>
              ) : searchResults.length > 0 ? (
                searchResults.map((item) => (
                  <div
                    key={item.id}
                    className="p-2 hover:bg-muted cursor-pointer flex items-center justify-between"
                    onClick={() => handleSelectItem(item)}
                  >
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs text-muted-foreground">threshold: {item.low_stock_threshold || "N/A"}</div>
                    </div>
                    <div className="text-sm">
                      {item.is_low_stock ? (
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                        <AlertTriangle/>  Low
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Qty: {item.quantity}</Badge>
                      )}
                    </div>
                  </div>
                ))
              ) : searchQuery ? (
                <div className="p-4 text-center text-muted-foreground">No items found matching &quot;{searchQuery}&quot;</div>
              ) : null}
            </div>
          )}
        </div>
       
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-600"></span>
          <span className="sr-only">Notifications</span>
        </Button>
        <ModeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="cursor-pointer">
              <AvatarImage src="/placeholder.svg?height=32&width=32" alt={user?.username || "User"} />
              <AvatarFallback>{getUserInitials()}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings">Profile Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={logout} className="text-red-600 cursor-pointer">
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
