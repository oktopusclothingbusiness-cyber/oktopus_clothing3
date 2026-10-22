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
  Bell,
  Receipt,
  Menu,
  X,
  Sparkles,
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
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = React.useState(false);

  // Close mobile drawer whenever route changes
  React.useEffect(() => {
    setIsMobileDrawerOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile drawer is open
  React.useEffect(() => {
    if (isMobileDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileDrawerOpen]);

  React.useEffect(() => {
    document.documentElement.classList.add('admin-theme');
    document.documentElement.style.setProperty('--primary', '73 100% 81%');
    document.documentElement.style.setProperty('--primary-foreground', '240 10% 4%');
    document.documentElement.style.setProperty('--accent', '73 100% 81%');
    document.documentElement.style.setProperty('--accent-foreground', '240 10% 4%');
    document.documentElement.style.setProperty('--ring', '73 100% 81%');

    return () => {
      document.documentElement.classList.remove('admin-theme');
      document.documentElement.style.removeProperty('--primary');
      document.documentElement.style.removeProperty('--primary-foreground');
      document.documentElement.style.removeProperty('--accent');
      document.documentElement.style.removeProperty('--accent-foreground');
      document.documentElement.style.removeProperty('--ring');
    };
  }, []);

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
        { href: '/admin/invoices', label: 'Invoices', icon: Receipt },
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
        { href: '/admin/posters', label: 'Exclusive Posters', icon: Sparkles },
        { href: '/admin/popups', label: 'Popups', icon: MessageSquare },
        { href: '/admin/emails', label: 'Promotional Emails', icon: Mail },
        { href: '/admin/notifications', label: 'Push Notifications', icon: Bell },
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
    <div className="admin-workspace flex min-h-screen w-full max-w-[100vw] overflow-x-hidden bg-muted/20 text-foreground">
      {/* MOBILE BACKDROP OVERLAY */}
      {isMobileDrawerOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs lg:hidden transition-opacity duration-300"
          onClick={() => setIsMobileDrawerOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* MOBILE OFF-CANVAS NAVIGATION DRAWER */}
      <aside
        aria-hidden={!isMobileDrawerOpen}
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col bg-background border-r shadow-2xl transition-all duration-300 ease-in-out lg:hidden',
          isMobileDrawerOpen
            ? 'translate-x-0 opacity-100 visible pointer-events-auto'
            : '-translate-x-full opacity-0 invisible pointer-events-none'
        )}
      >
        {/* BRAND LOGO & CLOSE BUTTON */}
        <div className="flex h-14 items-center justify-between border-b px-4 bg-card">
          <Link
            href="/admin"
            className="flex items-center gap-2 font-bold tracking-tight"
            onClick={() => setIsMobileDrawerOpen(false)}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-mono text-sm font-bold shadow-xs">
              OK
            </div>
            <span className="text-sm font-bold tracking-wide">OKTOPUS ADMIN</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={() => setIsMobileDrawerOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* MOBILE NAVIGATION LINKS */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-4">
          {navGroups.map((group) => (
            <div key={group.title} className="space-y-1">
              <p className="px-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                {group.title}
              </p>
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href || '/admin'}
                    onClick={() => setIsMobileDrawerOpen(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-2.5 py-2 text-xs font-medium transition-all',
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-xs font-bold'
                        : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                    {isActive && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-foreground" />
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* MOBILE SWITCHER & QUICK LINKS */}
        <div className="p-3 border-t bg-muted/20 space-y-2">
          <AdminViewSwitcherSidebar isSidebarOpen={true} />
          <Button variant="outline" size="sm" asChild className="w-full h-8 text-xs font-semibold justify-start gap-2">
            <Link href="/store" target="_blank" onClick={() => setIsMobileDrawerOpen(false)}>
              <ExternalLink className="h-3.5 w-3.5" />
              Open Storefront
            </Link>
          </Button>
        </div>

        {/* SIDEBAR FOOTER (ADMIN INFO & LOGOUT) */}
        <div className="border-t p-3 bg-card">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 truncate">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-foreground shrink-0 font-bold text-xs">
                {user?.firstName ? user.firstName.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="flex flex-col truncate">
                <span className="text-xs font-bold truncate leading-tight">
                  {user?.firstName || 'Admin User'}
                </span>
                <span className="text-[10px] text-muted-foreground truncate">{user?.email}</span>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
              onClick={logout}
              title="Log Out"
            >
              <LogOut className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </aside>

      {/* DESKTOP PERSISTENT SIDEBAR */}
      <aside
        className={cn(
          'hidden lg:flex flex-col border-r bg-background transition-all duration-300 z-30 shrink-0',
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
      <div className="flex flex-col flex-1 min-w-0 w-full max-w-full overflow-x-hidden">
        {/* RESPONSIVE ADMIN TOP BAR */}
        <header className="sticky top-0 z-20 flex h-14 w-full max-w-full items-center justify-between border-b bg-background/95 backdrop-blur-md px-2.5 sm:px-6 overflow-hidden">
          {/* LEFT: HAMBURGER (MOBILE) & BREADCRUMB / TITLE */}
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1 mr-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 -ml-1 mr-0.5 lg:hidden text-foreground shrink-0"
              onClick={() => setIsMobileDrawerOpen(true)}
              aria-label="Open Navigation Menu"
            >
              <Menu className="h-4 w-4" />
            </Button>

            <Link href="/admin" className="flex items-center gap-1.5 font-bold lg:hidden shrink-0">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground font-mono text-xs font-bold shadow-xs">
                OK
              </div>
            </Link>

            {/* DESKTOP BREADCRUMB */}
            <div className="hidden lg:flex items-center gap-2 text-xs font-medium">
              <span className="text-muted-foreground">Admin</span>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="font-bold text-foreground">{currentPageTitle}</span>
              <Badge variant="outline" className="ml-2 text-[10px] px-1.5 py-0">
                Workspace
              </Badge>
            </div>

            {/* MOBILE CURRENT PAGE TITLE */}
            <span className="font-bold text-foreground text-xs sm:text-sm truncate lg:hidden">
              {currentPageTitle}
            </span>
          </div>

          {/* RIGHT ACTIONS */}
          <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
            {/* COMMAND PALETTE SEARCH (Cmd + K) */}
            <AdminCommandPalette />

            {/* SWITCH TO MOBILE ADMIN */}
            <div className="hidden sm:block">
              <AdminViewSwitcherButton />
            </div>

            {/* VIEW STOREFRONT LINK */}
            <Button variant="outline" size="sm" asChild className="h-8 text-xs font-medium gap-1.5 hidden md:flex">
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
        <main className="flex-1 p-3 sm:p-5 md:p-8 max-w-7xl w-full mx-auto pb-24 lg:pb-8 min-w-0 max-w-full overflow-x-hidden">
          {children}
        </main>

        {/* MOBILE BOTTOM QUICK NAVIGATION BAR */}
        <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 w-full max-w-full bg-background/95 backdrop-blur-md border-t border-border shadow-lg px-2 py-1 flex items-center justify-around pb-[max(0.375rem,env(safe-area-inset-bottom))] overflow-hidden">
          <Link
            href="/admin"
            className={cn(
              'flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-[10px] font-medium transition-colors',
              pathname === '/admin' ? 'text-primary font-bold' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Home className="h-4 w-4 mb-0.5" />
            <span>Home</span>
          </Link>
          <Link
            href="/admin/orders"
            className={cn(
              'flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-[10px] font-medium transition-colors',
              pathname.startsWith('/admin/orders') ? 'text-primary font-bold' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Package className="h-4 w-4 mb-0.5" />
            <span>Orders</span>
          </Link>
          <Link
            href="/admin/products"
            className={cn(
              'flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-[10px] font-medium transition-colors',
              pathname.startsWith('/admin/products') ? 'text-primary font-bold' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Shirt className="h-4 w-4 mb-0.5" />
            <span>Products</span>
          </Link>
          <Link
            href="/admin/invoices"
            className={cn(
              'flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-[10px] font-medium transition-colors',
              pathname.startsWith('/admin/invoices') ? 'text-primary font-bold' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Receipt className="h-4 w-4 mb-0.5" />
            <span>Invoices</span>
          </Link>
          <button
            type="button"
            onClick={() => setIsMobileDrawerOpen(true)}
            className="flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <PanelLeft className="h-4 w-4 mb-0.5" />
            <span>All Menu</span>
          </button>
        </nav>
      </div>
    </div>
  );
}
