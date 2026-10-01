
"use client";

import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cart-context";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Minus, Plus, Trash2, Ticket } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { MobileHeader } from "@/components/mobile-header";
import { getProductImage } from "@/lib/utils";
import { MobileFooter } from "@/components/mobile-footer";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";


export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart, subtotal, discount, shipping, total, applyCoupon } = useCart();
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();
  const [isCouponDialogOpen, setIsCouponDialogOpen] = React.useState(false);
  const [couponCode, setCouponCode] = React.useState('');

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast({ title: "Coupon code cannot be empty.", variant: 'destructive' });
      return;
    }
    const success = await applyCoupon(couponCode);
    if(success) {
      setIsCouponDialogOpen(false);
      setCouponCode('');
    }
  }

  const handleCheckoutClick = () => {
    if (!user) {
      toast({ title: "Authentication Required", description: "Please log in to proceed.", variant: "destructive" });
      router.push('/login');
      return;
    }
    if (cart.length === 0) {
      toast({ title: "Empty Cart", description: "Your cart is empty.", variant: "destructive" });
      return;
    }
    router.push('/checkout');
  }
  
  return (
    <>
      {/* Desktop View */}
      <div className="hidden md:flex flex-col min-h-screen">
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
                {cart.map((item, index) => {
                  const itemId = item.id || (item as any)._id || (item as any).productId || String(index);
                  const price = Number(item.price) || 0;
                  const itemImages = Array.isArray(item.imageUrls) && item.imageUrls.length > 0 
                    ? item.imageUrls 
                    : ((item as any).imageUrl ? [(item as any).imageUrl] : []);

                  return (
                    <div key={`${itemId}-${item.size}-${item.color}-${item.fabricQuality || ''}-${index}`} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <Image 
                          src={getProductImage(itemImages, "https://placehold.co/80x80.png")} 
                          alt={item.name || 'Cart Item'} 
                          width={80} 
                          height={80} 
                          className="rounded-md object-cover" 
                        />
                        <div>
                          <h2 className="font-semibold">{item.name || 'Apparel Item'}</h2>
                          <p className="text-sm text-muted-foreground">
                            {item.fabricQuality ? <span className="font-medium text-foreground mr-1.5">[{item.fabricQuality}]</span> : null}
                            Size: {item.size || 'Free Size'}, Color: {item.color || 'Standard'}
                          </p>
                          <p className="text-muted-foreground font-semibold">₹{price.toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="icon" onClick={() => updateQuantity(itemId, item.size, item.color, (Number(item.quantity) || 1) - 1, item.fabricQuality)} disabled={(Number(item.quantity) || 1) <= 1}>
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="font-medium">{item.quantity || 1}</span>
                          <Button variant="outline" size="icon" onClick={() => updateQuantity(itemId, item.size, item.color, (Number(item.quantity) || 1) + 1, item.fabricQuality)}>
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => removeFromCart(itemId, item.size, item.color, item.fabricQuality)}>
                          <Trash2 className="h-5 w-5 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
                 <Button variant="outline" onClick={clearCart} className="mt-4">
                  Clear Cart
                </Button>
              </div>
              <div className="bg-secondary p-6 rounded-lg space-y-4 h-fit">
                <h2 className="text-xl font-bold">Order Summary</h2>
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{(Number(subtotal) || 0).toFixed(2)}</span>
                </div>
                 {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>- ₹{(Number(discount) || 0).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{shipping > 0 ? `₹${(Number(shipping) || 0).toFixed(2)}` : 'Free'}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total</span>
                  <span>₹{(Number(total) || 0).toFixed(2)}</span>
                </div>
                <Button className="w-full" size="lg" onClick={handleCheckoutClick}>
                    Checkout
                </Button>
                 <Dialog open={isCouponDialogOpen} onOpenChange={setIsCouponDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <Ticket className="mr-2 h-4 w-4" />
                      Apply Coupon
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Apply Coupon</DialogTitle>
                      <DialogDescription>Enter your coupon code below to get a discount.</DialogDescription>
                    </DialogHeader>
                    <div className="flex gap-2 mt-4">
                      <Input value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} placeholder="COUPONCODE" />
                      <Button onClick={handleApplyCoupon}>Apply</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          )}
        </main>
        <Footer />
      </div>

      {/* Mobile View */}
      <div className="md:hidden">
        <MobileHeader title="My Cart" />
        <main className="pb-24 bg-secondary min-h-screen">
          {cart.length === 0 ? (
            <div className="text-center pt-20">
              <p className="mb-4">Your cart is empty.</p>
              <Button asChild>
                <Link href="/products">Continue Shopping</Link>
              </Button>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {cart.map((item, index) => {
                const itemId = item.id || (item as any)._id || (item as any).productId || String(index);
                const price = Number(item.price) || 0;
                const itemImages = Array.isArray(item.imageUrls) && item.imageUrls.length > 0 
                  ? item.imageUrls 
                  : ((item as any).imageUrl ? [(item as any).imageUrl] : []);

                return (
                  <div key={`${itemId}-${item.size}-${item.color}-${item.fabricQuality || ''}-${index}`} className="flex items-start gap-4 p-4 card-glass rounded-lg shadow-sm">
                    <Image 
                      src={getProductImage(itemImages, "https://placehold.co/80x80.png")} 
                      alt={item.name || 'Cart Item'} 
                      width={80} 
                      height={80} 
                      className="rounded-md object-cover" 
                    />
                    <div className="flex-grow">
                      <h2 className="font-semibold text-sm">{item.name || 'Apparel Item'}</h2>
                      <p className="text-xs text-muted-foreground">
                        {item.fabricQuality ? <span className="font-semibold text-primary mr-1">[{item.fabricQuality}]</span> : null}
                        Size: {item.size || 'Free Size'}, Color: {item.color || 'Standard'}
                      </p>
                      <p className="text-primary font-bold text-md">₹{price.toFixed(2)}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(itemId, item.size, item.color, (Number(item.quantity) || 1) - 1, item.fabricQuality)} disabled={(Number(item.quantity) || 1) <= 1}>
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-medium">{item.quantity || 1}</span>
                        <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(itemId, item.size, item.color, (Number(item.quantity) || 1) + 1, item.fabricQuality)}>
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeFromCart(itemId, item.size, item.color, item.fabricQuality)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
          {cart.length > 0 && (
            <>
              <div className="fixed bottom-16 left-0 right-0 bg-background/80 backdrop-blur-lg p-4 border-t shadow-[0_-2px_10px_rgba(0,0,0,0.1)]">
                 <div className="text-xs space-y-1 mb-2">
                    <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>₹{(Number(subtotal) || 0).toFixed(2)}</span>
                    </div>
                    {discount > 0 && (
                        <div className="flex justify-between text-green-600">
                            <span>Discount</span>
                            <span>- ₹{(Number(discount) || 0).toFixed(2)}</span>
                        </div>
                    )}
                     <div className="flex justify-between">
                        <span>Shipping</span>
                        <span>{shipping > 0 ? `₹${(Number(shipping) || 0).toFixed(2)}` : 'Free'}</span>
                    </div>
                 </div>
                <div className="flex justify-between items-center mb-4 border-t pt-2">
                  <span className="text-muted-foreground">Total</span>
                  <span className="text-xl font-bold">₹{(Number(total) || 0).toFixed(2)}</span>
                </div>
                <div className="flex gap-2">
                    <Dialog open={isCouponDialogOpen} onOpenChange={setIsCouponDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="w-full">
                                <Ticket className="mr-2 h-4 w-4" />
                                Apply Coupon
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                            <DialogTitle>Apply Coupon</DialogTitle>
                            <DialogDescription>Enter your coupon code below to get a discount.</DialogDescription>
                            </DialogHeader>
                            <div className="flex gap-2 mt-4">
                            <Input value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} placeholder="COUPONCODE" />
                            <Button onClick={handleApplyCoupon}>Apply</Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                    <Button className="w-full" size="lg" onClick={handleCheckoutClick}>
                        Checkout
                    </Button>
                </div>
              </div>
            </>
          )}
        </main>
        <MobileFooter />
      </div>
    </>
  );
}
