"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { Bell, Menu, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ModeToggle } from "@/components/mode-toggle"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { Sheet, SheetContent } from "@/components/ui/sheet"

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  // Get page title based on current path
  const getPageTitle = () => {
    const path = pathname.split("/")[1]
    if (path === "") return "Dashboard"
    return path.charAt(0).toUpperCase() + path.slice(1)
  }

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
        <form className="hidden md:flex items-center relative">
          <Search className="absolute left-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Search..." className="w-64 pl-8 bg-background" />
        </form>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-600"></span>
          <span className="sr-only">Notifications</span>
        </Button>
        <ModeToggle />
        <Avatar>
          <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
