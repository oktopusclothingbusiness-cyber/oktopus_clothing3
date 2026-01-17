
'use client';

import * as React from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { Loader2, Coins, Gift, Check, ChevronsUpDown } from 'lucide-react';
import { MobileHeader } from '@/components/mobile-header';
import { MobileFooter } from '@/components/mobile-footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import Image from 'next/image';
import { useReward, Reward } from '@/context/reward-context';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

const REWARD_COST = 500;

export default function RewardsPage() {
  const { user, loading: authLoading, refreshUser } = useAuth();
  const { rewards, loading: rewardsLoading } = useReward();
  const router = useRouter();
  const { toast } = useToast();

  const [selectedReward, setSelectedReward] = React.useState<Reward | null>(null);
  const [selectedSize, setSelectedSize] = React.useState('');
  const [shippingAddress, setShippingAddress] = React.useState({ mobile: '', address: '' });
  const [isRedeeming, setIsRedeeming] = React.useState(false);

  React.useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const handleRedeemClick = (reward: Reward) => {
    if (user && (user.oktocoins || 0) >= REWARD_COST) {
      setSelectedReward(reward);
      if (reward.sizes.length > 0) {
        setSelectedSize(reward.sizes[0]);
      }
    } else {
      toast({
        title: "Not enough Oktocoins",
        description: `You need at least ${REWARD_COST} Oktocoins to redeem a reward.`,
        variant: 'destructive'
      });
    }
  };

  const handleConfirmRedemption = async () => {
    if (!selectedReward || !selectedSize || !shippingAddress.mobile || !shippingAddress.address) {
      toast({ title: 'Missing Information', description: 'Please select a size and provide shipping details.', variant: 'destructive' });
      return;
    }
    setIsRedeeming(true);
    try {
      const response = await fetch('/api/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?._id,
          rewardId: selectedReward.id,
          size: selectedSize,
          shippingAddress,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Redemption failed');
      }

      toast({
        title: 'Redemption Successful!',
        description: `Your ${selectedReward.name} is on its way.`,
      });
      await refreshUser(); // Refresh user data to show updated points
      setSelectedReward(null); // Close dialog
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsRedeeming(false);
    }
  };

  const loading = authLoading || rewardsLoading;

  const content = (
     <div className="space-y-8">
        <Card className="bg-yellow-400/20 border-yellow-500 text-center">
            <CardHeader>
                <CardTitle className="flex items-center justify-center gap-2 text-yellow-700">
                    <Coins className="h-8 w-8" />
                    My Oktocoins
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-6xl font-bold text-yellow-800">{user?.oktocoins || 0}</p>
                <p className="text-lg text-yellow-600">points available</p>
            </CardContent>
        </Card>

        <div>
            <h2 className="text-2xl font-bold mb-4">Redeem Your Rewards</h2>
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({length: 3}).map((_, i) => <Skeleton key={i} className="h-96 w-full" />)}
                </div>
            ) : rewards.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {rewards.map((reward) => (
                        <Card key={reward.id}>
                            <CardHeader className="p-0">
                                <div className="relative aspect-square">
                                    <Image src={reward.imageUrl} alt={reward.name} layout="fill" objectFit="cover" className="rounded-t-lg" />
                                </div>
                            </CardHeader>
                            <CardContent className="pt-4">
                                <CardTitle>{reward.name}</CardTitle>
                                <CardDescription>{reward.description}</CardDescription>
                            </CardContent>
                            <CardFooter className="flex-col items-start gap-4">
                                <div className="flex items-center font-bold text-lg text-yellow-700">
                                    <Coins className="mr-2 h-5 w-5" /> {REWARD_COST}
                                </div>
                                <Button className="w-full" onClick={() => handleRedeemClick(reward)} disabled={(user?.oktocoins || 0) < REWARD_COST}>
                                    <Gift className="mr-2 h-4 w-4" /> Redeem Now
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : (
                <p>No rewards available at the moment. Check back soon!</p>
            )}
        </div>
    </div>
  );

  return (
    <>
      {/* Desktop View */}
      <div className="hidden md:flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          {content}
        </main>
        <Footer />
      </div>

      {/* Mobile View */}
      <div className="md:hidden">
        <MobileHeader title="Redeem Rewards" />
        <main className="bg-secondary min-h-screen pb-24 p-4">
          {content}
        </main>
        <MobileFooter />
      </div>

      <Dialog open={!!selectedReward} onOpenChange={(open) => !open && setSelectedReward(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Redeem: {selectedReward?.name}</DialogTitle>
            <DialogDescription>Confirm your size and shipping details to complete the redemption.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
                <Label>Size</Label>
                 <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" role="combobox" className="w-full justify-between">
                        {selectedSize || "Select a size..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                        <Command>
                            <CommandInput placeholder="Search sizes..." />
                            <CommandEmpty>No sizes found.</CommandEmpty>
                            <CommandGroup>
                                {selectedReward?.sizes.map((size) => (
                                <CommandItem
                                    key={size}
                                    value={size}
                                    onSelect={(currentValue) => {
                                        setSelectedSize(currentValue === selectedSize ? "" : currentValue)
                                    }}
                                >
                                    <Check className={cn("mr-2 h-4 w-4", selectedSize === size ? "opacity-100" : "opacity-0")} />
                                    {size}
                                </CommandItem>
                                ))}
                            </CommandGroup>
                        </Command>
                    </PopoverContent>
                </Popover>
            </div>
             <div className="space-y-2">
                <Label htmlFor="mobile">Mobile Number</Label>
                <Input id="mobile" value={shippingAddress.mobile} onChange={(e) => setShippingAddress(p => ({...p, mobile: e.target.value}))} placeholder="Your mobile number"/>
            </div>
             <div className="space-y-2">
                <Label htmlFor="address">Shipping Address</Label>
                <Textarea id="address" value={shippingAddress.address} onChange={(e) => setShippingAddress(p => ({...p, address: e.target.value}))} placeholder="Your full shipping address"/>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedReward(null)}>Cancel</Button>
            <Button onClick={handleConfirmRedemption} disabled={isRedeeming}>
              {isRedeeming && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm Redemption (-{REWARD_COST} Oktocoins)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
