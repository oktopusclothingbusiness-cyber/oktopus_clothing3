'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/cart-context';
import { StorefrontHeader } from '@/components/storefront/header';
import { StorefrontFooter } from '@/components/storefront/footer';
import { PageBanner } from '@/components/storefront/page-banner';
import { Loader2, MapPin, ShieldCheck, Truck } from 'lucide-react';
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
import { getProductImage } from '@/lib/utils';

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
        <Label htmlFor={`mobile${isMobile ? '-mob' : ''}`} className="text-xs font-mono uppercase text-zinc-300">Mobile Number (For Delivery Tracking)</Label>
        <Input id={`mobile${isMobile ? '-mob' : ''}`} name="mobile" value={shippingAddress.mobile} onChange={handleAddressChange} placeholder="e.g. +91 9876543210" required className="bg-[#0A0A0A] border-white/10 text-white font-mono text-xs h-11" />
      </div>
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor={`address${isMobile ? '-mob' : ''}`} className="text-xs font-mono uppercase text-zinc-300">Delivery Address</Label>
          <Button type="button" variant="outline" size="sm" onClick={handleFetchLocation} disabled={isFetchingLocation} className="border-white/10 text-xs font-mono text-zinc-300 hover:bg-white hover:text-black">
            {isFetchingLocation ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <MapPin className="mr-2 h-3.5 w-3.5 text-[#0F824B]" />}
            Auto-Detect GPS Address
          </Button>
        </div>
        <Textarea id={`address${isMobile ? '-mob' : ''}`} name="address" value={shippingAddress.address} onChange={handleAddressChange} placeholder="Street address, apartment, city, state, pincode..." required className="bg-[#0A0A0A] border-white/10 text-white text-xs min-h-[90px]" />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`instructions${isMobile ? '-mob' : ''}`} className="text-xs font-mono uppercase text-zinc-300">Delivery Notes / Landmark (Optional)</Label>
        <Textarea id={`instructions${isMobile ? '-mob' : ''}`} name="instructions" value={shippingAddress.instructions} onChange={handleAddressChange} placeholder="Gate codes, delivery time preference..." className="bg-[#0A0A0A] border-white/10 text-white text-xs" />
      </div>
      <Button type="submit" className="w-full bg-[#0F824B] hover:bg-[#0b663a] text-black font-bold h-12 text-xs font-mono uppercase tracking-wider rounded-full" disabled={isProcessing}>
        {isProcessing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing Payment...</> : 'Proceed to Secure Payment'}
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
          color: '#0F824B',
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
    <div className="bg-[#0A0A0A] text-[#FAF9F6] font-sans min-h-screen">
      {/* Desktop View */}
      <div className="hidden md:flex flex-col min-h-screen">
        <StorefrontHeader />
        
        {/* DYNAMIC DATABASE BANNER FOR CHECKOUT PAGE */}
        <PageBanner
          placement="checkout_page"
          compact={true}
          fallbackTitle="FAST EXPRESS CHECKOUT"
          fallbackDescription="Encrypted 256-bit SSL transaction. Free express shipping applied automatically."
        />

        <main className="flex-grow container mx-auto px-6 lg:px-12 py-10">
          <h1 className="text-4xl font-black font-bebas uppercase tracking-wider text-white mb-8">SECURE CHECKOUT</h1>
          <div className="grid md:grid-cols-12 gap-12">
            <div className="md:col-span-7">
              <Card className="bg-[#121212] border-white/10 text-white">
                <CardHeader>
                  <CardTitle className="font-bebas text-2xl uppercase tracking-wide">Delivery & Shipping Address</CardTitle>
                  <CardDescription className="text-zinc-400 font-mono text-xs">Enter your delivery location for order fulfillment.</CardDescription>
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

            <div className="md:col-span-5 bg-[#121212] border border-white/10 p-6 rounded-2xl space-y-6 h-fit text-white">
              <h2 className="text-2xl font-black font-bebas uppercase tracking-wider border-b border-white/10 pb-4">ORDER SUMMARY ({cart.length} ITEMS)</h2>
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                {cart.map(item => (
                  <div key={`${item.id}-${item.size}-${item.color}`} className="flex justify-between items-center text-xs font-mono border-b border-white/5 pb-3">
                      <div className="flex items-center gap-3">
                        <Image src={getProductImage(item.imageUrls, "https://placehold.co/40x40.png")} alt={item.name} width={48} height={48} className="rounded-lg object-cover bg-zinc-800" unoptimized />
                        <div>
                            <p className='font-bold text-white uppercase'>{item.name} (x{item.quantity})</p>
                            <p className='text-zinc-400 text-[10px]'>SIZE: {item.size} | COLOR: {item.color}</p>
                        </div>
                      </div>
                      <span className="font-bold text-[#0F824B]">₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="pt-2 space-y-2 font-mono text-xs">
                  <div className="flex justify-between text-zinc-400">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-400 font-bold">
                      <span>Promo Discount</span>
                      <span>- ₹{discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-zinc-400">
                    <span>Express Shipping</span>
                    <span>{shipping > 0 ? `₹${shipping.toFixed(2)}` : 'FREE'}</span>
                  </div>
                  <div className="flex justify-between font-bold text-base border-t border-white/10 pt-3 text-white">
                    <span>TOTAL AMOUNT</span>
                    <span className="text-[#0F824B] font-mono">₹{total.toFixed(2)}</span>
                  </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-zinc-400">
                <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-400" /> 100% Guaranteed Authentic</span>
                <span className="flex items-center gap-1.5"><Truck className="w-4 h-4 text-[#0F824B]" /> Dispatch in 24h</span>
              </div>
            </div>
          </div>
        </main>
        <StorefrontFooter />
      </div>

      {/* Mobile View */}
      <div className="md:hidden">
        <MobileHeader title="Checkout" />
        <main className="bg-[#0A0A0A] min-h-screen pb-24 p-4 space-y-4">
           <PageBanner
             placement="checkout_page"
             compact={true}
             fallbackTitle="SECURE CHECKOUT"
           />
           <Card className="bg-[#121212] border-white/10 text-white">
                <CardHeader>
                  <CardTitle className="font-bebas text-xl uppercase">Shipping Details</CardTitle>
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
            <Card className="bg-[#121212] border-white/10 text-white">
                 <CardHeader>
                    <CardTitle className="font-bebas text-xl uppercase">Summary</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-xs font-mono space-y-2 mb-2">
                        <div className="flex justify-between text-zinc-400">
                            <span>Subtotal</span>
                            <span>₹{subtotal.toFixed(2)}</span>
                        </div>
                        {discount > 0 && (
                            <div className="flex justify-between text-emerald-400">
                                <span>Discount</span>
                                <span>- ₹{discount.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-zinc-400">
                            <span>Shipping</span>
                            <span>{shipping > 0 ? `₹${shipping.toFixed(2)}` : 'FREE'}</span>
                        </div>
                    </div>
                    <div className="flex justify-between items-center border-t border-white/10 pt-2">
                      <span className="text-xs font-mono text-zinc-400">Total</span>
                      <span className="text-xl font-bold font-mono text-[#0F824B]">₹{total.toFixed(2)}</span>
                    </div>
                </CardContent>
            </Card>
        </main>
        <MobileFooter />
      </div>
    </div>
  );
}
