
'use client';

import * as React from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { Loader2, Package } from 'lucide-react';
import { MobileHeader } from '@/components/mobile-header';
import { MobileFooter } from '@/components/mobile-footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

type Order = {
  _id: string;
  products: { name: string; quantity: number; price: number }[];
  total: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered';
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
          // This endpoint needs to be created to fetch orders for a specific user
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

   const getStatusVariant = (status: string) => {
    switch (status) {
      case 'paid':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'shipped':
        return 'outline';
      case 'delivered':
        return 'destructive'; // Can be changed
      default:
        return 'secondary';
    }
  };


  if (authLoading || loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="md:hidden">
      <MobileHeader title="My Orders" />
      <main className="bg-secondary min-h-screen pb-24 p-4">
        {orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order._id} className="bg-white">
                <CardHeader>
                  <CardTitle className="text-base flex justify-between items-center">
                    <span>Order #{order._id.slice(-6)}</span>
                    <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
                  </CardTitle>
                   <p className="text-xs text-muted-foreground">{format(new Date(order.createdAt), 'PP')}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {order.products.map((p, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span>{p.name} (x{p.quantity})</span>
                        <span>₹{(p.price * p.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                   <div className="border-t my-2" />
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>₹{order.total.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center mt-20">
            <Package className="mx-auto h-12 w-12 text-muted-foreground" />
            <h2 className="mt-4 text-xl font-semibold">No orders yet</h2>
            <p className="mt-2 text-sm text-muted-foreground">You haven't placed any orders with us.</p>
            <Button asChild className="mt-6">
                <Link href="/store">Start Shopping</Link>
            </Button>
          </div>
        )}
      </main>
      <MobileFooter />
    </div>
  );
}
