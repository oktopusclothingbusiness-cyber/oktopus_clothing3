
'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShoppingBag, Users, PanelLeft, Package, Shirt, Megaphone, Shapes, Palette, Ticket, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { Loader2, ShieldAlert } from 'lucide-react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  if (authLoading) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Authenticating...</p>
      </div>
    )
  }

  if (user?.role !== 'admin') {
    return (
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow container mx-auto p-4 md:p-8 flex items-center justify-center">
              <Card className="w-full max-w-md text-center">
                <CardHeader>
                  <CardTitle className="flex items-center justify-center gap-2">
                    <ShieldAlert className="h-6 w-6 text-destructive" />
                    Access Denied
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>You do not have permission to view this page. Please log in as an administrator.</p>
                </CardContent>
                <CardFooter>
                   <Button className="w-full" onClick={() => router.push('/login')}>Go to Login</Button>
                </CardFooter>
              </Card>
          </main>
          <Footer />
      </div>
    )
  }

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: Home },
    { href: '/admin/products', label: 'Products', icon: Shirt },
    { href: '/admin/categories', label: 'Categories', icon: Shapes },
    { href: '/admin/orders', label: 'Orders', icon: Package },
    { href: '/admin/promotions', label: 'Promotions', icon: Megaphone },
    { href: '/admin/coupons', label: 'Coupons', icon: Ticket },
    { href: '/admin/custom-designs', label: 'Custom Designs', icon: Palette },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-secondary/50">
        <aside className={cn("flex-col border-r bg-background transition-all duration-300", isSidebarOpen ? 'w-64' : 'w-20')}>
            <div className="flex h-16 items-center border-b px-6">
                <Link href="/admin" className="flex items-center gap-2 font-semibold">
                    <ShoppingBag className="h-6 w-6" />
                    <span className={cn(isSidebarOpen ? "opacity-100" : "opacity-0 hidden")}>Admin</span>
                </Link>
                <Button variant="ghost" size="icon" className="ml-auto" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                    <PanelLeft className="h-5 w-5" />
                </Button>
            </div>
            <nav className="flex-1 space-y-2 p-4">
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                            pathname === item.href && "bg-secondary text-primary"
                        )}
                    >
                        <item.icon className="h-5 w-5" />
                        <span className={cn("truncate", isSidebarOpen ? 'inline-block' : 'hidden')}>{item.label}</span>
                    </Link>
                ))}
            </nav>
        </aside>
        <div className="flex flex-col flex-1">
            <Header />
            <main className="flex-1 p-4 md:p-8">
                {children}
            </main>
            <Footer />
        </div>
    </div>
  );
}
