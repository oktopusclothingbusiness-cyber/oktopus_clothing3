
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
import { motion, AnimatePresence } from 'framer-motion';

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

    const animationVariants = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
    };

    const VerificationForm = () => (
        <Card className="w-full max-w-md">
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
        return (
             <AnimatePresence mode="wait">
                {isLoading && (
                    <motion.div
                        key="loading"
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        variants={animationVariants}
                        className="text-center"
                    >
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                        <p className="mt-4 text-muted-foreground">Verifying...</p>
                    </motion.div>
                )}
                {error && (
                    <motion.div
                        key="error"
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        variants={animationVariants}
                        className="text-center text-destructive"
                    >
                        <XCircle className="mx-auto h-16 w-16" />
                        <h3 className="mt-4 text-2xl font-semibold">Verification Failed</h3>
                        <p className="text-muted-foreground">{error}</p>
                    </motion.div>
                )}
                {verifiedProduct && (
                    <motion.div
                        key="success"
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        variants={animationVariants}
                        className="w-full max-w-sm text-center"
                    >
                         <div className="text-center text-green-600">
                            <ShieldCheck className="mx-auto h-16 w-16" />
                            <h3 className="mt-4 text-2xl font-semibold">Product Verified!</h3>
                        </div>
                        <Link href={`/products/${verifiedProduct.id}`}>
                            <Card className="w-full overflow-hidden cursor-pointer hover:shadow-lg transition-shadow mt-6">
                                <CardContent className="p-0">
                                   <div className="relative w-full aspect-square bg-muted">
                                     <Image src={verifiedProduct.imageUrl} alt={verifiedProduct.name} layout="fill" objectFit="cover" />
                                   </div>
                                   <div className="p-4">
                                      <h4 className="font-bold text-lg">{verifiedProduct.name}</h4>
                                      <p className="text-xl font-bold text-primary">₹{verifiedProduct.price.toFixed(2)}</p>
                                   </div>
                                </CardContent>
                            </Card>
                        </Link>
                    </motion.div>
                )}
            </AnimatePresence>
        );
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
                <main className="min-h-screen bg-background flex flex-col items-center justify-center p-4 pb-24">
                     {(!verifiedProduct && !error && !isLoading) ? (
                        <motion.div 
                            key="form"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="w-full max-w-sm text-center">
                            <ShieldCheck className="mx-auto h-12 w-12 text-primary" />
                            <h1 className="text-2xl font-bold mt-4">Verify Your Product</h1>
                            <p className="text-muted-foreground mt-2 mb-8">Enter the Product ID to confirm its authenticity.</p>
                            <form onSubmit={handleVerification} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="product-id-mobile" className="sr-only">Product ID</Label>
                                    <Input
                                        id="product-id-mobile"
                                        placeholder="Enter Product ID"
                                        value={productId}
                                        onChange={(e) => setProductId(e.target.value)}
                                        disabled={isLoading}
                                        className="h-12 text-center text-lg"
                                    />
                                </div>
                                <Button size="lg" type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                                    Verify Product
                                </Button>
                            </form>
                        </motion.div>
                     ) : (
                        <>
                           <ResultDisplay />
                           <Button variant="outline" className="mt-8" onClick={resetState}>
                                Verify Another Product
                           </Button>
                        </>
                     )}
                </main>
                <MobileFooter />
            </div>
        </>
    );
}
