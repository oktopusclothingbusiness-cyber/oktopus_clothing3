import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Return and Refund Policy',
  description:
    'Learn about our replacement and return policy for damaged, defective, or incorrect items received from Oktopus Clothing.',
  alternates: {
    canonical: 'https://www.oktopusclothing.in/return-policy',
  },
};

export default function ReturnPolicyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

