"use client";
import type React from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import { AuthProvider } from "@/lib/auth";
import AuthGuard from "@/components/auth-guard";
import { usePathname } from "next/navigation";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export default function ClientRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <AuthGuard>
              <LayoutContent>{children}</LayoutContent>
            </AuthGuard>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

// Separate component to conditionally render layout based on route
function LayoutContent({ children }: { children: React.ReactNode }) {
  // Client component that checks the current path
  return <ClientLayoutContent>{children}</ClientLayoutContent>;
}

function ClientLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/register";

  if (isAuthPage) {
    // Render a simple layout for auth pages
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        {children}
      </div>
    );
  }

  // Render the full layout with sidebar and header for authenticated pages
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50 dark:bg-gray-900">
          <Toaster position="bottom-right" />
          {children}
        </main>
      </div>
    </div>
  );
}
