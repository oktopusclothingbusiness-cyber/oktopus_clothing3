import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us & Customer Support',
  description:
    'Have a question about an order, custom prints, or sizing? Contact Oktopus Clothing via WhatsApp, email, or our support form. We are here to help.',
  alternates: {
    canonical: 'https://www.oktopusclothing.in/contact',
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://www.oktopusclothing.in/contact',
    siteName: 'Oktopus Clothing',
    title: 'Contact Us & Customer Support | Oktopus Clothing',
    description:
      'Have a question about an order, custom prints, or sizing? Contact Oktopus Clothing via WhatsApp, email, or our support form.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Us & Customer Support | Oktopus Clothing',
    description:
      'Have a question about an order, custom prints, or sizing? Contact Oktopus Clothing via WhatsApp, email, or our support form.',
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

