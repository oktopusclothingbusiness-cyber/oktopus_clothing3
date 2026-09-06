
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
    const [deliveryCharge, setDeliveryCharge] = React.useState(100);
    const [freeDeliveryThreshold, setFreeDeliveryThreshold] = React.useState(999);
    const [estimatedDeliveryDays, setEstimatedDeliveryDays] = React.useState(10);
    const [loading, setLoading] = React.useState(true);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const { toast } = useToast();

    const fetchSettings = React.useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/settings');
            if (response.ok) {
                const data = await response.json();
                setDeliveryCharge(typeof data.deliveryCharge === 'number' ? data.deliveryCharge : 100);
                setFreeDeliveryThreshold(typeof data.freeDeliveryThreshold === 'number' ? data.freeDeliveryThreshold : 999);
                setEstimatedDeliveryDays(typeof data.estimatedDeliveryDays === 'number' ? data.estimatedDeliveryDays : 10);
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
                body: JSON.stringify({
                    deliveryCharge,
                    freeDeliveryThreshold,
                    estimatedDeliveryDays,
                    currency: 'INR',
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to save settings');
            }

            toast({
                title: 'Settings Saved',
                description: 'Shipping and delivery fee settings updated successfully.',
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
            <h1 className="text-3xl font-bold mb-8">Shipping and Delivery Settings</h1>
            <Card className="max-w-2xl">
                <CardHeader>
                    <CardTitle>Delivery Charges and Rules</CardTitle>
                    <CardDescription>Configure delivery fees, free shipping thresholds, and estimated timelines for web and mobile apps.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                         <div className="space-y-4">
                            <Skeleton className="h-5 w-24" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-28" />
                         </div>
                    ) : (
                        <form onSubmit={handleFormSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="deliveryCharge">Standard Delivery Charge (INR)</Label>
                                <Input 
                                    id="deliveryCharge" 
                                    name="deliveryCharge"
                                    type="number"
                                    min="0"
                                    value={deliveryCharge} 
                                    onChange={(e) => setDeliveryCharge(parseFloat(e.target.value) || 0)} 
                                    placeholder="e.g., 100" 
                                    disabled={isSubmitting} 
                                />
                                <p className="text-xs text-muted-foreground">
                                    Base delivery fee applied to orders. Set to 0 for store-wide free shipping.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="freeDeliveryThreshold">Free Delivery Threshold (INR)</Label>
                                <Input 
                                    id="freeDeliveryThreshold" 
                                    name="freeDeliveryThreshold"
                                    type="number"
                                    min="0"
                                    value={freeDeliveryThreshold} 
                                    onChange={(e) => setFreeDeliveryThreshold(parseFloat(e.target.value) || 0)} 
                                    placeholder="e.g., 999" 
                                    disabled={isSubmitting} 
                                />
                                <p className="text-xs text-muted-foreground">
                                    Orders with a subtotal equal to or exceeding this amount automatically qualify for free delivery. Enter 0 to disable.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="estimatedDeliveryDays">Estimated Delivery Timeline (Days)</Label>
                                <Input 
                                    id="estimatedDeliveryDays" 
                                    name="estimatedDeliveryDays"
                                    type="number"
                                    min="1"
                                    max="60"
                                    value={estimatedDeliveryDays} 
                                    onChange={(e) => setEstimatedDeliveryDays(parseInt(e.target.value) || 10)} 
                                    placeholder="e.g., 10" 
                                    disabled={isSubmitting} 
                                />
                                <p className="text-xs text-muted-foreground">
                                    Average number of days displayed to customers during checkout and tracking.
                                </p>
                            </div>

                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : 'Save Shipping Settings'}
                            </Button>
                        </form>
                    )}
                </CardContent>
            </Card>
        </>
    );
}
