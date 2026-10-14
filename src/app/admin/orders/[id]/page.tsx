'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Loader2, 
  User, 
  MapPin, 
  CreditCard, 
  Package, 
  FileText, 
  Send,
  Phone,
  Copy,
  Check,
  ExternalLink,
  Store,
  SlidersHorizontal,
  Navigation
} from 'lucide-react';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import LocationMap from '@/components/location-map';
import Link from 'next/link';
import { cn } from '@/lib/utils';

type OrderStatus = 'pending' | 'accepted' | 'rejected' | 'packed' | 'shipped' | 'delivered';

type OrderProduct = {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  size: string;
  color: string;
};

type Order = {
  _id: string;
  orderId?: string;
  invoiceNumber?: string;
  userId: string;
  userName: string;
  products: OrderProduct[];
  subtotal?: number;
  discount?: number;
  shipping?: number;
  total: number;
  shippingAddress: {
    mobile: string;
    address: string;
    instructions?: string;
    latitude?: number;
    longitude?: number;
  };
  status: OrderStatus;
  orderSource?: string;
  isOfflineSale?: boolean;
  createdAt: string;
  paymentDetails?: { 
    razorpay_payment_id?: string;
    paymentStatus?: 'paid' | 'pending';
    paymentMethod?: string;
  };
};

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const { toast } = useToast();
  const [order, setOrder] = React.useState<Order | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [isSendingInvoice, setIsSendingInvoice] = React.useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = React.useState(false);
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (id) {
      const fetchOrder = async () => {
        try {
          setLoading(true);
          const response = await fetch(`/api/orders/${id}`);
          if (!response.ok) throw new Error("Failed to fetch order");
          const data = await response.json();
          setOrder(data);
        } catch (error) {
          console.error(error);
          toast({
            title: 'Error',
            description: 'Could not load order details.',
            variant: 'destructive',
          });
        } finally {
          setLoading(false);
        }
      };
      fetchOrder();
    }
  }, [id, toast]);

  const handleSendInvoice = async () => {
    if (!id) return;
    setIsSendingInvoice(true);
    try {
      const response = await fetch('/api/emails/send-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: id }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to send invoice');
      }
      toast({
        title: 'Invoice Sent',
        description: 'The invoice has been successfully emailed to the customer.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Could not send the invoice.',
        variant: 'destructive',
      });
    } finally {
      setIsSendingInvoice(false);
    }
  };

  const handleStatusChange = async (newStatus: OrderStatus) => {
    if (!id || !order) return;
    setIsUpdatingStatus(true);
    try {
      const response = await fetch(`/api/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) {
        throw new Error('Failed to update status');
      }
      setOrder((prev) => (prev ? { ...prev, status: newStatus } : prev));
      toast({
        title: 'Status Updated',
        description: `Order marked as ${newStatus}.`,
      });
    } catch (error: any) {
      toast({
        title: 'Update Failed',
        description: error.message || 'Could not update order status.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast({ title: 'Copied to Clipboard', description: text });
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return { label: 'Accepted', className: 'bg-blue-500/10 text-blue-500 border-blue-500/30' };
      case 'packed':
        return { label: 'Packed', className: 'bg-purple-500/10 text-purple-500 border-purple-500/30' };
      case 'shipped':
        return { label: 'Shipped', className: 'bg-amber-500/10 text-amber-500 border-amber-500/30' };
      case 'delivered':
        return { label: 'Delivered', className: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' };
      case 'rejected':
      case 'cancelled':
        return { label: 'Rejected', className: 'bg-red-500/10 text-red-500 border-red-500/30' };
      case 'pending':
      default:
        return { label: 'Pending', className: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30' };
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto px-1 sm:px-4">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-8 space-y-6">
            <Skeleton className="h-64 w-full rounded-2xl" />
            <Skeleton className="h-48 w-full rounded-2xl" />
          </div>
          <div className="lg:col-span-4 space-y-6">
            <Skeleton className="h-48 w-full rounded-2xl" />
            <Skeleton className="h-48 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-16 text-center space-y-3">
        <p className="text-sm font-semibold text-muted-foreground">Order not found.</p>
        <Button variant="outline" size="sm" onClick={() => router.push('/admin/orders')}>
          Return to Orders
        </Button>
      </div>
    );
  }

  const { latitude, longitude } = order.shippingAddress || {};
  const hasCoordinates = typeof latitude === 'number' && typeof longitude === 'number';
  const orderIdentifier = order.orderId 
    ? String(order.orderId).replace(/^#/, '') 
    : order.invoiceNumber 
    ? String(order.invoiceNumber).replace(/^#/, '') 
    : order._id.slice(-6).toUpperCase();
  const statusInfo = getStatusBadge(order.status);
  const isOffline = Boolean(order.isOfflineSale || order.orderSource === 'offline');

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto px-1 sm:px-4">
      {/* RESPONSIVE HEADER BAR */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-2 border-b border-border/60">
        <div className="flex items-start sm:items-center gap-3 min-w-0">
          <Button 
            variant="outline" 
            size="icon" 
            className="h-9 w-9 shrink-0 rounded-xl mt-0.5 sm:mt-0" 
            onClick={() => router.push('/admin/orders')}
            title="Back to Orders List"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg sm:text-2xl font-black font-mono tracking-tight text-foreground truncate">
                Order #{orderIdentifier}
              </h1>
              <Badge variant="outline" className={cn("text-[10px] font-bold uppercase tracking-wider px-2 py-0.5", statusInfo.className)}>
                {statusInfo.label}
              </Badge>
              {isOffline && (
                <Badge variant="outline" className="text-[10px] font-bold border-emerald-500/40 bg-emerald-500/10 text-emerald-400 flex items-center gap-1">
                  <Store className="h-2.5 w-2.5" /> Offline Sale
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {format(new Date(order.createdAt), 'PPpp')}
            </p>
          </div>
        </div>

        {/* Action Buttons (Touch-Optimized for Mobile) */}
        <div className="flex items-center gap-2 w-full sm:w-auto pt-1 sm:pt-0">
          <Button asChild size="sm" className="flex-1 sm:flex-initial h-9 text-xs rounded-xl font-bold">
            <Link href={order?._id ? `/invoice/${order._id}` : '/admin/orders'} target="_blank">
              <FileText className="mr-1.5 h-3.5 w-3.5" />
              View Invoice
            </Link>
          </Button>

          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 sm:flex-initial h-9 text-xs rounded-xl font-bold" 
            onClick={handleSendInvoice} 
            disabled={isSendingInvoice}
          >
            {isSendingInvoice ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Send className="mr-1.5 h-3.5 w-3.5" />
            )}
            Send Invoice
          </Button>
        </div>
      </div>

      {/* PIPELINE STATUS CHANGER STRIP */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-card border border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-primary shrink-0" />
          <div className="text-xs">
            <span className="font-bold text-foreground">Fulfillment Pipeline:</span>
            <span className="text-muted-foreground ml-1.5">Update tracking progress for this order</span>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <select
            value={order.status}
            onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
            disabled={isUpdatingStatus}
            className="w-full sm:w-48 bg-muted/60 border border-border text-xs font-bold text-foreground rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
          >
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="packed">Packed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="rejected">Rejected</option>
          </select>
          {isUpdatingStatus && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground shrink-0" />}
        </div>
      </div>

      {/* MAIN TWO-COLUMN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
        
        {/* LEFT COLUMN: ORDER ITEMS & FINANCIALS (COL-SPAN-8) */}
        <div className="lg:col-span-8 space-y-4 sm:space-y-6">
          <Card className="rounded-2xl border-border/80 shadow-xs overflow-hidden">
            <CardHeader className="p-4 sm:p-5 flex flex-row items-center justify-between border-b border-border/50">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm sm:text-base font-bold">Purchased Items ({order.products?.length || 0})</CardTitle>
              </div>
              <Badge variant="outline" className={cn("text-[10px] font-bold px-2 py-0.5", statusInfo.className)}>
                {statusInfo.label}
              </Badge>
            </CardHeader>

            <CardContent className="p-0">
              {/* DESKTOP TABLE VIEW (HIDDEN ON MOBILE) */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="text-xs font-bold">Product</TableHead>
                      <TableHead className="text-xs font-bold">Variant</TableHead>
                      <TableHead className="text-xs font-bold text-center">Qty</TableHead>
                      <TableHead className="text-xs font-bold">Unit Price</TableHead>
                      <TableHead className="text-xs font-bold text-right">Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.products.map((item, index) => (
                      <TableRow key={index} className="hover:bg-muted/20">
                        <TableCell className="font-medium text-xs">
                          <div className="font-bold text-foreground">{item.name}</div>
                          <div className="text-[11px] text-muted-foreground font-mono">#{item.productId?.slice(-6) || 'N/A'}</div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-medium text-foreground">Size: {item.size}</span>
                            <span className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-medium text-foreground">Color: {item.color}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs font-bold text-center">{item.quantity}</TableCell>
                        <TableCell className="text-xs font-medium">₹{item.price.toFixed(2)}</TableCell>
                        <TableCell className="text-xs font-bold text-right">₹{(item.price * item.quantity).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* MOBILE CARDS VIEW (CLEAN, NO HORIZONTAL SCROLLING) */}
              <div className="md:hidden divide-y divide-border/60">
                {order.products.map((item, index) => (
                  <div key={index} className="p-3.5 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-foreground leading-snug">{item.name}</h4>
                        <span className="text-[10px] font-mono text-muted-foreground">#{item.productId?.slice(-6) || 'N/A'}</span>
                      </div>
                      <span className="text-xs font-black text-foreground shrink-0">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2 py-0.5 rounded bg-muted text-[10px] font-semibold text-foreground">
                          Size {item.size}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-muted text-[10px] font-semibold text-foreground">
                          {item.color}
                        </span>
                      </div>
                      <span className="text-[11px] text-muted-foreground font-medium">
                        Qty: <strong className="text-foreground">{item.quantity}</strong> × ₹{item.price.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>

            {/* FINANCIAL SUMMARY BREAKDOWN */}
            <CardFooter className="p-4 sm:p-5 bg-muted/30 border-t border-border/60 flex flex-col items-stretch space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Items Subtotal:</span>
                <span className="font-medium text-foreground">
                  ₹{(order.subtotal || order.products.reduce((acc, p) => acc + (p.price * p.quantity), 0)).toFixed(2)}
                </span>
              </div>

              {typeof order.discount === 'number' && order.discount > 0 && (
                <div className="flex items-center justify-between text-xs text-emerald-500 font-medium">
                  <span>Coupon Discount:</span>
                  <span>-₹{order.discount.toFixed(2)}</span>
                </div>
              )}

              {typeof order.shipping === 'number' && (
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Shipping Fee:</span>
                  <span className="font-medium text-foreground">
                    {order.shipping === 0 ? 'FREE' : `₹${order.shipping.toFixed(2)}`}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between text-sm sm:text-base font-black text-foreground pt-2 border-t border-border/60">
                <span>Order Total:</span>
                <span className="text-base sm:text-lg">₹{order.total.toFixed(2)}</span>
              </div>
            </CardFooter>
          </Card>
        </div>

        {/* RIGHT COLUMN: FULFILLMENT, CUSTOMER & MAP (COL-SPAN-4) */}
        <div className="lg:col-span-4 space-y-4 sm:space-y-6">
          
          {/* CUSTOMER PROFILE CARD */}
          <Card className="rounded-2xl border-border/80 shadow-xs">
            <CardHeader className="p-4 pb-3 flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-xs sm:text-sm font-bold">
                <User className="h-4 w-4 text-primary" /> Customer Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-2.5 text-xs">
              <div>
                <p className="font-bold text-sm text-foreground">{order.userName || 'Guest Customer'}</p>
                <p className="text-[11px] text-muted-foreground font-mono mt-0.5">User ID: {order.userId}</p>
              </div>

              {order.shippingAddress?.mobile && (
                <div className="flex items-center justify-between pt-1 border-t border-border/50">
                  <a 
                    href={`tel:${order.shippingAddress.mobile}`} 
                    className="text-primary hover:underline font-bold flex items-center gap-1.5"
                    title="Click to Call"
                  >
                    <Phone className="h-3.5 w-3.5 shrink-0" />
                    {order.shippingAddress.mobile}
                  </a>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground"
                    onClick={() => copyToClipboard(order.shippingAddress.mobile, 'phone')}
                  >
                    {copiedKey === 'phone' ? <Check className="h-3 w-3 text-emerald-500 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                    Copy
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* SHIPPING & DELIVERY CARD */}
          <Card className="rounded-2xl border-border/80 shadow-xs">
            <CardHeader className="p-4 pb-3 flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-xs sm:text-sm font-bold">
                <MapPin className="h-4 w-4 text-primary" /> Delivery Address
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-3 text-xs">
              <div>
                <p className="text-foreground leading-relaxed font-medium">
                  {order.shippingAddress?.address || 'No address provided'}
                </p>
              </div>

              {order.shippingAddress?.instructions && (
                <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">Delivery Instructions:</span>
                  <p className="text-[11px] text-foreground mt-0.5 leading-normal">
                    {order.shippingAddress.instructions}
                  </p>
                </div>
              )}

              {/* Action Buttons: Copy Address & Open in Google Maps */}
              <div className="flex items-center gap-2 pt-1 border-t border-border/50">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 h-8 text-[11px] rounded-lg font-semibold"
                  onClick={() => copyToClipboard(order.shippingAddress?.address || '', 'address')}
                >
                  {copiedKey === 'address' ? <Check className="h-3 w-3 text-emerald-500 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                  Copy Address
                </Button>

                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="flex-1 h-8 text-[11px] rounded-lg font-semibold"
                >
                  <a
                    href={
                      hasCoordinates
                        ? `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
                        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.shippingAddress?.address || '')}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Navigation className="h-3 w-3 mr-1" />
                    Open Map
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* PAYMENT DETAILS CARD */}
          <Card className="rounded-2xl border-border/80 shadow-xs">
            <CardHeader className="p-4 pb-3 flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-xs sm:text-sm font-bold">
                <CreditCard className="h-4 w-4 text-primary" /> Payment Status
              </CardTitle>
              {order.paymentDetails?.paymentStatus === 'paid' ? (
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30 text-[10px] font-bold">
                  Paid
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-zinc-500/10 text-zinc-400 border-zinc-500/30 text-[10px] font-bold">
                  {order.paymentDetails?.paymentStatus || 'Pending'}
                </Badge>
              )}
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Payment Method:</span>
                <span className="font-bold text-foreground">
                  {isOffline ? 'Offline / In-Store' : order.paymentDetails?.paymentMethod || 'Razorpay / Online'}
                </span>
              </div>

              {order.paymentDetails?.razorpay_payment_id && (
                <div className="flex items-center justify-between pt-1 border-t border-border/50">
                  <span className="text-muted-foreground">Transaction ID:</span>
                  <div className="flex items-center gap-1 font-mono text-[11px]">
                    <span className="truncate max-w-[120px]">{order.paymentDetails.razorpay_payment_id}</span>
                    <button 
                      onClick={() => copyToClipboard(order.paymentDetails?.razorpay_payment_id || '', 'payment')}
                      className="p-1 hover:text-foreground text-muted-foreground"
                      title="Copy Payment ID"
                    >
                      {copiedKey === 'payment' ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                    </button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* LOCATION MAP (TOUCH-RESPONSIVE) */}
          {hasCoordinates && (
            <div className="rounded-2xl overflow-hidden border border-border/80 shadow-xs">
              <LocationMap latitude={latitude!} longitude={longitude!} />
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
