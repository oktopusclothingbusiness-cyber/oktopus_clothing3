
'use client';

import * as React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminShippingPage() {
    const [deliveryCharge, setDeliveryCharge] = React.useState(0);
    const [loading, setLoading] = React.useState(true);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const { toast } = useToast();

    const fetchSettings = React.useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/settings');
            if (response.ok) {
                const data = await response.json();
                setDeliveryCharge(data.deliveryCharge || 0);
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
                body: JSON.stringify({ deliveryCharge }),
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

    return (
        <>
            <h1 className="text-3xl font-bold mb-8">Shipping Settings</h1>
            <Card className="max-w-2xl">
                <CardHeader>
                    <CardTitle>Delivery Charges</CardTitle>
                    <CardDescription>Manage shipping fees for your store.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                         <div className="space-y-4">
                            <Skeleton className="h-5 w-24" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-28" />
                         </div>
                    ) : (
                        <form onSubmit={handleFormSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="deliveryCharge">Standard Delivery Charge (₹)</Label>
                                <Input 
                                    id="deliveryCharge" 
                                    name="deliveryCharge"
                                    type="number"
                                    min="0"
                                    value={deliveryCharge} 
                                    onChange={(e) => setDeliveryCharge(parseFloat(e.target.value))} 
                                    placeholder="e.g., 50" 
                                    disabled={isSubmitting} 
                                />
                                <p className="text-xs text-muted-foreground">
                                    Set a standard delivery fee for all orders. Enter 0 for free shipping.
                                </p>
                            </div>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : 'Save Settings'}
                            </Button>
                        </form>
                    )}
                </CardContent>
            </Card>
        </>
    );
}
