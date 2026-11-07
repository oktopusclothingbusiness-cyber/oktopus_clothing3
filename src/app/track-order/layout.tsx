import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Track Your Order Status',
  description:
    'Track your Oktopus Clothing shipment in real-time. Enter your Order ID to check live courier delivery updates.',
  alternates: {
    canonical: 'https://www.oktopusclothing.in/track-order',
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://www.oktopusclothing.in/track-order',
    siteName: 'Oktopus Clothing',
    title: 'Track Your Order Status | Oktopus Clothing',
    description:
      'Track your Oktopus Clothing shipment in real-time. Enter your Order ID to check live courier delivery updates.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Track Your Order Status | Oktopus Clothing',
    description:
      'Track your Oktopus Clothing shipment in real-time. Enter your Order ID to check live courier delivery updates.',
  },
};

export default function TrackOrderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

