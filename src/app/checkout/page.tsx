
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/cart-context';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Loader2, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MobileHeader } from '@/components/mobile-header';
import { MobileFooter } from '@/components/mobile-footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const RAZORPAY_KEY_ID = 'rzp_live_RKLAWS1cKI9YWZ';

type ShippingFormProps = {
  shippingAddress: {
    mobile: string;
    address: string;
    instructions: string;
  };
  handleAddressChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleProceedToPayment: (e: React.FormEvent) => void;
  isProcessing: boolean;
  isMobile?: boolean;
};

const ShippingForm = ({
  shippingAddress,
  handleAddressChange,
  handleProceedToPayment,
  isProcessing,
  isMobile = false,
}: ShippingFormProps) => {
  const { toast } = useToast();
  const [isFetchingLocation, setIsFetchingLocation] = React.useState(false);

  const handleFetchLocation = async () => {
    if (!navigator.geolocation) {
      toast({ title: 'Geolocation is not supported by your browser', variant: 'destructive' });
      return;
    }

    setIsFetchingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`);
          if (!response.ok) throw new Error('Failed to fetch address.');
          const data = await response.json();

          if (data && data.display_name) {
            handleAddressChange({
                target: { name: 'address', value: data.display_name }
            } as React.ChangeEvent<HTMLInputElement>);
             handleAddressChange({
                target: { name: 'latitude', value: latitude }
            } as any);
             handleAddressChange({
                target: { name: 'longitude', value: longitude }
            } as any);
            toast({ title: 'Location fetched successfully!' });
          } else {
            throw new Error('Could not find address for this location.');
          }
        } catch (error: any) {
          toast({ title: 'Error fetching address', description: error.message, variant: 'destructive' });
        } finally {
          setIsFetchingLocation(false);
        }
      },
      (error) => {
        toast({
          title: 'Could not get location',
          description: error.code === error.PERMISSION_DENIED ? 'You denied the request for Geolocation.' : error.message,
          variant: 'destructive',
        });
        setIsFetchingLocation(false);
      }
    );
  };

  return (
    <form onSubmit={handleProceedToPayment} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={`mobile${isMobile ? '-mob' : ''}`}>Mobile Number</Label>
        <Input id={`mobile${isMobile ? '-mob' : ''}`} name="mobile" value={shippingAddress.mobile} onChange={handleAddressChange} required />
      </div>
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor={`address${isMobile ? '-mob' : ''}`}>Full Address</Label>
          <Button type="button" variant="outline" size="sm" onClick={handleFetchLocation} disabled={isFetchingLocation}>
            {isFetchingLocation ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MapPin className="mr-2 h-4 w-4" />}
            Fetch Location
          </Button>
        </div>
        <Textarea id={`address${isMobile ? '-mob' : ''}`} name="address" value={shippingAddress.address} onChange={handleAddressChange} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`instructions${isMobile ? '-mob' : ''}`}>Any Instructions (Optional)</Label>
        <Textarea id={`instructions${isMobile ? '-mob' : ''}`} name="instructions" value={shippingAddress.instructions} onChange={handleAddressChange} />
      </div>
      <Button type="submit" className="w-full" disabled={isProcessing}>
        {isProcessing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</> : 'Proceed to Payment'}
      </Button>
    </form>
  );
}


export default function CheckoutPage() {
  const { cart, subtotal, discount, shipping, total, clearCart } = useCart();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = React.useState(false);

  const [shippingAddress, setShippingAddress] = React.useState({
    mobile: '',
    address: '',
    instructions: '',
    latitude: null as number | null,
    longitude: null as number | null,
  });

  React.useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
    if (!authLoading && cart.length === 0) {
      router.push('/cart');
    }
  }, [user, authLoading, cart, router]);

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { name: string, value: any }}) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({ ...prev, [name]: value }));
  };


  const handleProceedToPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: 'Authentication Required', description: 'Please log in to proceed.', variant: 'destructive' });
      router.push('/login');
      return;
    }

    if (!shippingAddress.mobile || !shippingAddress.address) {
      toast({ title: 'Address Required', description: 'Please fill in your mobile number and address.', variant: 'destructive' });
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Create order in our own DB
      const products = cart.map((item) => ({
        productId: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        cost: item.cost,
        size: item.size,
        color: item.color,
      }));

      const internalOrderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user._id,
          userName: `${user.firstName} ${user.lastName}`,
          products,
          subtotal,
          discount,
          shipping,
          total,
          shippingAddress,
        }),
      });

      if (!internalOrderResponse.ok) throw new Error('Failed to save order details.');
      const internalOrder = await internalOrderResponse.json();

      // 2. Create Razorpay order
      const razorpayOrderResponse = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: total }),
      });

      if (!razorpayOrderResponse.ok) throw new Error('Failed to create Razorpay order');

      const razorpayOrder = await razorpayOrderResponse.json();

      // 3. Open Razorpay checkout
      const options = {
        key: RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'Oktopus Clothing',
        description: 'Order Payment',
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
                internal_order_id: internalOrder.orderId,
                order_type: 'cart',
              }),
            });

            if (verifyResponse.ok) {
              clearCart();
              router.push('/payment-success');
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (error) {
            toast({ title: 'Payment Verification Failed', description: 'Please contact support for assistance.', variant: 'destructive' });
          } finally {
            setIsProcessing(false);
          }
        },
        prefill: {
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          contact: shippingAddress.mobile,
        },
        notes: {
          address: shippingAddress.address,
        },
        theme: {
          color: '#FBBF24',
        },
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.on('payment.failed', function (response: any) {
        toast({ title: 'Payment Failed', description: response.error.description, variant: 'destructive' });
        setIsProcessing(false);
      });
      rzp1.open();
    } catch (error) {
      console.error('Checkout error:', error);
      toast({ title: 'Error', description: 'Something went wrong during checkout. Please try again.', variant: 'destructive' });
      setIsProcessing(false);
    }
  };


  return (
    <>
      {/* Desktop View */}
      <div className="hidden md:flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Checkout</h1>
          <div className="grid md:grid-cols-2 gap-16">
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Information</CardTitle>
                  <CardDescription>Please provide your delivery details.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ShippingForm 
                     shippingAddress={shippingAddress}
                     handleAddressChange={handleAddressChange}
                     handleProceedToPayment={handleProceedToPayment}
                     isProcessing={isProcessing}
                  />
                </CardContent>
              </Card>
            </div>
            <div className="bg-secondary p-6 rounded-lg space-y-4 h-fit">
              <h2 className="text-xl font-bold">Order Summary</h2>
              <div className="space-y-2">
                {cart.map(item => (
                  <div key={`${item.id}-${item.size}-${item.color}`} className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2">
                        <Image src={item.imageUrls[0]} alt={item.name} width={40} height={40} className="rounded-md" />
                        <div>
                            <p className='font-medium'>{item.name} (x{item.quantity})</p>
                            <p className='text-muted-foreground text-xs'>Size: {item.size}, Color: {item.color}</p>
                        </div>
                      </div>
                      <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>- ₹{discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{shipping > 0 ? `₹${shipping.toFixed(2)}` : 'Free'}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                    <span>Total</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>

      {/* Mobile View */}
      <div className="md:hidden">
        <MobileHeader title="Checkout" />
        <main className="bg-secondary min-h-screen pb-24 p-4 space-y-4">
           <Card className="card-glass">
                <CardHeader>
                  <CardTitle>Shipping Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <ShippingForm 
                    shippingAddress={shippingAddress}
                    handleAddressChange={handleAddressChange}
                    handleProceedToPayment={handleProceedToPayment}
                    isProcessing={isProcessing}
                    isMobile={true}
                  />
                </CardContent>
            </Card>
            <Card className="card-glass">
                 <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-sm space-y-2 mb-2">
                        <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>₹{subtotal.toFixed(2)}</span>
                        </div>
                        {discount > 0 && (
                            <div className="flex justify-between text-green-600">
                                <span>Discount</span>
                                <span>- ₹{discount.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between">
                            <span>Shipping</span>
                            <span>{shipping > 0 ? `₹${shipping.toFixed(2)}` : 'Free'}</span>
                        </div>
                    </div>
                    <div className="flex justify-between items-center border-t pt-2">
                    <span className="text-muted-foreground">Total</span>
                    <span className="text-xl font-bold">₹{total.toFixed(2)}</span>
                    </div>
                </CardContent>
            </Card>
        </main>
        <MobileFooter />
      </div>
    </>
  );
}
