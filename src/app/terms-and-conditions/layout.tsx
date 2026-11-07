import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms and Conditions',
  description:
    'Review the terms and conditions governing the use of the Oktopus Clothing official website, orders, payments, and services.',
  alternates: {
    canonical: 'https://www.oktopusclothing.in/terms-and-conditions',
  },
};

export default function TermsAndConditionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

