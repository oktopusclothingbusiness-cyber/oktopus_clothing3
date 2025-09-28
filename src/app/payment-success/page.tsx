
'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { MobileFooter } from '@/components/mobile-footer';
import { MobileHeader } from '@/components/mobile-header';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';

export default function PaymentSuccessPage() {
  return (
    <>
        {/* Desktop View */}
        <div className="hidden md:flex flex-col min-h-screen bg-background">
            <Header/>
            <main className="flex-grow flex items-center justify-center text-center">
                <div className="flex flex-col items-center">
                    <div className="success-animation">
                        <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                            <circle className="checkmark__circle" cx="26" cy="26" r="25" fill="none" />
                            <path className="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
                        </svg>
                    </div>
                    <h1 className="text-4xl font-bold mt-8 animate-fade-in-up" style={{animationDelay: '0.5s'}}>Order Placed Successfully!</h1>
                    <p className="text-muted-foreground mt-2 animate-fade-in-up" style={{animationDelay: '0.7s'}}>
                        Thank you for your purchase. More information is available in your profile section.
                    </p>
                    <div className="flex gap-4 mt-8 animate-fade-in-up" style={{animationDelay: '0.9s'}}>
                        <Button asChild>
                            <Link href="/profile">Go to Profile</Link>
                        </Button>
                        <Button variant="outline" asChild>
                           <Link href="/store">Continue Shopping</Link>
                        </Button>
                    </div>
                </div>
            </main>
            <Footer/>
        </div>

        {/* Mobile View */}
        <div className="md:hidden flex flex-col min-h-screen bg-background">
            <MobileHeader title="Order Placed"/>
            <main className="flex-grow flex items-center justify-center text-center p-4">
                 <div className="flex flex-col items-center">
                    <div className="success-animation">
                        <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                            <circle className="checkmark__circle" cx="26" cy="26" r="25" fill="none" />
                            <path className="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold mt-8 animate-fade-in-up" style={{animationDelay: '0.5s'}}>Order Placed!</h1>
                    <p className="text-muted-foreground mt-2 animate-fade-in-up" style={{animationDelay: '0.7s'}}>
                        You can find more details in your profile.
                    </p>
                     <Button asChild className="w-full mt-8 animate-fade-in-up" style={{animationDelay: '0.9s'}}>
                        <Link href="/profile">View My Orders</Link>
                    </Button>
                </div>
            </main>
            <MobileFooter/>
        </div>
    </>
  );
}

