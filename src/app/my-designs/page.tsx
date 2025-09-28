
'use client';

import * as React from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { Loader2, Palette, XCircle, CheckCircle, Clock } from 'lucide-react';
import { MobileHeader } from '@/components/mobile-header';
import { MobileFooter } from '@/components/mobile-footer';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import Image from 'next/image';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const RAZORPAY_KEY_ID = "rzp_live_RKLAWS1cKI9YWZ";

type DesignStatus = 'pending' | 'approved' | 'rejected' | 'paid';

type CustomDesign = {
  _id: string;
  designUrl: string;
  tshirtColor: string;
  tshirtSize: string;
  status: DesignStatus;
  price?: number;
  createdAt: string;
};

export default function MyDesignsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [designs, setDesigns] = React.useState<CustomDesign[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isProcessingPayment, setIsProcessingPayment] = React.useState<string | null>(null);
  const { toast } = useToast();

  React.useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);
  
  const fetchDesigns = React.useCallback(async () => {
    if (user?._id) {
      try {
        setLoading(true);
        const response = await fetch(`/api/users/${user._id}/custom-designs`);
        if (!response.ok) {
          throw new Error('Failed to fetch designs');
        }
        const data = await response.json();
        setDesigns(data);
      } catch (error) {
        console.error(error);
        toast({
          title: 'Error fetching designs',
          description: 'Could not load your custom designs.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    }
  }, [user?._id, toast]);


  React.useEffect(() => {
    fetchDesigns();
  }, [fetchDesigns]);

  const handlePayNow = async (design: CustomDesign) => {
    if (!user || !design.price) return;
    
    setIsProcessingPayment(design._id);

    try {
      const razorpayOrderResponse = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: design.price }),
      });

      if (!razorpayOrderResponse.ok) throw new Error('Failed to create Razorpay order');
      const razorpayOrder = await razorpayOrderResponse.json();

      const options = {
        key: RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'Oktopus Clothing - Custom Design',
        description: `Payment for Design #${design._id.slice(-6)}`,
        order_id: razorpayOrder.id,
        handler: async function (response: any) {
            try {
                const verifyResponse = await fetch('/api/payment/verify-payment', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature,
                        internal_order_id: design._id,
                        order_type: 'custom_design'
                    })
                });

                if (verifyResponse.ok) {
                    router.push('/payment-success');
                } else {
                     throw new Error('Payment verification failed');
                }
            } catch (error) {
                 toast({ title: "Payment Verification Failed", description: "Please contact support for assistance.", variant: "destructive" });
            } finally {
                setIsProcessingPayment(null);
            }
        },
        prefill: {
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
        },
        theme: {
          color: "#FBBF24"
        }
      };
      
      const rzp1 = new window.Razorpay(options);
      rzp1.on('payment.failed', function (response: any){
              toast({ title: 'Payment Failed', description: response.error.description, variant: 'destructive' });
              setIsProcessingPayment(null);
      });
      rzp1.open();
    } catch (error) {
      console.error("Payment error:", error);
      toast({ title: "Error", description: "Something went wrong during payment. Please try again.", variant: "destructive" });
      setIsProcessingPayment(null);
    }
  };


   const getStatusVariant = (status: string) => {
    switch (status) {
      case 'approved':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'rejected':
        return 'destructive';
      case 'paid':
        return 'outline';
      default:
        return 'secondary';
    }
  };
  
   const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'paid':
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
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
    <>
      {/* Desktop View */}
      <div className="hidden md:flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow container mx-auto px-4 py-8">
              <h1 className="text-3xl font-bold mb-8">My Custom Designs</h1>
              <Card>
                  <CardHeader>
                      <CardTitle>Your Submissions</CardTitle>
                      <CardDescription>Track the status of your custom design requests.</CardDescription>
                  </CardHeader>
                  <CardContent>
                      {designs.length > 0 ? (
                        <div className="space-y-4">
                        {designs.map((design) => (
                            <div key={design._id} className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="flex items-center gap-4">
                                    <Image src={design.designUrl} alt={`Design ${design._id}`} width={60} height={60} className="rounded-md bg-muted" />
                                    <div>
                                        <p className="font-semibold">Design #{design._id.slice(-6)}</p>
                                        <p className="text-sm text-muted-foreground">Submitted on {format(new Date(design.createdAt), 'PP')}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                     <div className="flex items-center gap-2">
                                        {getStatusIcon(design.status)}
                                        <Badge variant={getStatusVariant(design.status)}>{design.status}</Badge>
                                    </div>
                                    {design.status === 'approved' && design.price && (
                                        <Button onClick={() => handlePayNow(design)} disabled={isProcessingPayment === design._id}>
                                            {isProcessingPayment === design._id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                            Pay ₹{design.price.toFixed(2)}
                                        </Button>
                                    )}
                                     {design.status === 'paid' && (
                                        <Button variant="outline" asChild>
                                            <Link href="/orders">View Order</Link>
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                            <Palette className="mx-auto h-12 w-12 text-muted-foreground" />
                            <h2 className="mt-4 text-xl font-semibold">No designs submitted</h2>
                            <p className="mt-2 text-sm text-muted-foreground">Ready to create something unique?</p>
                            <Button asChild className="mt-6">
                                <Link href="/custom-design">Submit a Design</Link>
                            </Button>
                        </div>
                      )}
                  </CardContent>
              </Card>
          </main>
          <Footer />
      </div>

      {/* Mobile View */}
      <div className="md:hidden">
        <MobileHeader title="My Designs" />
        <main className="bg-secondary min-h-screen pb-24 p-4">
          {designs.length > 0 ? (
            <div className="space-y-4">
              {designs.map((design) => (
                <Card key={design._id} className="card-glass">
                  <CardHeader>
                    <CardTitle className="text-base flex justify-between items-center">
                      <span>Design #{design._id.slice(-6)}</span>
                      <Badge variant={getStatusVariant(design.status)}>{design.status}</Badge>
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">{format(new Date(design.createdAt), 'PP')}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                        <Image src={design.designUrl} alt={`Design ${design._id}`} width={80} height={80} className="rounded-md bg-muted" />
                        <div>
                            <p><strong>Size:</strong> {design.tshirtSize}</p>
                            <p><strong>Color:</strong> <span className="inline-block h-4 w-4 rounded-full border" style={{backgroundColor: design.tshirtColor}} /></p>
                            {design.price && <p className="font-bold text-lg mt-2">₹{design.price.toFixed(2)}</p>}
                        </div>
                    </div>
                  </CardContent>
                  {design.status === 'approved' && design.price && (
                      <CardFooter>
                        <Button className="w-full" onClick={() => handlePayNow(design)} disabled={isProcessingPayment === design._id}>
                             {isProcessingPayment === design._id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Proceed to Payment
                        </Button>
                      </CardFooter>
                  )}
                  {design.status === 'paid' && (
                     <CardFooter>
                        <Button className="w-full" variant="outline" asChild>
                            <Link href="/orders">View Order</Link>
                        </Button>
                      </CardFooter>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center mt-20">
              <Palette className="mx-auto h-12 w-12 text-muted-foreground" />
              <h2 className="mt-4 text-xl font-semibold">No designs submitted</h2>
              <p className="mt-2 text-sm text-muted-foreground">Ready to create something unique?</p>
              <Button asChild className="mt-6">
                <Link href="/custom-design">Submit a Design</Link>
              </Button>
            </div>
          )}
        </main>
        <MobileFooter />
      </div>
    </>
  );
}

    