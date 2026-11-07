import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shipping and Delivery Policy',
  description:
    'Information on delivery times, shipping charges, express courier partners, and order tracking for all Oktopus Clothing shipments.',
  alternates: {
    canonical: 'https://www.oktopusclothing.in/shipping-policy',
  },
};

export default function ShippingPolicyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

