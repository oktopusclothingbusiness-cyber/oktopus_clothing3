
'use client';

import * as React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { MobileHeader } from "@/components/mobile-header";
import { MobileFooter } from "@/components/mobile-footer";
import { Search, Loader2, XCircle, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Image from 'next/image';
import Link from 'next/link';

type VerifiedProduct = {
    id: string;
    name: string;
    price: number;
    imageUrl: string;
}

export default function VerifyProductPage() {
    const [productId, setProductId] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);
    const [verifiedProduct, setVerifiedProduct] = React.useState<VerifiedProduct | null>(null);
    const [error, setError] = React.useState<string | null>(null);
    const { toast } = useToast();

    const handleVerification = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!productId.trim()) {
            toast({ title: 'Product ID required', description: 'Please enter a product ID to verify.', variant: 'destructive' });
            return;
        }
        
        setIsLoading(true);
        setVerifiedProduct(null);
        setError(null);

        try {
            const response = await fetch(`/api/products/verify/${productId.trim()}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Product not found.');
            }
            
            setVerifiedProduct(data);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };
    
    const resetState = () => {
      setVerifiedProduct(null);
      setError(null);
      setProductId('');
    }

    const VerificationForm = ({ isMobile = false }) => (
        <Card className={isMobile ? "w-full max-w-sm card-glass" : "w-full max-w-md"}>
            <CardHeader className="text-center">
                <ShieldCheck className="mx-auto h-12 w-12 text-primary" />
                <CardTitle className="text-2xl">Verify Your Product</CardTitle>
                <CardDescription>Enter the Product ID to confirm its authenticity.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleVerification} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="product-id" className="sr-only">Product ID</Label>
                        <Input
                            id="product-id"
                            placeholder="Enter Product ID"
                            value={productId}
                            onChange={(e) => setProductId(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                        Verify Product
                    </Button>
                </form>
            </CardContent>
        </Card>
    );

    const ResultDisplay = () => {
        if (isLoading) {
            return <Loader2 className="h-8 w-8 animate-spin text-primary" />;
        }
        if (error) {
            return (
                <div className="text-center text-destructive">
                    <XCircle className="mx-auto h-12 w-12" />
                    <h3 className="mt-4 text-lg font-semibold">{error}</h3>
                    <p className="text-sm">Please check the ID and try again.</p>
                </div>
            );
        }
        if (verifiedProduct) {
            return (
                <Link href={`/products/${verifiedProduct.id}`}>
                    <Card className="w-full max-w-sm overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <CardTitle>{verifiedProduct.name}</CardTitle>
                            <CardDescription>Product Verified!</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center gap-4">
                           <div className="relative w-48 h-48">
                             <Image src={verifiedProduct.imageUrl} alt={verifiedProduct.name} layout="fill" objectFit="contain" className="rounded-md" />
                           </div>
                           <p className="text-2xl font-bold">₹{verifiedProduct.price.toFixed(2)}</p>
                           <Button variant="outline" className="w-full">View Details</Button>
                        </CardContent>
                    </Card>
                </Link>
            )
        }
        return null;
    }


    return (
        <>
            {/* Desktop View */}
            <div className="hidden md:flex flex-col min-h-screen">
                <Header />
                <main className="flex-grow flex flex-col items-center justify-center bg-secondary p-4">
                    {!verifiedProduct && !error && !isLoading && <VerificationForm />}
                    <ResultDisplay />
                     {(verifiedProduct || error) && !isLoading && (
                        <Button variant="link" className="mt-4" onClick={resetState}>
                            Verify another product
                        </Button>
                    )}
                </main>
                <Footer />
            </div>

            {/* Mobile View */}
            <div className="md:hidden">
                <MobileHeader title="Verify Product" />
                <main className="min-h-screen bg-secondary flex flex-col items-center justify-center p-4 pb-24">
                     {!verifiedProduct && !error && !isLoading && <VerificationForm isMobile={true} />}
                     <ResultDisplay />
                     {(verifiedProduct || error) && !isLoading && (
                        <Button variant="link" className="mt-4" onClick={resetState}>
                            Verify another product
                        </Button>
                    )}
                </main>
                <MobileFooter />
            </div>
        </>
    );
}
