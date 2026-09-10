'use client';

import * as React from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { Loader2, Package, ShoppingBag, Truck } from 'lucide-react';
import { MobileHeader } from '@/components/mobile-header';
import { MobileFooter } from '@/components/mobile-footer';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { StorefrontHeader } from '@/components/storefront/header';
import { StorefrontFooter } from '@/components/storefront/footer';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type OrderStatus = 'pending' | 'accepted' | 'rejected' | 'packed' | 'shipped' | 'delivered' | 'paid';

type Order = {
  _id: string;
  products: { name: string; quantity: number; price: number }[];
  total: number;
  status: OrderStatus;
  createdAt: string;
};

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { toast } = useToast();

  React.useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  React.useEffect(() => {
    const fetchOrders = async () => {
      if (user?._id) {
        try {
          setLoading(true);
          const response = await fetch(`/api/users/${user._id}/orders`);
          if (!response.ok) {
            throw new Error('Failed to fetch orders');
          }
          const data = await response.json();
          setOrders(data);
        } catch (error) {
          console.error(error);
          toast({
            title: 'Error fetching orders',
            description: 'Could not load your orders.',
            variant: 'destructive',
          });
        } finally {
          setLoading(false);
        }
      }
    };
    fetchOrders();
  }, [user?._id, toast]);

  if (authLoading || loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0A0A0A] text-white font-mono">
        <Loader2 className="h-8 w-8 animate-spin text-[#0F824B]" />
      </div>
    );
  }

  return (
    <div className="bg-[#0A0A0A] text-[#FAF9F6] font-sans min-h-screen">
      {/* Desktop View */}
      <div className="hidden md:flex flex-col min-h-screen">
        <StorefrontHeader />
        <main className="flex-grow container mx-auto px-6 lg:px-12 py-12">
          <h1 className="text-4xl font-black font-bebas uppercase tracking-wider text-white mb-8 flex items-center gap-3">
            <Package className="h-8 w-8 text-[#0F824B]" />
            MY ORDER HISTORY ({orders.length})
          </h1>

          <Card className="bg-[#121212] border-white/10 text-white shadow-2xl rounded-2xl">
            <CardHeader className="border-b border-white/10 pb-4">
              <CardTitle className="font-bebas text-2xl uppercase tracking-wide">PAST PURCHASES & TRACKING</CardTitle>
              <CardDescription className="text-zinc-400 font-mono text-xs">View fulfillment status and delivery details of your streetwear orders.</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-transparent">
                    <TableHead className="text-zinc-400 font-mono text-xs">Order ID</TableHead>
                    <TableHead className="text-zinc-400 font-mono text-xs">Order Date</TableHead>
                    <TableHead className="text-zinc-400 font-mono text-xs">Status</TableHead>
                    <TableHead className="text-zinc-400 font-mono text-xs">Total Amount</TableHead>
                    <TableHead className="text-right text-zinc-400 font-mono text-xs">Tracking Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.length > 0 ? (
                    orders.map((order) => (
                      <TableRow key={order._id} className="border-white/10 hover:bg-white/5 font-mono text-xs">
                        <TableCell className="font-bold text-[#0F824B]">#{order._id.slice(-8).toUpperCase()}</TableCell>
                        <TableCell className="text-zinc-300">{format(new Date(order.createdAt), 'PP')}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-[#0F824B]/10 text-[#0F824B] border-[#0F824B]/30 uppercase font-mono text-[10px] px-2.5 py-0.5">
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-bold text-white">₹{order.total.toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" asChild className="rounded-full border-white/20 text-white hover:bg-[#0F824B] hover:text-black font-mono text-[11px] font-bold">
                            <Link href={order?._id ? `/track-order/${order._id}` : '/orders'}>Track Shipment →</Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center h-40">
                        <div className="flex flex-col items-center gap-3 font-mono text-zinc-400">
                          <ShoppingBag className="h-10 w-10 text-zinc-600" />
                          <p className="text-xs">You haven't placed any orders yet.</p>
                          <Button asChild className="mt-2 bg-[#0F824B] text-white font-bold text-xs rounded-full px-6">
                            <Link href="/products">Explore Catalog</Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </main>
        <StorefrontFooter />
      </div>

      {/* Mobile View */}
      <div className="md:hidden">
        <MobileHeader title="My Orders" />
        <main className="bg-[#0A0A0A] min-h-screen pb-24 p-4">
          {orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((order) => (
                <Card key={order._id} className="bg-[#121212] border-white/10 text-white rounded-2xl">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-mono flex justify-between items-center">
                      <span className="font-bold text-[#0F824B]">ORDER #{order._id.slice(-6).toUpperCase()}</span>
                      <Badge variant="outline" className="bg-[#0F824B]/10 text-[#0F824B] border-[#0F824B]/30 uppercase font-mono text-[9px]">
                        {order.status}
                      </Badge>
                    </CardTitle>
                    <p className="text-[10px] font-mono text-zinc-400">{format(new Date(order.createdAt), 'PP')}</p>
                  </CardHeader>
                  <CardContent className="font-mono text-xs space-y-2">
                    <div className="space-y-1.5 border-y border-white/5 py-2">
                      {order.products.map((p, i) => (
                        <div key={i} className="flex justify-between text-zinc-300">
                          <span className="truncate pr-4">{p.name} (x{p.quantity})</span>
                          <span className="font-bold text-white">₹{(p.price * p.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between font-bold pt-1 text-sm">
                      <span className="text-zinc-400">Total</span>
                      <span className="text-[#0F824B]">₹{order.total.toFixed(2)}</span>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-1">
                    <Button variant="outline" size="sm" className="w-full rounded-full border-white/20 text-white font-mono text-xs" asChild>
                      <Link href={order?._id ? `/track-order/${order._id}` : '/orders'}>Track Shipment</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center pt-20 p-6 space-y-4 font-mono">
              <Package className="mx-auto h-12 w-12 text-zinc-600" />
              <h2 className="text-xl font-bold font-bebas uppercase text-white">No Orders Found</h2>
              <p className="text-xs text-zinc-400">You haven't placed any orders with us yet.</p>
              <Button asChild className="bg-[#0F824B] text-white font-bold text-xs rounded-full px-6">
                <Link href="/products">Explore Catalog</Link>
              </Button>
            </div>
          )}
        </main>
        <MobileFooter />
      </div>
    </div>
  );
}
