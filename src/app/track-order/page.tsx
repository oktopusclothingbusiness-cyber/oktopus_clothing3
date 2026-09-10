'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Loader2, Search, Package } from 'lucide-react';
import { MobileHeader } from '@/components/mobile-header';
import { MobileFooter } from '@/components/mobile-footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { StorefrontHeader } from '@/components/storefront/header';
import { StorefrontFooter } from '@/components/storefront/footer';

export default function TrackOrderPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orderId, setOrderId] = React.useState('');
  const { toast } = useToast();

  React.useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);
  
  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) {
        toast({ title: 'Error', description: 'Please enter an Order ID.', variant: 'destructive' });
        return;
    }
    router.push(`/track-order/${orderId.trim()}`);
  };

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0A0A0A] text-white font-mono">
        <Loader2 className="h-8 w-8 animate-spin text-[#0F824B]" />
      </div>
    );
  }

  return (
    <div className="bg-[#0A0A0A] text-[#FAF9F6] font-sans min-h-screen">
      {/* Desktop View */}
      <div className="hidden md:flex flex-col min-h-screen">
        <StorefrontHeader />
        <main className="flex-grow container mx-auto px-6 lg:px-12 py-16 flex items-center justify-center">
          <Card className="w-full max-w-md bg-[#121212] border-white/10 text-white shadow-2xl rounded-2xl p-4">
            <CardHeader className="text-center space-y-2">
              <Package className="mx-auto h-12 w-12 text-[#0F824B]" />
              <CardTitle className="font-bebas text-3xl uppercase tracking-wider">TRACK SHIPMENT STATUS</CardTitle>
              <CardDescription className="text-zinc-400 font-mono text-xs">Enter your Order ID to check live dispatch & delivery updates.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleTrackOrder} className="space-y-4 font-mono text-xs">
                <div className="space-y-1.5">
                  <Input 
                      placeholder="e.g. 66f2a89d..." 
                      value={orderId} 
                      onChange={(e) => setOrderId(e.target.value)} 
                      className="bg-[#0A0A0A] border-white/10 text-white text-xs h-11 rounded-xl"
                  />
                </div>
                <Button type="submit" className="w-full bg-[#0F824B] text-white font-bold h-11 rounded-full uppercase">
                  <Search className="mr-2 h-4 w-4" />
                  Track Order Now
                </Button>
              </form>
            </CardContent>
          </Card>
        </main>
        <StorefrontFooter />
      </div>

      {/* Mobile View */}
      <div className="md:hidden">
        <MobileHeader title="Track Your Order" />
        <main className="bg-[#0A0A0A] min-h-screen pb-24 p-4 flex items-center justify-center">
          <Card className="w-full max-w-sm bg-[#121212] border-white/10 text-white rounded-2xl">
            <CardHeader className="text-center">
               <Package className="mx-auto h-12 w-12 text-[#0F824B]" />
              <CardTitle className="font-bebas text-2xl uppercase">Track Order</CardTitle>
              <CardDescription className="text-xs font-mono text-zinc-400">Enter your Order ID to see status.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleTrackOrder} className="space-y-4 font-mono text-xs">
                <Input 
                    placeholder="Enter Order ID" 
                    value={orderId} 
                    onChange={(e) => setOrderId(e.target.value)} 
                    className="bg-[#0A0A0A] border-white/10 text-white text-xs h-11"
                />
                <Button type="submit" className="w-full bg-[#0F824B] text-white font-bold h-11 rounded-full uppercase">
                  <Search className="mr-2 h-4 w-4" />
                  Track Order
                </Button>
              </form>
            </CardContent>
          </Card>
        </main>
        <MobileFooter />
      </div>
    </div>
  );
}
