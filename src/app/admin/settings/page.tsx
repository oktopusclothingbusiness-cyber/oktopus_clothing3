
'use client';

import * as React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from 'next/link';
import { Loader2, Coins, ArrowRight, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useProduct } from '@/context/product-context';

export default function AdminSettingsPage() {
    const { products } = useProduct();
    const [settings, setSettings] = React.useState({
        logoUrl: '',
        faviconUrl: '',
        heroLook1Id: '',
        heroLook2Id: '',
        heroLook3Id: '',
    });
    const [loading, setLoading] = React.useState(true);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const { toast } = useToast();

    const fetchSettings = React.useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/settings');
            if (response.ok) {
                const data = await response.json();
                setSettings({
                    logoUrl: data.logoUrl || '',
                    faviconUrl: data.faviconUrl || '',
                    heroLook1Id: data.heroLook1Id || '',
                    heroLook2Id: data.heroLook2Id || '',
                    heroLook3Id: data.heroLook3Id || '',
                });
            }
        } catch (error) {
            console.error("Failed to fetch settings:", error);
            toast({
                title: 'Error',
                description: 'Could not fetch settings.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    React.useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const response = await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings),
            });

            if (!response.ok) {
                throw new Error('Failed to save settings');
            }

            toast({
                title: 'Settings Saved',
                description: 'Your changes have been saved successfully.',
            });
        } catch (error) {
            console.error("Failed to save settings:", error);
            toast({
                title: 'Error',
                description: 'Could not save settings.',
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));
    }

    return (
        <>
            <h1 className="text-3xl font-bold mb-8">Site Settings</h1>
            <Card className="max-w-2xl">
                <CardHeader>
                    <CardTitle>General Settings</CardTitle>
                    <CardDescription>Manage general settings for your website.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                         <div className="space-y-4">
                            <Skeleton className="h-5 w-24" />
                            <Skeleton className="h-10 w-full" />
                             <Skeleton className="h-5 w-24 mt-4" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-28 mt-4" />
                         </div>
                    ) : (
                        <form onSubmit={handleFormSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="logoUrl">Logo Image URL</Label>
                                <Input 
                                    id="logoUrl" 
                                    name="logoUrl" 
                                    value={settings.logoUrl} 
                                    onChange={handleInputChange} 
                                    placeholder="https://example.com/logo.png" 
                                    disabled={isSubmitting} 
                                />
                                <p className="text-xs text-muted-foreground">
                                    Enter the full URL for your site's logo. This will be displayed in the header.
                                </p>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="faviconUrl">Favicon URL</Label>
                                <Input 
                                    id="faviconUrl" 
                                    name="faviconUrl" 
                                    value={settings.faviconUrl} 
                                    onChange={handleInputChange}
                                    placeholder="https://example.com/favicon.ico" 
                                    disabled={isSubmitting} 
                                />
                                <p className="text-xs text-muted-foreground">
                                    Enter the full URL for your site's favicon.
                                </p>
                            </div>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : 'Save Settings'}
                            </Button>
                        </form>
                    )}
                </CardContent>
            </Card>

            {/* HOMEPAGE HERO SECTION (3 LOOKS) CARD */}
            <Card className="max-w-2xl mt-6 border-primary/20">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                        Homepage Hero Section Drops (3 Looks)
                    </CardTitle>
                    <CardDescription>
                        Select which products are showcased in the 3 interactive panels of the homepage hero section.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleFormSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="heroLook1Id" className="text-xs font-semibold">
                                Look 01 (Primary Hero Drop)
                            </Label>
                            <select
                                id="heroLook1Id"
                                name="heroLook1Id"
                                value={settings.heroLook1Id}
                                onChange={(e) => setSettings(prev => ({ ...prev, heroLook1Id: e.target.value }))}
                                className="w-full h-10 px-3 text-xs bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                            >
                                <option value="">Default (First Active Hero Product)</option>
                                {products.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.name} — ₹{p.price}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="heroLook2Id" className="text-xs font-semibold">
                                Look 02 (Secondary Drop)
                            </Label>
                            <select
                                id="heroLook2Id"
                                name="heroLook2Id"
                                value={settings.heroLook2Id}
                                onChange={(e) => setSettings(prev => ({ ...prev, heroLook2Id: e.target.value }))}
                                className="w-full h-10 px-3 text-xs bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                            >
                                <option value="">Default (Second Product in Catalog)</option>
                                {products.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.name} — ₹{p.price}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="heroLook3Id" className="text-xs font-semibold">
                                Look 03 (Third Drop)
                            </Label>
                            <select
                                id="heroLook3Id"
                                name="heroLook3Id"
                                value={settings.heroLook3Id}
                                onChange={(e) => setSettings(prev => ({ ...prev, heroLook3Id: e.target.value }))}
                                className="w-full h-10 px-3 text-xs bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                            >
                                <option value="">Default (Third Product in Catalog)</option>
                                {products.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.name} — ₹{p.price}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="pt-2">
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : 'Save Hero Drops'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <Card className="max-w-2xl mt-6 border-amber-500/20 bg-amber-500/5">
                <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
                            <Coins className="h-5 w-5" />
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-foreground">Oktocoin & Loyalty Branding</h4>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Set the official coin icon, currency token naming, and redemption rules.
                            </p>
                        </div>
                    </div>
                    <Link
                        href="/admin/rewards"
                        className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white transition shrink-0"
                    >
                        <span>Manage Coin Icon</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </CardContent>
            </Card>
        </>
    );
}
