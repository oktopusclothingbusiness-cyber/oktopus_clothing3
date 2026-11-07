import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Custom T-Shirt Design Studio | Print Your Own Apparel',
  description:
    'Design your own custom oversized t-shirt with Oktopus Studio. Upload graphics, preview mockups in real-time, and get premium quality custom prints delivered anywhere in India.',
  alternates: {
    canonical: 'https://www.oktopusclothing.in/custom-design',
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://www.oktopusclothing.in/custom-design',
    siteName: 'Oktopus Clothing',
    title: 'Custom T-Shirt Design Studio | Print Your Own Apparel | Oktopus Clothing',
    description:
      'Design your own custom oversized t-shirt with Oktopus Studio. Upload graphics, preview mockups in real-time, and get premium quality custom prints delivered.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Custom T-Shirt Design Studio | Oktopus Clothing',
    description:
      'Design your own custom oversized t-shirt with Oktopus Studio. Upload graphics, preview mockups in real-time, and get premium custom prints delivered.',
  },
};

export default function CustomDesignLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

