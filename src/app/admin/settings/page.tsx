
'use client';

import * as React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from 'next/link';
import { Loader2, Coins, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminSettingsPage() {
    const [settings, setSettings] = React.useState({
        logoUrl: '',
        faviconUrl: ''
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
                    faviconUrl: data.faviconUrl || ''
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
