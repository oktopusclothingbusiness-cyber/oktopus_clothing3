'use client';

import * as React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import Image from 'next/image';
import { Trash2, Edit, Loader2, PlusCircle, Gift, Coins, Sparkles, RotateCcw, CheckCircle2, Info } from 'lucide-react';
import { useReward, Reward } from '@/context/reward-context';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const DEFAULT_COIN_ICON = 'https://i.ibb.co/6RXzvrS6/oktocoin-v1-80x80.png';

const emptyReward = {
    id: '',
    name: '',
    description: '',
    imageUrl: '',
    sizes: '',
};

export default function AdminRewardsPage() {
    const { rewards, addReward, deleteReward, updateReward, loading } = useReward();
    const { toast } = useToast();

    // Reward Catalog Items State
    const [formData, setFormData] = React.useState<Omit<Reward, '_id' | 'sizes'> & { sizes: string }>(emptyReward);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [isEditing, setIsEditing] = React.useState(false);

    // Loyalty Branding & Exchange Details State
    const [loyaltySettings, setLoyaltySettings] = React.useState({
        oktocoinIconUrl: DEFAULT_COIN_ICON,
        coinName: 'Oktocoin',
        rewardCost: 500,
        welcomeBonus: 100,
        orderThreshold: 499,
        orderBonusCoins: 100,
        exchangeRateText: '1 Oktocoin = ₹1 Value',
    });
    const [loadingLoyalty, setLoadingLoyalty] = React.useState(true);
    const [isSavingLoyalty, setIsSavingLoyalty] = React.useState(false);
    const [iconLoadError, setIconLoadError] = React.useState(false);

    // Fetch loyalty branding settings on mount
    const fetchLoyaltySettings = React.useCallback(async () => {
        try {
            setLoadingLoyalty(true);
            const res = await fetch('/api/settings');
            if (res.ok) {
                const data = await res.json();
                setLoyaltySettings({
                    oktocoinIconUrl: data.oktocoinIconUrl || DEFAULT_COIN_ICON,
                    coinName: data.coinName || 'Oktocoin',
                    rewardCost: typeof data.rewardCost === 'number' ? data.rewardCost : 500,
                    welcomeBonus: typeof data.welcomeBonus === 'number' ? data.welcomeBonus : 100,
                    orderThreshold: typeof data.orderThreshold === 'number' ? data.orderThreshold : 499,
                    orderBonusCoins: typeof data.orderBonusCoins === 'number' ? data.orderBonusCoins : 100,
                    exchangeRateText: data.exchangeRateText || '1 Oktocoin = ₹1 Value',
                });
            }
        } catch (error) {
            console.error("Failed to fetch loyalty settings:", error);
            toast({
                title: 'Error loading loyalty settings',
                description: 'Using default loyalty configuration.',
                variant: 'destructive',
            });
        } finally {
            setLoadingLoyalty(false);
        }
    }, [toast]);

    React.useEffect(() => {
        fetchLoyaltySettings();
    }, [fetchLoyaltySettings]);

    const handleLoyaltyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setLoyaltySettings(prev => ({ ...prev, [name]: value }));
        if (name === 'oktocoinIconUrl') {
            setIconLoadError(false);
        }
    };

    const handleResetDefaultIcon = () => {
        setLoyaltySettings(prev => ({ ...prev, oktocoinIconUrl: DEFAULT_COIN_ICON }));
        setIconLoadError(false);
        toast({
            title: 'Reset to Default Icon',
            description: 'Default Oktocoin branding URL restored.',
        });
    };

    const handleSaveLoyalty = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSavingLoyalty(true);
        try {
            const res = await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    oktocoinIconUrl: loyaltySettings.oktocoinIconUrl.trim() || DEFAULT_COIN_ICON,
                    coinName: loyaltySettings.coinName.trim() || 'Oktocoin',
                    rewardCost: Number(loyaltySettings.rewardCost) || 500,
                    welcomeBonus: Number(loyaltySettings.welcomeBonus) || 100,
                    orderThreshold: Number(loyaltySettings.orderThreshold) || 499,
                    orderBonusCoins: Number(loyaltySettings.orderBonusCoins) || 100,
                    exchangeRateText: loyaltySettings.exchangeRateText.trim() || '1 Oktocoin = ₹1 Value',
                }),
            });

            if (!res.ok) {
                throw new Error('Failed to save settings');
            }

            toast({
                title: 'Loyalty Branding & Rules Saved',
                description: 'Coin icon and loyalty exchange parameters synced across store & mobile APIs.',
            });
        } catch (error) {
            console.error("Error saving loyalty settings:", error);
            toast({
                title: 'Save Failed',
                description: 'Could not save loyalty settings to database.',
                variant: 'destructive',
            });
        } finally {
            setIsSavingLoyalty(false);
        }
    };

    // Reward Catalog Item Handlers
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleEditClick = (reward: Reward) => {
        setIsEditing(true);
        setFormData({
            id: reward.id,
            name: reward.name,
            description: reward.description,
            imageUrl: reward.imageUrl,
            sizes: reward.sizes.join(', '),
        });
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.name && formData.imageUrl) {
            setIsSubmitting(true);
            
            const rewardData = {
                name: formData.name,
                description: formData.description,
                imageUrl: formData.imageUrl,
                sizes: formData.sizes.split(',').map(s => s.trim()).filter(s => s),
            };

            if (isEditing) {
                await updateReward({ ...rewardData, id: formData.id });
            } else {
                await addReward(rewardData);
            }
            
            resetForm();
            setIsSubmitting(false);
        }
    };
    
    const resetForm = () => {
        setFormData(emptyReward);
        setIsEditing(false);
    };

    const currentCoinIcon = loyaltySettings.oktocoinIconUrl.trim() || DEFAULT_COIN_ICON;

  return (
    <div className="space-y-8">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Reward Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your loyalty coin branding, exchange rules, and redeemable physical reward items.
          </p>
        </div>
      </div>

      {/* DEDICATED LOYALTY BRANDING & EXCHANGE CARD */}
      <Card className="border-amber-500/20 bg-gradient-to-br from-card via-card to-amber-950/10 shadow-sm overflow-hidden">
        <CardHeader className="border-b border-border/40 pb-5 bg-card/40">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-inner">
                <Coins className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <span>Loyalty Branding & Coin Settings</span>
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm mt-0.5">
                  Set the official coin icon, currency token naming, and exchange/earning parameters.
                </CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="w-fit text-amber-500 border-amber-500/30 bg-amber-500/10 text-xs px-2.5 py-1 flex items-center gap-1.5 font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Live Synced with Mobile App & API</span>
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-5 sm:p-6">
          {loadingLoyalty ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            </div>
          ) : (
            <form onSubmit={handleSaveLoyalty} className="space-y-6">
              {/* TOP ROW: COIN ICON URL & LIVE PREVIEW */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* ICON INPUT & CONTROLS */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="oktocoinIconUrl" className="text-sm font-semibold flex items-center gap-1.5">
                        <span>Oktocoin Icon URL</span>
                        <span className="text-xs text-amber-500 font-normal">(PNG / SVG / WebP)</span>
                      </Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleResetDefaultIcon}
                        className="h-7 text-xs text-muted-foreground hover:text-foreground px-2"
                      >
                        <RotateCcw className="w-3 h-3 mr-1" />
                        Reset Default
                      </Button>
                    </div>
                    <Input
                      id="oktocoinIconUrl"
                      name="oktocoinIconUrl"
                      value={loyaltySettings.oktocoinIconUrl}
                      onChange={handleLoyaltyChange}
                      placeholder="https://i.ibb.co/6RXzvrS6/oktocoin-v1-80x80.png"
                      disabled={isSavingLoyalty}
                      className="font-mono text-xs"
                    />
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Info className="w-3 h-3 text-muted-foreground/80 shrink-0" />
                      <span>This icon is sent over API to the mobile app and displayed in customer profile wallets and rewards.</span>
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="coinName" className="text-xs font-semibold">Coin Currency Name</Label>
                      <Input
                        id="coinName"
                        name="coinName"
                        value={loyaltySettings.coinName}
                        onChange={handleLoyaltyChange}
                        placeholder="Oktocoin"
                        disabled={isSavingLoyalty}
                      />
                      <p className="text-[11px] text-muted-foreground">e.g. Oktocoin, OktoCoins</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="rewardCost" className="text-xs font-semibold">Redemption Cost per Reward</Label>
                      <Input
                        id="rewardCost"
                        name="rewardCost"
                        type="number"
                        min="1"
                        value={loyaltySettings.rewardCost}
                        onChange={handleLoyaltyChange}
                        placeholder="500"
                        disabled={isSavingLoyalty}
                      />
                      <p className="text-[11px] text-muted-foreground">Coins required to redeem 1 reward item</p>
                    </div>
                  </div>
                </div>

                {/* LIVE PREVIEW BOX */}
                <div className="lg:col-span-5 bg-card/80 border border-amber-500/20 rounded-xl p-4 sm:p-5 flex flex-col justify-between space-y-4">
                  <div className="flex items-center justify-between border-b border-border/40 pb-2.5">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      Live Icon & UI Preview
                    </span>
                    <span className="text-[11px] text-amber-500 font-mono">Realtime</span>
                  </div>

                  <div className="flex items-center gap-4 py-2">
                    {/* Glowing Coin Frame */}
                    <div className="relative group shrink-0">
                      <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/30 to-yellow-500/30 rounded-full blur-md opacity-75 group-hover:opacity-100 transition duration-300" />
                      <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-full border border-amber-500/30 bg-background/90 p-2 flex items-center justify-center shadow-lg">
                        {iconLoadError ? (
                          <div className="flex flex-col items-center justify-center text-center p-1">
                            <Coins className="w-7 h-7 text-amber-500/60" />
                          </div>
                        ) : (
                          <Image
                            src={currentCoinIcon}
                            alt="Oktocoin preview"
                            width={54}
                            height={54}
                            unoptimized
                            onError={() => setIconLoadError(true)}
                            className="object-contain drop-shadow"
                          />
                        )}
                      </div>
                    </div>

                    {/* Simulation Mock Badges */}
                    <div className="space-y-2 min-w-0 flex-1">
                      <div className="text-xs text-muted-foreground">In-App Preview:</div>
                      
                      {/* Wallet Balance Pill Simulation */}
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/80 border border-border text-xs font-medium">
                        <Image
                          src={currentCoinIcon}
                          alt="Icon"
                          width={14}
                          height={14}
                          unoptimized
                          className="shrink-0"
                        />
                        <span className="font-bold">{loyaltySettings.rewardCost}</span>
                        <span className="text-muted-foreground">{loyaltySettings.coinName}</span>
                      </div>

                      {/* Unlock Alert Simulation */}
                      <div className="text-[11px] text-amber-500/90 flex items-center gap-1 font-medium">
                        <CheckCircle2 className="w-3 h-3 shrink-0" />
                        <span>+{loyaltySettings.welcomeBonus} {loyaltySettings.coinName} Welcome Bonus</span>
                      </div>
                    </div>
                  </div>

                  {iconLoadError && (
                    <div className="text-[11px] text-destructive bg-destructive/10 p-2 rounded-lg">
                      Could not load image from URL. Please check the URL or click Reset Default.
                    </div>
                  )}
                </div>
              </div>

              {/* SECOND ROW: EXCHANGE & INCENTIVE RULES */}
              <div className="border-t border-border/40 pt-5 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Loyalty Earning & Valuation Rules
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="welcomeBonus" className="text-xs font-semibold">Signup / Welcome Bonus</Label>
                    <Input
                      id="welcomeBonus"
                      name="welcomeBonus"
                      type="number"
                      min="0"
                      value={loyaltySettings.welcomeBonus}
                      onChange={handleLoyaltyChange}
                      placeholder="100"
                      disabled={isSavingLoyalty}
                    />
                    <p className="text-[11px] text-muted-foreground">Coins awarded when a user verifies email/phone</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="orderThreshold" className="text-xs font-semibold">Qualifying Order Min (₹)</Label>
                    <Input
                      id="orderThreshold"
                      name="orderThreshold"
                      type="number"
                      min="0"
                      value={loyaltySettings.orderThreshold}
                      onChange={handleLoyaltyChange}
                      placeholder="499"
                      disabled={isSavingLoyalty}
                    />
                    <p className="text-[11px] text-muted-foreground">Minimum cart total to earn reward coins</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="orderBonusCoins" className="text-xs font-semibold">Coins Earned per Order</Label>
                    <Input
                      id="orderBonusCoins"
                      name="orderBonusCoins"
                      type="number"
                      min="0"
                      value={loyaltySettings.orderBonusCoins}
                      onChange={handleLoyaltyChange}
                      placeholder="100"
                      disabled={isSavingLoyalty}
                    />
                    <p className="text-[11px] text-muted-foreground">Coins credited upon successful order completion</p>
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <Label htmlFor="exchangeRateText" className="text-xs font-semibold">Valuation / Exchange Note</Label>
                  <Input
                    id="exchangeRateText"
                    name="exchangeRateText"
                    value={loyaltySettings.exchangeRateText}
                    onChange={handleLoyaltyChange}
                    placeholder="1 Oktocoin = ₹1 Value"
                    disabled={isSavingLoyalty}
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Public loyalty explanation displayed on rewards page and policy docs.
                  </p>
                </div>
              </div>

              {/* SAVE BUTTON */}
              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  disabled={isSavingLoyalty}
                  className="bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs sm:text-sm px-6"
                >
                  {isSavingLoyalty ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving Loyalty Settings...
                    </>
                  ) : (
                    <>
                      <Coins className="mr-2 h-4 w-4" />
                      Save Loyalty Branding & Rules
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* SECTION 2: REDEEMABLE PHYSICAL REWARDS CATALOG */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Redeemable Rewards Catalog</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Manage merchandise and apparel items customers can claim with their {loyaltySettings.coinName || 'Oktocoins'}.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 sm:gap-8 min-w-0 max-w-full">
          {/* LEFT: ADD / EDIT REWARD ITEM FORM */}
          <div className="md:col-span-1 min-w-0 w-full">
            <Card>
              <CardHeader>
                <CardTitle>{isEditing ? 'Edit Reward' : 'Add New Reward'}</CardTitle>
                <CardDescription>{isEditing ? 'Update the details of the existing reward.' : 'Create a new reward item.'}</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Reward Name</Label>
                    <Input id="name" name="name" value={formData.name} onChange={handleInputChange} placeholder="e.g., Exclusive Tee" required disabled={isSubmitting} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" name="description" value={formData.description} onChange={handleInputChange} placeholder="A short description" disabled={isSubmitting} />
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="imageUrl">Image URL</Label>
                    <Input id="imageUrl" name="imageUrl" value={formData.imageUrl} onChange={handleInputChange} placeholder="https://placehold.co/400x400.png" required disabled={isSubmitting} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sizes">Available Sizes</Label>
                    <Input id="sizes" name="sizes" value={formData.sizes} onChange={handleInputChange} placeholder="e.g., S, M, L, XL" disabled={isSubmitting} />
                      <p className="text-xs text-muted-foreground">Comma-separated sizes.</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Rewards are redeemable for a fixed cost of {loyaltySettings.rewardCost} {loyaltySettings.coinName}.
                  </p>

                  <div className="flex gap-2">
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {isEditing ? 'Updating...' : 'Adding...'}</> : (isEditing ? 'Update Reward' : 'Add Reward')}
                    </Button>
                    {isEditing && (
                        <Button type="button" variant="outline" onClick={resetForm} disabled={isSubmitting}>Cancel</Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT: MANAGE REWARDS TABLE */}
          <div className="md:col-span-2 min-w-0 w-full">
            <Card className="min-w-0 overflow-hidden">
              <CardHeader>
                <CardTitle>Manage Rewards</CardTitle>
                <CardDescription>View, edit, or delete your redeemable reward items.</CardDescription>
              </CardHeader>
              <CardContent className="min-w-0 overflow-hidden p-3 sm:p-6">
                <div className="border rounded-lg overflow-x-auto w-full max-w-full">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Image</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Sizes</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        Array.from({ length: 3 }).map((_, index) => (
                            <TableRow key={index}>
                              <TableCell><Skeleton className="h-10 w-10 rounded-md" /></TableCell>
                              <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                              <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                              <TableCell className="text-right"><Skeleton className="h-8 w-20" /></TableCell>
                            </TableRow>
                        ))
                      ) : rewards.length > 0 ? (
                        rewards.map((reward) => (
                          <TableRow key={reward.id}>
                            <TableCell>
                              <Image src={reward.imageUrl || 'https://placehold.co/40x40.png'} alt={reward.name} width={40} height={40} className="rounded-md object-cover" />
                            </TableCell>
                            <TableCell className="font-medium">{reward.name}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{reward.sizes.join(', ')}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="icon" className="mr-2" onClick={() => handleEditClick(reward)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => deleteReward(reward.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center h-24">
                            <div className="flex flex-col items-center gap-2">
                                <Gift className="h-8 w-8 text-muted-foreground" />
                                <p>No rewards found.</p>
                                <Button variant="outline" size="sm" onClick={() => document.getElementById('name')?.focus()}>
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Add New Reward
                                </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
