'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import {
  Search,
  Home,
  Shirt,
  Package,
  Users,
  Layers,
  BarChart,
  Shapes,
  Ruler,
  Megaphone,
  Ticket,
  Gift,
  MessageSquare,
  Mail,
  TrendingUp,
  Palette,
  Truck,
  Settings,
  PlusCircle,
  ExternalLink,
} from 'lucide-react';

export function AdminCommandPalette() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, []);

  return (
    <>
      <Button
        variant="outline"
        className="relative h-8 w-full max-w-[240px] justify-start rounded-lg text-xs font-normal text-muted-foreground shadow-none sm:w-64"
        onClick={() => setOpen(true)}
      >
        <Search className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
        <span>Search pages & tasks...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-0.5 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search page..." />
        <CommandList className="max-h-[350px]">
          <CommandEmpty>No matching admin results found.</CommandEmpty>

          <CommandGroup heading="Admin Pages">
            <CommandItem onSelect={() => runCommand(() => router.push('/admin'))}>
              <Home className="mr-2 h-4 w-4" />
              <span>Dashboard Overview</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push('/admin/statistics'))}>
              <BarChart className="mr-2 h-4 w-4" />
              <span>Analytics</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push('/admin/products'))}>
              <Shirt className="mr-2 h-4 w-4" />
              <span>Products Management</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push('/admin/batch-tasks'))}>
              <Layers className="mr-2 h-4 w-4" />
              <span>Batch Operations Engine</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push('/admin/orders'))}>
              <Package className="mr-2 h-4 w-4" />
              <span>Orders Management</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push('/admin/users'))}>
              <Users className="mr-2 h-4 w-4" />
              <span>User Management</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push('/admin/categories'))}>
              <Shapes className="mr-2 h-4 w-4" />
              <span>Categories</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push('/admin/size-charts'))}>
              <Ruler className="mr-2 h-4 w-4" />
              <span>Size Charts</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Marketing & Sales">
            <CommandItem onSelect={() => runCommand(() => router.push('/admin/promotions'))}>
              <Megaphone className="mr-2 h-4 w-4" />
              <span>Promotions</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push('/admin/coupons'))}>
              <Ticket className="mr-2 h-4 w-4" />
              <span>Discount Coupons</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push('/admin/rewards'))}>
              <Gift className="mr-2 h-4 w-4" />
              <span>Rewards & Oktocoins</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push('/admin/popups'))}>
              <MessageSquare className="mr-2 h-4 w-4" />
              <span>Store Popups</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push('/admin/emails'))}>
              <Mail className="mr-2 h-4 w-4" />
              <span>Promotional Emails</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push('/admin/trends'))}>
              <TrendingUp className="mr-2 h-4 w-4" />
              <span>Trends</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Quick Actions">
            <CommandItem onSelect={() => runCommand(() => router.push('/admin/products'))}>
              <PlusCircle className="mr-2 h-4 w-4 text-emerald-500" />
              <span>Add New Product</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push('/admin/batch-tasks'))}>
              <Layers className="mr-2 h-4 w-4 text-blue-500" />
              <span>Run Batch Price / Stock Task</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => window.open('/store', '_blank'))}>
              <ExternalLink className="mr-2 h-4 w-4" />
              <span>Open Public Storefront</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
