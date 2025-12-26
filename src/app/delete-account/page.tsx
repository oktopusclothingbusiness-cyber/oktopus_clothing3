'use client';

import * as React from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { Loader2, ShieldAlert } from 'lucide-react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { MobileHeader } from '@/components/mobile-header';
import { MobileFooter } from '@/components/mobile-footer';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';

export default function DeleteAccountPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isChecked, setIsChecked] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!isChecked) {
      toast({
        title: 'Confirmation Required',
        description: 'Please check the box to confirm you understand the consequences.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/users/request-deletion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user._id }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to submit request.');
      }
      
      toast({
        title: 'Deletion Request Submitted',
        description: 'Your account deletion request has been received. We will process it and notify you within 7 business days. You will now be logged out.',
        duration: 8000,
      });

      // Log the user out after submitting the request
      setTimeout(() => {
        logout();
      }, 3000);

    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
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
            <ShieldAlert className="h-6 w-6 text-destructive" />
            Request Account Deletion
        </CardTitle>
        <CardDescription>
          This is a permanent action. Please read carefully before proceeding.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            By requesting account deletion, you understand that all your personal data, including your order history, saved addresses, and custom designs, will be permanently removed from our systems. This action cannot be undone.
          </p>
          <div className="flex items-center space-x-2">
            <Checkbox id="confirmation" checked={isChecked} onCheckedChange={(checked) => setIsChecked(checked as boolean)} />
            <label
              htmlFor="confirmation"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I understand that this action is irreversible and I want to permanently delete my account.
            </label>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" variant="destructive" className="w-full" disabled={!isChecked || isSubmitting}>
            {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting...</> : 'Submit Deletion Request'}
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
        <MobileHeader title="Delete Account" />
        <main className="bg-secondary min-h-screen pb-24 p-4">
          <Card className="card-glass">{content}</Card>
        </main>
        <MobileFooter />
      </div>
    </>
  );
}
