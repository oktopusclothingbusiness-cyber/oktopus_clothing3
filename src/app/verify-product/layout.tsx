import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Verify Authenticity | Genuine Oktopus Apparel',
  description:
    'Verify your genuine Oktopus Clothing merchandise using our anti-counterfeit product verification code.',
  alternates: {
    canonical: 'https://www.oktopusclothing.in/verify-product',
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://www.oktopusclothing.in/verify-product',
    siteName: 'Oktopus Clothing',
    title: 'Verify Authenticity | Genuine Oktopus Apparel',
    description:
      'Verify your genuine Oktopus Clothing merchandise using our anti-counterfeit product verification code.',
  },
};

export default function VerifyProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

