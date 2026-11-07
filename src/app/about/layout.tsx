import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us | Individuality Over Conformity',
  description:
    'Learn the story behind Oktopus Clothing — a streetwear brand built on bold individuality, unapologetic graphics, and premium garment craftsmanship.',
  alternates: {
    canonical: 'https://www.oktopusclothing.in/about',
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://www.oktopusclothing.in/about',
    siteName: 'Oktopus Clothing',
    title: 'About Us | Individuality Over Conformity | Oktopus Clothing',
    description:
      'Learn the story behind Oktopus Clothing — a streetwear brand built on bold individuality, unapologetic graphics, and premium garment craftsmanship.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Us | Oktopus Clothing',
    description:
      'Learn the story behind Oktopus Clothing — a streetwear brand built on bold individuality, unapologetic graphics, and premium garment craftsmanship.',
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

