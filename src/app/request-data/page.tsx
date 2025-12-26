'use client';

import * as React from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { Loader2, FileText } from 'lucide-react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { MobileHeader } from '@/components/mobile-header';
import { MobileFooter } from '@/components/mobile-footer';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function RequestDataPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/users/request-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user._id }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to submit request.');
      }
      
      toast({
        title: 'Data Request Submitted',
        description: 'Your request has been received. We will email you a copy of your data within 7 business days.',
        duration: 8000
      });
      router.push('/profile');

    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
        setIsSubmitting(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  const content = (
     <Card className="w-full max-w-lg">
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <FileText className="h-6 w-6" />
                Request Your Data
            </CardTitle>
            <CardDescription>
                Submit a request to receive a copy of your personal data stored on our platform.
            </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
            <CardContent>
                <p className="text-sm text-muted-foreground">
                    In accordance with privacy regulations, you have the right to request a copy of the data we hold about you. This includes your account information, order history, and any other personal details. After submitting your request, we will compile your data and send it to your registered email address.
                </p>
            </CardContent>
            <CardFooter>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting...</> : 'Submit Data Request'}
                </Button>
            </CardFooter>
        </form>
    </Card>
  );

  return (
    <>
      {/* Desktop View */}
      <div className="hidden md:flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-12 flex items-center justify-center">
          {content}
        </main>
        <Footer />
      </div>

      {/* Mobile View */}
      <div className="md:hidden">
        <MobileHeader title="Request Your Data" />
        <main className="bg-secondary min-h-screen pb-24 p-4">
            <Card className="card-glass">{content}</Card>
        </main>
        <MobileFooter />
      </div>
    </>
  );
}
