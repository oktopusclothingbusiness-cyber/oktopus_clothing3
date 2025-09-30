
'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Invoice } from '@/components/invoice';

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
}

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
        <p className="ml-2">Loading Invoice...</p>
      </div>
    );
  }

  if (!order) {
    return <p>Order not found.</p>;
  }

  return <Invoice order={order} settings={settings} />;
}
