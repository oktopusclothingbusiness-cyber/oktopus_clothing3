
'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Printer, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Invoice } from '@/components/invoice';
import Link from 'next/link';

type OrderProduct = {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  size: string;
  color: string;
};

type Order = {
  _id: string;
  userId: string;
  userName: string;
  products: OrderProduct[];
  total: number;
  shipping: number;
  discount: number;
  subtotal: number;
  shippingAddress: {
    mobile: string;
    address: string;
    instructions: string;
  };
  status: string;
  createdAt: string;
  paymentDetails: {
    razorpay_payment_id?: string;
    paymentStatus?: 'paid' | 'pending';
  };
};

type Settings = {
  logoUrl?: string;
};

export default function InvoicePage() {
  const params = useParams();
  const { id } = params;
  const { toast } = useToast();
  const [order, setOrder] = React.useState<Order | null>(null);
  const [settings, setSettings] = React.useState<Settings | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (id) {
      const fetchOrderAndSettings = async () => {
        try {
          setLoading(true);
          const [orderRes, settingsRes] = await Promise.all([
            fetch(`/api/orders/${id}`),
            fetch('/api/settings'),
          ]);

          if (!orderRes.ok) throw new Error("Failed to fetch order");
          const orderData = await orderRes.json();
          setOrder(orderData);

          if(settingsRes.ok) {
            const settingsData = await settingsRes.json();
            setSettings(settingsData);
          }

        } catch (error) {
          console.error(error);
          toast({
            title: 'Error',
            description: 'Could not load invoice details.',
            variant: 'destructive',
          });
        } finally {
          setLoading(false);
        }
      };
      fetchOrderAndSettings();
    }
  }, [id, toast]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2 font-mono text-sm">Loading Tax Invoice...</p>
      </div>
    );
  }

  if (!order) {
    return <p className="p-8 text-center text-sm font-mono">Order not found.</p>;
  }

  return (
    <div className="min-h-screen bg-slate-100/60 print:bg-white">
      {/* Global Print Override Stylesheet */}
      <style jsx global>{`
        @media print {
          body {
            background-color: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print\\:hidden, header, nav, footer, button, [class*="FloatingCart"], [class*="floating-cart"] {
            display: none !important;
          }
          @page {
            margin: 8mm;
          }
        }
      `}</style>

      {/* Top Action Bar (Hidden when printing) */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-50 px-4 py-3 print:hidden">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold font-mono uppercase tracking-widest text-slate-500">Invoice Viewer</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => window.print()}
              size="sm"
              className="bg-slate-900 text-white hover:bg-slate-800 rounded-lg text-xs font-semibold shadow-xs"
            >
              <Printer className="mr-2 h-3.5 w-3.5" /> Print Invoice
            </Button>
          </div>
        </div>
      </div>

      <Invoice order={order} settings={settings} />
    </div>
  );
}
