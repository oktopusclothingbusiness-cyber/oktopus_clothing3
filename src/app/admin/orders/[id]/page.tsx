
'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, User, MapPin, CreditCard, Package, FileText, Send } from 'lucide-react';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import LocationMap from '@/components/location-map';
import Link from 'next/link';

type OrderStatus = 'pending' | 'accepted' | 'rejected' | 'packed' | 'shipped' | 'delivered';

type OrderProduct = {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  size: string;
  color: string;
}

type Order = {
  _id: string;
  userId: string;
  userName: string;
  products: OrderProduct[];
  total: number;
  shippingAddress: {
    mobile: string;
    address: string;
    instructions: string;
    latitude?: number;
    longitude?: number;
  };
  status: OrderStatus;
  createdAt: string;
  paymentDetails: { 
    razorpay_payment_id?: string;
    paymentStatus?: 'paid' | 'pending' 
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
                        variant: 'destructive'
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
                variant: 'destructive'
            });
        } finally {
            setIsSendingInvoice(false);
        }
    }
    
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


    if (loading) {
        return (
            <div className="space-y-8">
                <Skeleton className="h-10 w-48" />
                <div className="grid gap-8 md:grid-cols-3">
                    <div className="md:col-span-2 space-y-8">
                        <Skeleton className="h-64 w-full" />
                        <Skeleton className="h-48 w-full" />
                    </div>
                    <div className="space-y-8">
                        <Skeleton className="h-48 w-full" />
                        <Skeleton className="h-48 w-full" />
                         <Skeleton className="h-64 w-full" />
                    </div>
                </div>
            </div>
        )
    }

    if (!order) {
        return <p>Order not found.</p>
    }

    const { latitude, longitude } = order.shippingAddress;
    const hasCoordinates = typeof latitude === 'number' && typeof longitude === 'number';

    return (
        <>
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => router.push('/admin/orders')}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Order #{order._id.slice(-6)}</h1>
                        <p className="text-muted-foreground">{format(new Date(order.createdAt), 'PPpp')}</p>
                    </div>
                </div>
                 <div className="flex items-center gap-2">
                    {order.paymentDetails?.paymentStatus === 'paid' && (
                        <>
                            <Button asChild>
                                <Link href={`/invoice/${order._id}`} target="_blank">
                                    <FileText className="mr-2 h-4 w-4" />
                                    View Invoice
                                </Link>
                            </Button>
                            <Button variant="outline" onClick={handleSendInvoice} disabled={isSendingInvoice}>
                                {isSendingInvoice ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Send className="mr-2 h-4 w-4" />
                                )}
                                Send Invoice
                            </Button>
                        </>
                    )}
                </div>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
                <div className="md:col-span-2 space-y-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2"><Package className="h-5 w-5"/>Order Summary</CardTitle>
                             <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Product</TableHead>
                                        <TableHead>Details</TableHead>
                                        <TableHead>Quantity</TableHead>
                                        <TableHead>Price</TableHead>
                                        <TableHead className="text-right">Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {order.products.map((item, index) => (
                                        <TableRow key={index}>
                                            <TableCell className="font-medium">
                                                <div>{item.name}</div>
                                                <div className="text-xs text-muted-foreground font-mono">#{item.productId?.slice(-6) || 'N/A'}</div>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                <div>Size: {item.size}</div>
                                                <div>Color: {item.color}</div>
                                            </TableCell>
                                            <TableCell>{item.quantity}</TableCell>
                                            <TableCell>₹{item.price.toFixed(2)}</TableCell>
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
                            <CardTitle className="flex items-center gap-2"><User className="h-5 w-5" />Customer</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-1">
                            <p className="font-medium">{order.userName}</p>
                            <p className="text-sm text-muted-foreground">User ID: {order.userId}</p>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5" />Shipping Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div>
                                <h4 className="font-semibold text-sm">Address</h4>
                                <p className="text-sm">{order.shippingAddress.address}</p>
                            </div>
                             <div>
                                <h4 className="font-semibold text-sm">Mobile</h4>
                                <p className="text-sm">{order.shippingAddress.mobile}</p>
                            </div>
                            {order.shippingAddress.instructions && 
                                <div>
                                    <h4 className="font-semibold text-sm">Instructions</h4>
                                    <p className="text-sm text-muted-foreground">{order.shippingAddress.instructions}</p>
                                </div>
                            }
                             {hasCoordinates && (
                                <div>
                                    <h4 className="font-semibold text-sm">Coordinates</h4>
                                    <p className="text-sm font-mono">{latitude?.toFixed(5)}, {longitude?.toFixed(5)}</p>
                                </div>
                             )}
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5" />Payment</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {order.paymentDetails?.paymentStatus === 'paid' ? (
                                <>
                                    <Badge variant="default">Paid</Badge>
                                    <p className="text-xs text-muted-foreground mt-2">
                                        Payment ID: {order.paymentDetails.razorpay_payment_id}
                                    </p>
                                </>
                            ) : (
                                <Badge variant="secondary">Pending</Badge>
                            )}
                        </CardContent>
                    </Card>

                    {hasCoordinates && (
                       <LocationMap latitude={latitude!} longitude={longitude!} />
                    )}
                </div>
            </div>
        </>
    )
}
    

    
