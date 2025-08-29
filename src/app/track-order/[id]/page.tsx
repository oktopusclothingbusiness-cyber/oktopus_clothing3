
'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Package, CheckCircle, XCircle, Truck, PackageCheck, PackageOpen, User as UserIcon, MapPin, ArrowLeft, CreditCard } from 'lucide-react';
import { MobileHeader } from '@/components/mobile-header';
import { MobileFooter } from '@/components/mobile-footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

type OrderStatus = 'pending' | 'accepted' | 'rejected' | 'packed' | 'shipped' | 'delivered' | 'paid';

type Order = {
  _id: string;
  products: { name: string; quantity: number; price: number, size: string, color: string }[];
  total: number;
  status: OrderStatus;
  createdAt: string;
  shippingAddress: {
    mobile: string;
    address: string;
    instructions: string;
  };
   paymentDetails: { 
    razorpay_payment_id?: string;
    paymentStatus?: 'paid' | 'pending' 
  };
};

const statusSteps = [
    { status: 'accepted', label: 'Order Accepted', icon: CheckCircle },
    { status: 'packed', label: 'Order Packed', icon: PackageCheck },
    { status: 'shipped', label: 'Order Shipped', icon: Truck },
    { status: 'delivered', label: 'Order Delivered', icon: PackageOpen },
];

