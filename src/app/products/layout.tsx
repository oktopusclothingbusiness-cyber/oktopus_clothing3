import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'All Streetwear Collections & Graphic Apparel',
  description:
    'Browse all graphic t-shirts, oversized fits, hoodies, and customized apparel by Oktopus Clothing. Filter by category, price, and newest drops with fast delivery across India.',
  alternates: {
    canonical: 'https://www.oktopusclothing.in/products',
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://www.oktopusclothing.in/products',
    siteName: 'Oktopus Clothing',
    title: 'All Streetwear Collections & Graphic Apparel | Oktopus Clothing',
    description:
      'Browse all graphic t-shirts, oversized fits, and customized apparel by Oktopus Clothing. Filter by category, price, and newest drops.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'All Streetwear Collections & Graphic Apparel | Oktopus Clothing',
    description:
      'Browse all graphic t-shirts, oversized fits, and customized apparel by Oktopus Clothing.',
  },
};

export default function ProductsCatalogLayout({
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
        name: 'Products',
        item: 'https://www.oktopusclothing.in/products',
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

