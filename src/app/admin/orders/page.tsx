
'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Eye, PlusCircle, Store, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getShortOrderId } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { OfflineSaleDialog } from '@/components/admin/offline-sale-dialog';

type OrderStatus = 'pending' | 'accepted' | 'rejected' | 'packed' | 'shipped' | 'delivered';
type PaymentStatus = 'pending' | 'paid' | 'paid externally';

type Order = {
  _id: string;
  userId: string;
  userName: string;
  products: { productId: string; name: string; quantity: number; price: number }[];
  total: number;
  shippingAddress: {
    mobile: string;
    address: string;
    instructions: string;
  };
  status: OrderStatus;
  createdAt: string;
  paymentDetails: {
    razorpay_payment_id?: string;
    paymentStatus?: PaymentStatus;
    paymentMethod?: string;
  };
  orderSource?: 'online' | 'offline';
  isOfflineSale?: boolean;
};

export default function OrdersPage() {
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isOfflineModalOpen, setIsOfflineModalOpen] = React.useState(false);
  const { toast } = useToast();
  const router = useRouter();

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

  type OrderSortField = 'total' | 'createdAt' | 'status' | 'userName';
  type OrderSortOrder = 'asc' | 'desc';

  const [sortField, setSortField] = React.useState<OrderSortField>('createdAt');
  const [sortOrder, setSortOrder] = React.useState<OrderSortOrder>('desc');
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');

  const handleSort = (field: OrderSortField) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const filteredOrders = React.useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return orders.filter((order) => {
      // Status filter
      if (statusFilter !== 'all' && order.status !== statusFilter) {
        return false;
      }

      // Search query filter
      if (!q) return true;

      const orderId = (order._id || '').toLowerCase();
      const shortId = getShortOrderId(order._id).toLowerCase();
      const suffixId = orderId.slice(-6);
      const userName = (order.userName || '').toLowerCase();
      const mobile = (order.shippingAddress?.mobile || '').toLowerCase();
      const address = (order.shippingAddress?.address || '').toLowerCase();
      const paymentId = (order.paymentDetails?.razorpay_payment_id || '').toLowerCase();
      const productNames = (order.products || []).map((p) => (p.name || '').toLowerCase()).join(' ');

      return (
        orderId.includes(q) ||
        shortId.includes(q) ||
        suffixId.includes(q) ||
        userName.includes(q) ||
        mobile.includes(q) ||
        address.includes(q) ||
        paymentId.includes(q) ||
        productNames.includes(q)
      );
    });
  }, [orders, searchQuery, statusFilter]);

  const sortedOrders = React.useMemo(() => {
    return [...filteredOrders].sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      if (sortField === 'createdAt') {
        valA = new Date(valA || 0).getTime();
        valB = new Date(valB || 0).getTime();
      } else if (sortField === 'total') {
        valA = Number(valA || 0);
        valB = Number(valB || 0);
      } else {
        valA = (valA || '').toString().toLowerCase();
        valB = (valB || '').toString().toLowerCase();
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredOrders, sortField, sortOrder]);

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

  const handlePaymentStatusChange = async (orderId: string, paymentStatus: PaymentStatus) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus }),
      });
      if (!response.ok) {
        throw new Error('Failed to update payment status');
      }
      toast({
        title: 'Payment Status Updated',
        description: `Order payment status has been marked as ${paymentStatus}.`,
      });
      fetchOrders(); // Refresh to show updated status
    } catch (error) {
       console.error(error);
      toast({
        title: 'Error',
        description: 'Failed to update payment status.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete order');
      }
      setOrders(prevOrders => prevOrders.filter(order => order._id !== orderId));
      toast({
        title: 'Order Deleted',
        description: 'The order has been successfully deleted.',
      });
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Could not delete the order.',
        variant: 'destructive',
      });
    }
  };


  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'accepted':
      case 'packed':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'shipped':
        return 'outline';
      case 'delivered':
        return 'default';
      case 'rejected':
        return 'destructive';
      default:
        return 'secondary';
    }
  };
  
  const getPaymentStatusVariant = (status?: PaymentStatus) => {
    switch (status) {
        case 'paid':
            return 'default';
        case 'pending':
            return 'secondary';
        case 'paid externally':
            return 'outline';
        default:
            return 'secondary';
    }
  }

  const statusOptions: OrderStatus[] = ['pending', 'accepted', 'rejected', 'packed', 'shipped', 'delivered'];
  const paymentStatusOptions: PaymentStatus[] = ['pending', 'paid', 'paid externally'];

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Order Management</h1>
          <p className="text-sm text-muted-foreground mt-1">View and manage all customer orders, or record in-store offline counter sales.</p>
        </div>
        <Button
          onClick={() => setIsOfflineModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium flex items-center gap-2 shadow-md shrink-0"
        >
          <PlusCircle className="w-4 h-4" /> Record Offline Sale
        </Button>
      </div>
      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle>All Orders</CardTitle>
              <CardDescription>
                {searchQuery || statusFilter !== 'all'
                  ? `Showing ${sortedOrders.length} of ${orders.length} orders matching your filters.`
                  : `View and manage all ${orders.length} customer orders.`}
              </CardDescription>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search by Order ID (#short code or ID), customer name, phone, product, address, payment ref..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-9 h-10 w-full rounded-xl"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="w-full sm:w-48 shrink-0">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-10 rounded-xl">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {statusOptions.map((status) => (
                    <SelectItem key={status} value={status} className="capitalize">
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {(searchQuery || statusFilter !== 'all') && (
              <Button
                variant="ghost"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                }}
                className="h-10 text-xs text-muted-foreground hover:text-foreground shrink-0 rounded-xl"
              >
                Reset
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead className="cursor-pointer select-none hover:text-primary transition-colors" onClick={() => handleSort('userName')}>
                    Customer {sortField === 'userName' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                  </TableHead>
                  <TableHead className="cursor-pointer select-none hover:text-primary transition-colors" onClick={() => handleSort('createdAt')}>
                    Date {sortField === 'createdAt' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                  </TableHead>
                  <TableHead className="cursor-pointer select-none hover:text-primary transition-colors" onClick={() => handleSort('status')}>
                    Order Status {sortField === 'status' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                  </TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead className="cursor-pointer select-none hover:text-primary transition-colors" onClick={() => handleSort('total')}>
                    Total {sortField === 'total' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
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
                      <TableCell><Skeleton className="h-8 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                       <TableCell><Skeleton className="h-8 w-20" /></TableCell>
                    </TableRow>
                  ))
                ) : sortedOrders.length > 0 ? (
                  sortedOrders.map((order) => (
                    <TableRow key={order._id}>
                      <TableCell>
                         <span className="font-mono text-xs">#{order._id.slice(-6)}</span>
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span>{order.userName}</span>
                          {(order.isOfflineSale || order.orderSource === 'offline') && (
                            <Badge
                              variant="outline"
                              className="text-[10px] px-1.5 py-0 border-emerald-500/40 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 flex items-center gap-1 font-semibold"
                            >
                              <Store className="w-2.5 h-2.5" /> Offline
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{format(new Date(order.createdAt), 'PP')}</TableCell>
                      <TableCell>
                        <Select
                          defaultValue={order.status}
                          onValueChange={(value: OrderStatus) => handleStatusChange(order._id, value)}
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
                         <Select
                          value={order.paymentDetails?.paymentStatus || 'pending'}
                          onValueChange={(value: PaymentStatus) => handlePaymentStatusChange(order._id, value)}
                        >
                           <SelectTrigger className="w-[160px]">
                              <SelectValue>
                                 <Badge variant={getPaymentStatusVariant(order.paymentDetails?.paymentStatus)}>{order.paymentDetails?.paymentStatus || 'pending'}</Badge>
                              </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {paymentStatusOptions.map(status => (
                                <SelectItem key={status} value={status} disabled={status === 'paid'}>
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>₹{order.total.toFixed(2)}</TableCell>
                       <TableCell className="text-right">
                         <Button variant="ghost" size="icon" onClick={() => router.push(`/admin/orders/${order._id}`)}>
                            <Eye className="h-4 w-4" />
                         </Button>
                         <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete the order.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteOrder(order._id)}>
                                        Delete
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-36 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Search className="w-8 h-8 text-muted-foreground/40" />
                        <p className="font-semibold text-foreground text-sm">No matching orders found</p>
                        <p className="text-xs text-muted-foreground">
                          {searchQuery
                            ? `No results found for "${searchQuery}". Try a different keyword or order ID.`
                            : 'No orders match the selected filters.'}
                        </p>
                        {(searchQuery || statusFilter !== 'all') && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSearchQuery('');
                              setStatusFilter('all');
                            }}
                            className="mt-2 text-xs rounded-lg"
                          >
                            Clear Filters
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <OfflineSaleDialog
        open={isOfflineModalOpen}
        onOpenChange={setIsOfflineModalOpen}
        onOrderCreated={fetchOrders}
      />
    </>
  );
}
