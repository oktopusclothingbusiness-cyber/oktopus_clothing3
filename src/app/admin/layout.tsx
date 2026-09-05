'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  ShoppingBag,
  Users,
  PanelLeft,
  Package,
  Shirt,
  Megaphone,
  Shapes,
  Palette,
  Ticket,
  Settings,
  Truck,
  TrendingUp,
  Mail,
  MessageSquare,
  BarChart,
  Ruler,
  Gift,
  Layers,
  ExternalLink,
  LogOut,
  User as UserIcon,
  ChevronRight,
  Loader2,
  ShieldAlert,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { AdminNotificationPanel } from '@/components/admin/admin-notification-panel';
import { AdminCommandPalette } from '@/components/admin/admin-command-palette';
import { ThemeToggle } from '@/components/theme-toggle';
import { Badge } from '@/components/ui/badge';
import { AdminViewSwitcherButton, AdminViewSwitcherSidebar } from '@/components/admin/admin-view-switcher';

type NavGroup = {
  title: string;
  items: {
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[];
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  if (authLoading) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="mt-4 text-sm text-muted-foreground font-medium">Authenticating Admin Workspace...</p>
      </div>
    );
  }

  if (user?.role !== 'admin') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-md text-center shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2 text-destructive">
              <ShieldAlert className="h-6 w-6" />
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            You do not have administrative privileges to access this area. Please log in with an admin account.
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => router.push('/login')}>
              Go to Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const navGroups: NavGroup[] = [
    {
      title: 'Overview',
      items: [
        { href: '/admin', label: 'Dashboard', icon: Home },
        { href: '/admin/statistics', label: 'Analytics', icon: BarChart },
      ],
    },
    {
      title: 'Catalog & Inventory',
      items: [
        { href: '/admin/products', label: 'Products', icon: Shirt },
        { href: '/admin/batch-tasks', label: 'Batch Tasks', icon: Layers },
        { href: '/admin/categories', label: 'Categories', icon: Shapes },
        { href: '/admin/size-charts', label: 'Size Charts', icon: Ruler },
      ],
    },
    {
      title: 'Sales & Customers',
      items: [
        { href: '/admin/orders', label: 'Orders', icon: Package },
        { href: '/admin/users', label: 'Users', icon: Users },
        { href: '/admin/custom-designs', label: 'Custom Designs', icon: Palette },
        { href: '/admin/shipping', label: 'Shipping', icon: Truck },
      ],
    },
    {
      title: 'Marketing & Loyalty',
      items: [
        { href: '/admin/promotions', label: 'Promotions', icon: Megaphone },
        { href: '/admin/coupons', label: 'Coupons', icon: Ticket },
        { href: '/admin/rewards', label: 'Rewards', icon: Gift },
        { href: '/admin/popups', label: 'Popups', icon: MessageSquare },
        { href: '/admin/emails', label: 'Promotional Emails', icon: Mail },
        { href: '/admin/trends', label: 'Trends', icon: TrendingUp },
      ],
    },
    {
      title: 'System & Theme',
      items: [
        { href: '/admin/palette', label: 'Palette', icon: Palette },
        { href: '/admin/settings', label: 'Settings', icon: Settings },
      ],
    },
  ];

  // Derive current page title for breadcrumb
  const allNavItems = navGroups.flatMap((g) => g.items);
  const activeNavItem = allNavItems.find((item) => item.href === pathname);
  const currentPageTitle = activeNavItem ? activeNavItem.label : 'Admin';

  return (
    <div className="flex min-h-screen bg-muted/20 text-foreground">
      {/* SIDEBAR NAVIGATION */}
      <aside
        className={cn(
          'flex flex-col border-r bg-background transition-all duration-300 z-30 shrink-0',
          isSidebarOpen ? 'w-64' : 'w-16'
        )}
      >
        {/* BRAND LOGO */}
        <div className="flex h-14 items-center justify-between border-b px-4">
          <Link href="/admin" className="flex items-center gap-2 font-bold tracking-tight">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-mono text-sm">
              OK
            </div>
            {isSidebarOpen && <span className="text-sm font-semibold tracking-wide">OKTOPUS ADMIN</span>}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 ml-auto"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            title={isSidebarOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
          >
            <PanelLeft className="h-4 w-4" />
          </Button>
        </div>

        {/* NAVIGATION LINKS */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-4">
          {navGroups.map((group) => (
            <div key={group.title} className="space-y-1">
              {isSidebarOpen && (
                <p className="px-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  {group.title}
                </p>
              )}
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href || '/admin'}
                    className={cn(
                      'flex items-center gap-3 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all',
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-xs font-semibold'
                        : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                    )}
                    title={!isSidebarOpen ? item.label : undefined}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {isSidebarOpen && <span className="truncate">{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* MOBILE ADMIN SWITCHER IN SIDEBAR */}
        <div className="p-2.5 border-t bg-muted/20">
          <AdminViewSwitcherSidebar isSidebarOpen={isSidebarOpen} />
        </div>

        {/* SIDEBAR FOOTER (ADMIN INFO & LOGOUT) */}
        <div className="border-t p-3 bg-card">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 truncate">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-foreground shrink-0 font-bold text-xs">
                {user?.firstName ? user.firstName.charAt(0).toUpperCase() : 'A'}
              </div>
              {isSidebarOpen && (
                <div className="flex flex-col truncate">
                  <span className="text-xs font-bold truncate leading-tight">
                    {user?.firstName || 'Admin User'}
                  </span>
                  <span className="text-[10px] text-muted-foreground truncate">{user?.email}</span>
                </div>
              )}
            </div>

            {isSidebarOpen && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
                onClick={logout}
                title="Log Out"
              >
                <LogOut className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* DEDICATED ADMIN TOP BAR (NO PUBLIC NAVBAR/FOOTER) */}
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b bg-background/95 backdrop-blur-md px-6">
          {/* BREADCRUMB / TITLE */}
          <div className="flex items-center gap-2 text-xs font-medium">
            <span className="text-muted-foreground">Admin</span>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="font-bold text-foreground">{currentPageTitle}</span>
            <Badge variant="outline" className="ml-2 text-[10px] px-1.5 py-0">
              Workspace
            </Badge>
          </div>

          {/* RIGHT ACTIONS */}
          <div className="flex items-center gap-3">
            {/* COMMAND PALETTE SEARCH (Cmd + K) */}
            <AdminCommandPalette />

            {/* SWITCH TO MOBILE ADMIN */}
            <AdminViewSwitcherButton />

            {/* VIEW STOREFRONT LINK */}
            <Button variant="outline" size="sm" asChild className="h-8 text-xs font-medium gap-1.5 hidden sm:flex">
              <Link href="/store" target="_blank">
                <ExternalLink className="h-3.5 w-3.5" />
                View Store
              </Link>
            </Button>

            {/* THEME TOGGLE */}
            <ThemeToggle />

            {/* FLOATING HEALTH NOTIFICATION PANEL */}
            <AdminNotificationPanel />
          </div>
        </header>

        {/* MAIN ADMIN WORKSPACE PAGE CONTENT */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
