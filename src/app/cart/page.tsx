"use client";

import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cart-context";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Minus, Plus, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import * as React from "react";

// Add this type definition at the top of the file
declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = React.useState(false);

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleCheckout = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to proceed with the checkout.",
        variant: "destructive"
      });
      router.push('/login');
      return;
    }
    
    if (subtotal === 0) {
        toast({
            title: "Empty Cart",
            description: "Please add items to your cart before checking out.",
            variant: "destructive"
        });
        return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: subtotal }),
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }
      
      const order = await response.json();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'VogueVerse',
        description: 'Test Transaction',
        order_id: order.id,
        handler: async function (response: any) {
            try {
                const verifyResponse = await fetch('/api/payment/verify-payment', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature
                    })
                });

                if (verifyResponse.ok) {
                    toast({
                        title: "Payment Successful",
                        description: "Thank you for your purchase!",
                    });
                    clearCart();
                    router.push('/store');
                } else {
                     throw new Error('Payment verification failed');
                }
            } catch (error) {
                 toast({
                    title: "Payment Verification Failed",
                    description: "Please contact support for assistance.",
                    variant: "destructive"
                });
            } finally {
                setIsProcessing(false);
            }
        },
        prefill: {
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
        },
        notes: {
          address: "VogueVerse Corporate Office"
        },
        theme: {
          color: "#000000"
        }
      };
      
      const rzp1 = new window.Razorpay(options);
      rzp1.on('payment.failed', function (response: any){
              toast({
                title: 'Payment Failed',
                description: response.error.description,
                variant: 'destructive',
              });
              setIsProcessing(false);
      });
      rzp1.open();

    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Error",
        description: "Something went wrong during checkout. Please try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
        {cart.length === 0 ? (
          <div className="text-center">
            <p className="mb-4">Your cart is empty.</p>
            <Button asChild>
              <Link href="/products">Continue Shopping</Link>
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <Image src={item.imageUrls[0]} alt={item.name} width={80} height={80} className="rounded-md" />
                    <div>
                      <h2 className="font-semibold">{item.name}</h2>
                      <p className="text-muted-foreground">₹{item.price.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="icon" onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1}>
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span>{item.quantity}</span>
                      <Button variant="outline" size="icon" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.id)}>
                      <Trash2 className="h-5 w-5 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
               <Button variant="outline" onClick={clearCart} className="mt-4">
                Clear Cart
              </Button>
            </div>
            <div className="bg-secondary p-6 rounded-lg space-y-4 h-fit">
              <h2 className="text-xl font-bold">Order Summary</h2>
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <Button className="w-full" size="lg" onClick={handleCheckout} disabled={isProcessing}>
                 {isProcessing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</> : 'Checkout'}
              </Button>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
