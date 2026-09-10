'use client';

import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cart-context";
import Image from "next/image";
import Link from "next/link";
import { StorefrontHeader } from "@/components/storefront/header";
import { StorefrontFooter } from "@/components/storefront/footer";
import { Minus, Plus, Trash2, Ticket, ShoppingBag, ArrowRight } from "lucide-react";
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
    if (success) {
      setIsCouponDialogOpen(false);
      setCouponCode('');
    }
  };

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
  };
  
  return (
    <div className="bg-[#0A0A0A] text-[#FAF9F6] font-sans min-h-screen">
      {/* Desktop View */}
      <div className="hidden md:flex flex-col min-h-screen">
        <StorefrontHeader />
        <main className="flex-grow container mx-auto px-6 lg:px-12 py-12">
          <h1 className="text-4xl font-black font-bebas uppercase tracking-wider text-white mb-8 flex items-center gap-3">
            <ShoppingBag className="h-8 w-8 text-[#0F824B]" />
            YOUR BAG ({cart.length} ITEMS)
          </h1>

          {cart.length === 0 ? (
            <div className="text-center py-20 bg-[#121212] border border-white/10 rounded-2xl p-8 space-y-4">
              <ShoppingBag className="h-16 w-16 text-zinc-500 mx-auto" />
              <h2 className="text-3xl font-black font-bebas uppercase text-white">YOUR SHOPPING BAG IS EMPTY</h2>
              <p className="text-xs font-mono text-zinc-400 max-w-sm mx-auto">
                Explore our current drop catalog to add heavyweight graphic tees and hoodies.
              </p>
              <Button asChild className="bg-[#0F824B] hover:bg-[#0b663a] text-black font-bold font-mono text-xs rounded-full px-8 h-12">
                <Link href="/products">EXPLORE CATALOG →</Link>
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-10">
              <div className="md:col-span-2 space-y-4">
                {cart.map((item) => (
                  <div key={`${item.id}-${item.size}-${item.color}`} className="flex items-center justify-between p-5 border border-white/10 rounded-2xl bg-[#121212] transition-all hover:border-white/20">
                    <div className="flex items-center gap-5">
                      <div className="w-20 h-24 rounded-xl overflow-hidden relative bg-zinc-900 border border-white/10 shrink-0">
                        <Image src={getProductImage(item.imageUrls, "https://placehold.co/80x80.png")} alt={item.name} layout="fill" objectFit="cover" unoptimized />
                      </div>
                      <div className="space-y-1">
                        <h2 className="font-bold text-white uppercase text-base">{item.name}</h2>
                        <p className="text-xs font-mono text-zinc-400">SIZE: {item.size} | COLOR: {item.color}</p>
                        <p className="font-mono text-sm font-bold text-[#0F824B]">₹{item.price.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 font-mono">
                      <div className="flex items-center gap-2 bg-[#0A0A0A] border border-white/10 rounded-full p-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-white hover:bg-white/10 rounded-full" onClick={() => updateQuantity(item.id, item.size, item.color, item.quantity - 1)} disabled={item.quantity <= 1}>
                          <Minus className="h-3.5 w-3.5" />
                        </Button>
                        <span className="text-xs font-bold px-2 text-white">{item.quantity}</span>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-white hover:bg-white/10 rounded-full" onClick={() => updateQuantity(item.id, item.size, item.color, item.quantity + 1)}>
                          <Plus className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-full" onClick={() => removeFromCart(item.id, item.size, item.color)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                <div className="pt-2 flex justify-between">
                  <Button variant="outline" onClick={clearCart} className="border-white/10 text-xs font-mono text-zinc-400 hover:text-white rounded-full">
                    Clear Entire Bag
                  </Button>
                  <Button asChild variant="ghost" className="text-xs font-mono text-[#0F824B] hover:underline">
                    <Link href="/products">Add More Products →</Link>
                  </Button>
                </div>
              </div>

              {/* Order Summary Box */}
              <div className="bg-[#121212] border border-white/10 p-6 rounded-2xl space-y-6 h-fit text-white">
                <h2 className="text-2xl font-black font-bebas uppercase tracking-wider border-b border-white/10 pb-4">SUMMARY</h2>
                <div className="space-y-3 font-mono text-xs">
                  <div className="flex justify-between text-zinc-400">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-400 font-bold">
                      <span>Discount Coupon</span>
                      <span>- ₹{discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-zinc-400">
                    <span>Express Shipping</span>
                    <span>{shipping > 0 ? `₹${shipping.toFixed(2)}` : 'FREE'}</span>
                  </div>
                  <div className="flex justify-between font-bold text-base border-t border-white/10 pt-3 text-white">
                    <span>GRAND TOTAL</span>
                    <span className="text-[#0F824B] font-mono">₹{total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <Button className="w-full bg-[#0F824B] hover:bg-[#0b663a] text-black font-bold h-12 text-xs font-mono uppercase tracking-wider rounded-full" size="lg" onClick={handleCheckoutClick}>
                    Proceed to Checkout <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>

                  <Dialog open={isCouponDialogOpen} onOpenChange={setIsCouponDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10 rounded-full h-11 text-xs font-mono">
                        <Ticket className="mr-2 h-4 w-4 text-[#0F824B]" />
                        Apply Coupon Code
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-[#121212] border-white/10 text-white">
                      <DialogHeader>
                        <DialogTitle className="font-bebas text-xl uppercase">Apply Promo Coupon</DialogTitle>
                        <DialogDescription className="text-zinc-400 font-mono text-xs">Enter your discount code below.</DialogDescription>
                      </DialogHeader>
                      <div className="flex gap-2 mt-4">
                        <Input value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} placeholder="PROMOCODE" className="bg-[#0A0A0A] border-white/10 text-white font-mono text-xs uppercase" />
                        <Button onClick={handleApplyCoupon} className="bg-[#0F824B] text-white font-bold text-xs font-mono">Apply</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
          )}
        </main>
        <StorefrontFooter />
      </div>

      {/* Mobile View */}
      <div className="md:hidden">
        <MobileHeader title="My Bag" />
        <main className="pb-36 bg-[#0A0A0A] min-h-screen">
          {cart.length === 0 ? (
            <div className="text-center pt-20 p-6 space-y-4">
              <ShoppingBag className="h-12 w-12 text-zinc-500 mx-auto" />
              <p className="text-sm font-mono text-zinc-400">Your bag is empty.</p>
              <Button asChild className="bg-[#0F824B] text-white font-bold text-xs rounded-full px-6">
                <Link href="/products">Explore Catalog</Link>
              </Button>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {cart.map((item) => (
                <div key={`${item.id}-${item.size}-${item.color}`} className="flex items-start gap-4 p-4 border border-white/10 bg-[#121212] rounded-2xl">
                  <div className="w-20 h-24 rounded-xl overflow-hidden relative bg-zinc-900 border border-white/10 shrink-0">
                    <Image src={getProductImage(item.imageUrls, "https://placehold.co/80x80.png")} alt={item.name} layout="fill" objectFit="cover" unoptimized />
                  </div>
                  <div className="flex-grow space-y-1">
                    <h2 className="font-bold text-xs uppercase text-white">{item.name}</h2>
                    <p className="text-[10px] font-mono text-zinc-400">SIZE: {item.size} | COLOR: {item.color}</p>
                    <p className="text-[#0F824B] font-bold font-mono text-sm">₹{item.price.toFixed(2)}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Button variant="outline" size="icon" className="h-6 w-6 border-white/10 text-white rounded-full" onClick={() => updateQuantity(item.id, item.size, item.color, item.quantity - 1)} disabled={item.quantity <= 1}>
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="text-xs font-mono text-white font-bold">{item.quantity}</span>
                      <Button variant="outline" size="icon" className="h-6 w-6 border-white/10 text-white rounded-full" onClick={() => updateQuantity(item.id, item.size, item.color, item.quantity + 1)}>
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400" onClick={() => removeFromCart(item.id, item.size, item.color)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
          {cart.length > 0 && (
            <div className="fixed bottom-16 left-0 right-0 bg-[#0E0E0E]/95 backdrop-blur-lg p-4 border-t border-white/10 z-40">
              <div className="text-[11px] font-mono space-y-1 mb-2">
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
              <div className="flex justify-between items-center mb-3 border-t border-white/10 pt-2 font-mono">
                <span className="text-xs text-zinc-400">Total</span>
                <span className="text-lg font-bold text-[#0F824B]">₹{total.toFixed(2)}</span>
              </div>
              <div className="flex gap-2 font-mono">
                <Dialog open={isCouponDialogOpen} onOpenChange={setIsCouponDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-1/2 border-white/20 text-white text-xs rounded-full">
                      <Ticket className="mr-1 h-3.5 w-3.5 text-[#0F824B]" />
                      Coupon
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-[#121212] border-white/10 text-white">
                    <DialogHeader>
                      <DialogTitle className="font-bebas text-xl uppercase">Apply Coupon</DialogTitle>
                    </DialogHeader>
                    <div className="flex gap-2 mt-4">
                      <Input value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} placeholder="COUPONCODE" className="bg-[#0A0A0A] border-white/10 text-white font-mono text-xs uppercase" />
                      <Button onClick={handleApplyCoupon} className="bg-[#0F824B] text-white font-bold text-xs font-mono">Apply</Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button className="w-1/2 bg-[#0F824B] text-white font-bold text-xs rounded-full" size="lg" onClick={handleCheckoutClick}>
                  Checkout →
                </Button>
              </div>
            </div>
          )}
        </main>
        <MobileFooter />
      </div>
    </div>
  );
}
