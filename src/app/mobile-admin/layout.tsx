"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import {
  Smartphone,
  Image as ImageIcon,
  Layers,
  ShoppingBag,
  Truck,
  Coins,
  Palette,
  Ticket,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Bell,
  Search,
  LayoutDashboard,
  ShieldAlert,
  Loader2
} from "lucide-react";

const NAV_ITEMS = [
  { name: "Dashboard", href: "/mobile-admin", icon: LayoutDashboard },
  { name: "Hero Banners", href: "/mobile-admin/banners", icon: ImageIcon },
  { name: "App Categories", href: "/mobile-admin/categories", icon: Layers },
  { name: "Products & Catalog", href: "/mobile-admin/products", icon: ShoppingBag },
  { name: "Orders Pipeline", href: "/mobile-admin/orders", icon: Truck },
  { name: "Oktocoins Rewards", href: "/mobile-admin/rewards", icon: Coins },
  { name: "Custom Designs", href: "/mobile-admin/custom-designs", icon: Palette },
  { name: "Coupons & Discounts", href: "/mobile-admin/coupons", icon: Ticket },
];

export default function MobileAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string>("https://i.ibb.co/GfTs981G/okto-new-logo-white.png");

  useEffect(() => {
    async function fetchLogo() {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          if (data.logoUrl) {
            setLogoUrl(data.logoUrl);
          }
        }
      } catch (err) {
        // Fallback to default logo
      }
    }
    fetchLogo();
  }, []);

  if (authLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#0E0E0E] items-center justify-center text-white">
        <Loader2 className="h-12 w-12 animate-spin text-white" />
        <p className="mt-4 text-xs font-mono text-zinc-400">Authenticating Mobile Admin...</p>
      </div>
    );
  }

  // Strictly enforce Admin Role
  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#0E0E0E] text-white flex items-center justify-center p-4">
        <div className="bg-[#161616] border border-zinc-800 rounded-2xl p-8 max-w-md w-full text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white">Access Denied</h2>
          <p className="text-xs text-zinc-400">
            The Mobile App Admin Panel is restricted exclusively to administrators. Please log in with an administrator account to continue.
          </p>
          <button
            onClick={() => router.push('/login')}
            className="w-full py-2.5 bg-white hover:bg-zinc-200 text-black font-bold text-xs rounded-xl shadow-lg transition"
          >
            Go to Admin Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0E0E0E] text-white font-sans flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside
        className={`${
          collapsed ? "w-20" : "w-64"
        } bg-[#161616] border-r border-zinc-800/80 transition-all duration-300 flex flex-col justify-between z-30 shrink-0`}
      >
        <div>
          {/* Header Branding with Oktopus Logo */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-zinc-800/80">
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="relative h-9 w-28 shrink-0 flex items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logoUrl}
                  alt="Oktopus Logo"
                  className="h-8 object-contain max-w-full"
                />
              </div>
              {!collapsed && (
                <span className="text-[10px] bg-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded font-mono font-bold">
                  APP ADMIN
                </span>
              )}
            </div>

            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1.5 rounded-lg bg-zinc-800/60 hover:bg-zinc-700 text-zinc-400 hover:text-white transition"
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1.5">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-white text-black font-bold shadow-lg shadow-white/10"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
                  }`}
                >
                  <Icon className={`w-5 h-5 shrink-0 ${isActive ? "text-black" : "text-zinc-400"}`} />
                  {!collapsed && <span className="truncate">{item.name}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-zinc-800/80 space-y-2">
          {!collapsed && (
            <div className="px-3 py-2 rounded-xl bg-zinc-900/80 border border-zinc-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-300">Live Backend</span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  REAL DATABASE
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 truncate mt-1">
                MongoDB Cluster Sync
              </p>
            </div>
          )}

          <Link
            href="/"
            className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!collapsed && <span>Exit to Web Store</span>}
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top App Bar */}
        <header className="h-16 bg-[#161616] border-b border-zinc-800/80 px-6 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center space-x-4">
            <div className="h-7 w-24 relative flex items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logoUrl} alt="Oktopus Logo" className="h-6 object-contain" />
            </div>
            <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-zinc-800 text-zinc-200 border border-zinc-700">
              Mobile App Manager
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <div className="relative hidden md:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search orders, products, users..."
                className="pl-9 pr-4 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white w-64 transition"
              />
            </div>

            <button className="p-2 rounded-xl bg-zinc-800/60 hover:bg-zinc-700 text-zinc-300 relative transition">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-400"></span>
            </button>

            <div className="h-8 w-[1px] bg-zinc-800"></div>

            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-full bg-white text-black font-bold text-xs flex items-center justify-center">
                {user?.firstName ? user.firstName[0].toUpperCase() : "AD"}
              </div>
              <div className="hidden lg:flex flex-col">
                <span className="text-xs font-semibold text-white">
                  {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : "App Admin"}
                </span>
                <span className="text-[10px] text-zinc-400">{user?.email || "admin@oktopus.in"}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Module Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
