import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shop Premium Oversized T-Shirts & Graphic Tees',
  description:
    'Explore the latest collection of premium oversized graphic t-shirts, heavyweight drop-shoulder streetwear, and limited edition drops at Oktopus Clothing. Free shipping on orders above ₹999 across India.',
  alternates: {
    canonical: 'https://www.oktopusclothing.in/store',
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://www.oktopusclothing.in/store',
    siteName: 'Oktopus Clothing',
    title: 'Shop Premium Oversized T-Shirts & Graphic Tees | Oktopus Clothing',
    description:
      'Explore the latest collection of premium oversized graphic t-shirts, heavyweight drop-shoulder streetwear, and limited edition drops with fast delivery across India.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shop Premium Oversized T-Shirts & Graphic Tees | Oktopus Clothing',
    description:
      'Explore premium oversized graphic t-shirts, heavyweight drop-shoulder streetwear, and limited edition drops.',
  },
};

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://www.oktopusclothing.in',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Store',
        item: 'https://www.oktopusclothing.in/store',
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {children}
    </>
  );
}