export default function TrackOrderDetailPage() {
    const params = useParams();
    const orderId = params.id as string;
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [order, setOrder] = React.useState<Order | null>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    React.useEffect(() => {
        const fetchOrder = async () => {
            if (orderId) {
                try {
                    setLoading(true);
                    const response = await fetch(`/api/orders/${orderId}`);
                    if (!response.ok) {
                        throw new Error('Failed to fetch order details');
                    }
                    const data = await response.json();
                    setOrder(data);
                } catch (error) {
                    toast({
                        title: 'Error',
                        description: 'Could not load order details.',
                        variant: 'destructive',
                    });
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchOrder();
    }, [orderId, toast]);
    
    const currentStatusIndex = statusSteps.findIndex(step => step.status === order?.status);
    const isRejected = order?.status === 'rejected';

    if (authLoading || loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }
    
    if (!order) {
        return (
            <>
                <div className="hidden md:block">
                    <Header />
                     <main className="flex-grow container mx-auto px-4 py-8 text-center">
                        <XCircle className="mx-auto h-12 w-12 text-destructive" />
                        <h2 className="mt-4 text-xl font-semibold">Order Not Found</h2>
                        <p className="mt-2 text-sm text-muted-foreground">We couldn't find details for this order.</p>
                        <Button asChild className="mt-6">
                            <Link href="/orders">Back to Orders</Link>
                        </Button>
                    </main>
                    <Footer />
                </div>
                 <div className="md:hidden">
                    <MobileHeader title="Track Order" />
                    <main className="bg-secondary min-h-screen pb-24 p-4 text-center">
                        <XCircle className="mx-auto h-12 w-12 text-destructive" />
                        <h2 className="mt-4 text-xl font-semibold">Order Not Found</h2>
                        <p className="mt-2 text-sm text-muted-foreground">We couldn't find details for this order.</p>
                        <Button asChild className="mt-6">
                            <Link href="/orders">Back to Orders</Link>
                        </Button>
                    </main>
                    <MobileFooter />
                </div>
            </>
        )
    }

    return (
        <>
        {/* Desktop View */}
        <div className="hidden md:flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow container mx-auto px-4 py-8">
            <div className="flex items-center gap-4 mb-8">
                <Button variant="outline" size="icon" onClick={() => router.push('/orders')}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">Order Details</h1>
                    <p className="text-muted-foreground">Order #{order._id.slice(-6)} &bull; Placed on {format(new Date(order.createdAt), 'PP')}</p>
                </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
                 <div className="md:col-span-2 space-y-8">
                     <Card>
                        <CardHeader>
                            <CardTitle>Order Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                             {isRejected ? (
                                <div className="flex items-center gap-4 p-4 rounded-lg bg-destructive/10 text-destructive">
                                    <XCircle className="h-8 w-8" />
                                    <div>
                                        <h3 className="font-bold">Order Rejected</h3>
                                        <p className="text-sm">Unfortunately, this order was rejected. Please contact support for more information.</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="relative space-y-12 py-4">
                                    <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gray-200 dark:bg-gray-700" />
                                    {statusSteps.map((step, index) => {
                                        const isActive = index <= currentStatusIndex;
                                        const isCurrent = index === currentStatusIndex;
                                        return (
                                            <div key={step.status} className="flex items-center gap-4 relative">
                                                <div className={cn("flex h-8 w-8 items-center justify-center rounded-full z-10", isActive ? "bg-primary text-primary-foreground" : "bg-gray-200 text-muted-foreground dark:bg-gray-700")}>
                                                    <step.icon className="h-5 w-5" />
                                                </div>
                                                <p className={cn("font-semibold", isCurrent ? "text-primary" : "text-muted-foreground")}>{step.label}</p>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Order Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Product</TableHead>
                                        <TableHead>Details</TableHead>
                                        <TableHead>Quantity</TableHead>
                                        <TableHead className="text-right">Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {order.products.map((item, index) => (
                                        <TableRow key={index}>
                                            <TableCell className="font-medium">{item.name}</TableCell>
                                            <TableCell>Size: {item.size}, Color: {item.color}</TableCell>
                                            <TableCell>{item.quantity}</TableCell>
                                            <TableCell className="text-right">₹{(item.price * item.quantity).toFixed(2)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                         <CardFooter className="justify-end bg-secondary/50 p-4 font-bold">
                           <div className="flex items-center gap-4">
                             <span>Total:</span>
                             <span>₹{order.total.toFixed(2)}</span>
                           </div>
                        </CardFooter>
                    </Card>
                 </div>
                 <div className="space-y-8">
                     <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5" />Shipping Address</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-1 text-sm">
                            <p className="font-medium">{user?.firstName} {user?.lastName}</p>
                            <p>{order.shippingAddress.address}</p>
                            <p>Mobile: {order.shippingAddress.mobile}</p>
                            {order.shippingAddress.instructions && <p className="text-xs text-muted-foreground pt-2"><strong>Instructions:</strong> {order.shippingAddress.instructions}</p>}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5" />Payment</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {order.paymentDetails?.paymentStatus === 'paid' ? (
                                <>
                                    <p>Paid via Razorpay</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Ref: {order.paymentDetails.razorpay_payment_id}
                                    </p>
                                </>
                            ) : (
                                <p>Pending</p>
                            )}
                        </CardContent>
                    </Card>
                 </div>
            </div>

          </main>
          <Footer />
        </div>

        {/* Mobile View */}
        <div className="md:hidden">
            <MobileHeader title={`Order #${order._id.slice(-6)}`} />
            <main className="bg-secondary min-h-screen pb-24 p-4">
                <Card className="card-glass">
                    <CardHeader>
                        <CardTitle>Order Status</CardTitle>
                        <CardDescription>{format(new Date(order.createdAt), 'PPpp')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isRejected ? (
                            <div className="flex items-center gap-4 p-4 rounded-lg bg-destructive/10 text-destructive">
                                <XCircle className="h-8 w-8" />
                                <div>
                                    <h3 className="font-bold">Order Rejected</h3>
                                    <p className="text-sm">Unfortunately, this order was rejected. Please contact support for more information.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="relative space-y-8">
                                <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gray-200" />
                                {statusSteps.map((step, index) => {
                                    const isActive = index <= currentStatusIndex;
                                    const isCurrent = index === currentStatusIndex;
                                    return (
                                        <div key={step.status} className="flex items-center gap-4 relative">
                                            <div className={cn("flex h-8 w-8 items-center justify-center rounded-full z-10", isActive ? "bg-primary text-primary-foreground" : "bg-gray-200 text-muted-foreground")}>
                                                <step.icon className="h-5 w-5" />
                                            </div>
                                            <p className={cn("font-semibold", isCurrent ? "text-primary" : "text-muted-foreground")}>{step.label}</p>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                         <div className="border-t my-4" />
                          <h3 className="font-bold mb-2">Order Summary</h3>
                          <div className="space-y-1">
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
            </main>
            <MobileFooter />
        </div>
        </>
    );
}
