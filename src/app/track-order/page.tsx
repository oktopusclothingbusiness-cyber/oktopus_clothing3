
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
    // For now, we'll assume the user enters the full ID.
    // We navigate to the dynamic route.
    router.push(`/track-order/${orderId.trim()}`);
  }

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="md:hidden">
      <MobileHeader title="Track Your Order" />
      <main className="bg-secondary min-h-screen pb-24 p-4 flex items-center justify-center">
        <Card className="w-full max-w-sm card-glass">
          <CardHeader className="text-center">
             <Package className="mx-auto h-12 w-12 text-primary" />
            <CardTitle>Track Your Order</CardTitle>
            <CardDescription>Enter your Order ID to see the status.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleTrackOrder} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="orderId" className="sr-only">Order ID</label>
                <Input 
                    id="orderId" 
                    placeholder="Enter Order ID" 
                    value={orderId} 
                    onChange={(e) => setOrderId(e.target.value)} 
                />
              </div>
              <Button type="submit" className="w-full">
                <Search className="mr-2 h-4 w-4" />
                Track Order
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
      <MobileFooter />
    </div>
  );
}
