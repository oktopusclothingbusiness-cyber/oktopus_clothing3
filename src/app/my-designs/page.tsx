
'use client';

import * as React from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { Loader2, Palette, XCircle, CheckCircle, Clock, MapPin } from 'lucide-react';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

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
  tshirtColor: string; // This is an image URL
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
  
  const [isAddressDialogOpen, setIsAddressDialogOpen] = React.useState(false);
  const [selectedDesign, setSelectedDesign] = React.useState<CustomDesign | null>(null);
  const [shippingAddress, setShippingAddress] = React.useState({
      mobile: '',
      address: '',
      instructions: '',
  });

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

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setShippingAddress(prev => ({...prev, [name]: value}));
  }

  const handleOpenAddressDialog = (design: CustomDesign) => {
    setSelectedDesign(design);
    setIsAddressDialogOpen(true);
  }

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDesign || !shippingAddress.mobile || !shippingAddress.address) {
      toast({ title: "Address Required", description: "Please fill in your mobile number and address.", variant: "destructive" });
      return;
    }
    
    try {
      // Save address to the custom design document
      const res = await fetch(`/api/custom-designs/${selectedDesign._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shippingAddress })
      });
      if (!res.ok) throw new Error('Failed to save shipping address');

      // Address saved, now proceed to payment
      setIsAddressDialogOpen(false);
      await handlePayNow(selectedDesign);

    } catch (error) {
        toast({ title: "Error", description: "Could not save shipping address. Please try again.", variant: "destructive" });
    }
  }


  const handlePayNow = async (design: CustomDesign) => {
    if (!user || !design.price) return;
    
    setIsProcessingPayment(design._id);

    try {
      const settingsRes = await fetch('/api/settings');
      const settings = await settingsRes.json();
      const shippingCharge = settings?.deliveryCharge || 0;
      const finalAmount = design.price + shippingCharge;

      const razorpayOrderResponse = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: finalAmount }),
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
                                        <Button onClick={() => handleOpenAddressDialog(design)} disabled={isProcessingPayment === design._id}>
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
                            <p className="flex items-center gap-2"><strong>Color:</strong> <Image src={design.tshirtColor} alt="T-shirt color" width={24} height={24} className="rounded-md object-cover" /></p>
                            {design.price && <p className="font-bold text-lg mt-2">₹{design.price.toFixed(2)}</p>}
                        </div>
                    </div>
                  </CardContent>
                  {design.status === 'approved' && design.price && (
                      <CardFooter>
                        <Button className="w-full" onClick={() => handleOpenAddressDialog(design)} disabled={isProcessingPayment === design._id}>
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

       <Dialog open={isAddressDialogOpen} onOpenChange={setIsAddressDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Shipping Information</DialogTitle>
                    <DialogDescription>Please provide your delivery details for this custom order.</DialogDescription>
                </DialogHeader>
                 <form onSubmit={handleAddressSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="mobile">Mobile Number</Label>
                        <Input id="mobile" name="mobile" value={shippingAddress.mobile} onChange={handleAddressChange} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="address">Full Address</Label>
                        <Textarea id="address" name="address" value={shippingAddress.address} onChange={handleAddressChange} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="instructions">Any Instructions (Optional)</Label>
                        <Textarea id="instructions" name="instructions" value={shippingAddress.instructions} onChange={handleAddressChange} />
                    </div>
                    <Button type="submit" className="w-full" disabled={!!isProcessingPayment}>
                         {isProcessingPayment ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</> : 'Save and Proceed to Payment'}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>

    </>
  );
}
