'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Smartphone, LayoutDashboard, ArrowRightLeft } from 'lucide-react';
import { getAdminBridgeRoute } from '@/lib/admin-route-bridge';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface AdminViewSwitcherButtonProps {
  className?: string;
}

/**
 * Top header button for switching between Main Desktop Admin and Mobile App Admin.
 * Automatically detects the current page and preserves section continuity (e.g. Orders -> Orders).
 */
export function AdminViewSwitcherButton({ className }: AdminViewSwitcherButtonProps) {
  const pathname = usePathname();
  const bridge = React.useMemo(() => getAdminBridgeRoute(pathname), [pathname]);

  const isCurrentMobile = bridge.currentArea === 'mobile-admin';

  if (isCurrentMobile) {
    // Render button inside Mobile Admin to switch back to Main Admin
    return (
      <Link
        href={bridge.targetHref}
        title={
          bridge.isCommonSection && bridge.sectionName !== 'Dashboard'
            ? `Switch to Main Admin (${bridge.sectionName})`
            : 'Switch to Main Admin Workspace'
        }
        className={cn(
          'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-xs',
          'bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/80 hover:border-zinc-600',
          className
        )}
      >
        <LayoutDashboard className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
        <span className="hidden sm:inline">Main Admin</span>
        <span className="sm:hidden">Main</span>
        {bridge.isCommonSection && bridge.sectionName !== 'Dashboard' && (
          <span className="hidden lg:inline text-[10px] font-mono font-medium px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
            {bridge.sectionName}
          </span>
        )}
        <ArrowRightLeft className="w-3 h-3 text-zinc-400 shrink-0 ml-0.5 opacity-70" />
      </Link>
    );
  }

  // Render button inside Main Admin to switch to Mobile Admin
  return (
    <Button
      variant="outline"
      size="sm"
      asChild
      className={cn(
        'h-8 text-xs font-semibold gap-1.5 transition-all shadow-xs',
        'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 hover:border-emerald-500/40',
        className
      )}
    >
      <Link
        href={bridge.targetHref}
        title={
          bridge.isCommonSection && bridge.sectionName !== 'Dashboard'
            ? `Switch to Mobile Admin (${bridge.sectionName})`
            : 'Switch to Mobile App Admin'
        }
      >
        <Smartphone className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <span className="hidden sm:inline">Mobile Admin</span>
        <span className="sm:hidden">Mobile</span>
        {bridge.isCommonSection && bridge.sectionName !== 'Dashboard' && (
          <span className="hidden lg:inline text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
            {bridge.sectionName}
          </span>
        )}
        <ArrowRightLeft className="h-3 w-3 text-emerald-600/70 dark:text-emerald-400/70 shrink-0 ml-0.5" />
      </Link>
    </Button>
  );
}

interface AdminViewSwitcherSidebarProps {
  isSidebarOpen?: boolean;
  className?: string;
}

/**
 * Sidebar navigation card for switching between Main Desktop Admin and Mobile App Admin.
 * Automatically adapts when the sidebar is collapsed or expanded.
 */
export function AdminViewSwitcherSidebar({
  isSidebarOpen = true,
  className,
}: AdminViewSwitcherSidebarProps) {
  const pathname = usePathname();
  const bridge = React.useMemo(() => getAdminBridgeRoute(pathname), [pathname]);
  const isCurrentMobile = bridge.currentArea === 'mobile-admin';

  if (isCurrentMobile) {
    // Sidebar switcher inside Mobile Admin
    return (
      <Link
        href={bridge.targetHref}
        title={
          !isSidebarOpen
            ? bridge.isCommonSection && bridge.sectionName !== 'Dashboard'
              ? `Main Admin: ${bridge.sectionName}`
              : 'Main Admin'
            : undefined
        }
        className={cn(
          'flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium transition-all',
          'bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800/90',
          !isSidebarOpen && 'justify-center px-2',
          className
        )}
      >
        <LayoutDashboard className="w-4 h-4 text-zinc-400 shrink-0" />
        {isSidebarOpen && (
          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs text-white truncate">Main Admin</span>
              <ArrowRightLeft className="w-3 h-3 text-zinc-400 shrink-0" />
            </div>
            <span className="text-[10px] text-zinc-400 truncate">
              {bridge.isCommonSection && bridge.sectionName !== 'Dashboard'
                ? `Go to ${bridge.sectionName}`
                : 'Desktop Workspace'}
            </span>
          </div>
        )}
      </Link>
    );
  }

  // Sidebar switcher inside Main Admin
  return (
    <Link
      href={bridge.targetHref}
      title={
        !isSidebarOpen
          ? bridge.isCommonSection && bridge.sectionName !== 'Dashboard'
            ? `Mobile Admin: ${bridge.sectionName}`
            : 'Mobile Admin'
          : undefined
      }
      className={cn(
        'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium transition-all',
        'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20',
        !isSidebarOpen && 'justify-center px-1.5',
        className
      )}
    >
      <Smartphone className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
      {isSidebarOpen && (
        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <span className="font-semibold truncate">Mobile Admin</span>
            <ArrowRightLeft className="h-3 w-3 text-emerald-600/70 dark:text-emerald-400/70 shrink-0" />
          </div>
          <span className="text-[10px] text-emerald-700/80 dark:text-emerald-400/80 truncate">
            {bridge.isCommonSection && bridge.sectionName !== 'Dashboard'
              ? `Go to ${bridge.sectionName}`
              : 'Mobile App Panel'}
          </span>
        </div>
      )}
    </Link>
  );
}
