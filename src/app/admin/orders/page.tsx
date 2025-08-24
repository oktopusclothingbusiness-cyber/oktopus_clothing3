
'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type OrderStatus = 'pending' | 'accepted' | 'rejected' | 'packed' | 'shipped' | 'delivered' | 'paid';

type Order = {
  _id: string;
  userId: string;
  userName: string;
  products: { name: string; quantity: number; price: number }[];
  total: number;
  shippingAddress: {
    mobile: string;
    address: string;
    instructions: string;
  };
  status: OrderStatus;
  createdAt: string;
  paymentDetails: { razorpay_payment_id?: string };
};

export default function OrdersPage() {
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { toast } = useToast();

  const fetchOrders = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/orders');
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error fetching orders',
        description: 'Could not load orders from the database.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        throw new Error('Failed to update order status');
      }
      toast({
        title: 'Order Status Updated',
        description: `Order has been marked as ${status}.`,
      });
      // Refresh orders
      fetchOrders();
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Failed to update order status.',
        variant: 'destructive',
      });
    }
  };


  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'paid':
      case 'accepted':
      case 'packed':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'shipped':
        return 'outline';
      case 'delivered':
        return 'default'; // Success state could be different
      case 'rejected':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const statusOptions: OrderStatus[] = ['pending', 'accepted', 'rejected', 'packed', 'shipped', 'delivered'];

  return (
    <>
      <h1 className="text-3xl font-bold mb-8">Order Management</h1>
      <Card>
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
          <CardDescription>View and manage all customer orders.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Order Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Shipping Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                    </TableRow>
                  ))
                ) : orders.length > 0 ? (
                  orders.map((order) => (
                    <TableRow key={order._id}>
                      <TableCell className="font-mono text-xs">#{order._id.slice(-6)}</TableCell>
                      <TableCell className="font-medium">{order.userName}</TableCell>
                      <TableCell>{format(new Date(order.createdAt), 'PPpp')}</TableCell>
                      <TableCell>
                        <Select
                          defaultValue={order.status}
                          onValueChange={(value: OrderStatus) => handleStatusChange(order._id, value)}
                          disabled={order.status === 'paid'}
                        >
                           <SelectTrigger className="w-[140px]">
                              <SelectValue>
                                 <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
                              </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {statusOptions.map(status => (
                                <SelectItem key={status} value={status}>
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        {order.status === 'paid' ? (
                            <Badge variant="default">Paid</Badge>
                        ) : (
                            <Badge variant="secondary">Pending</Badge>
                        )}
                      </TableCell>
                      <TableCell>₹{order.total.toFixed(2)}</TableCell>
                      <TableCell>
                        {order.products.map(p => `${p.name} (x${p.quantity})`).join(', ')}
                      </TableCell>
                       <TableCell>
                        <div className="text-sm">
                            <p>{order.shippingAddress.address}</p>
                            <p>Ph: {order.shippingAddress.mobile}</p>
                            {order.shippingAddress.instructions && <p>Notes: {order.shippingAddress.instructions}</p>}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center h-24">
                      No orders found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
