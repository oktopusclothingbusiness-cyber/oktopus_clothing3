import type { Metadata } from 'next';
import React from 'react';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.oktopusclothing.in';
const collectionUrl = `${baseUrl}/collections/dr-doom`;

export const metadata: Metadata = {
  title: 'Dr. Doom Collection | OKTOPUS Clothing',
  description:
    'Discover the limited edition Dr. Doom Collection by OKTOPUS Clothing. Premium apparel in obsidian black, forest green, and antique bronze.',
  keywords: [
    'Dr Doom collection',
    'Dr Doom clothing',
    'Oktopus Clothing Dr Doom',
    'exclusive streetwear drop',
    'premium oversized tee',
  ],
  alternates: {
    canonical: collectionUrl,
  },
  openGraph: {
    title: 'Dr. Doom Collection | OKTOPUS Clothing',
    description:
      'Exclusive Dr. Doom Collection by OKTOPUS Clothing.',
    url: collectionUrl,
    siteName: 'OKTOPUS Clothing',
    images: [
      {
        url: `${baseUrl}/doom/doom-texture.jpg`,
        width: 1024,
        height: 1024,
        alt: 'OKTOPUS Dr. Doom Collection',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dr. Doom Collection | OKTOPUS Clothing',
    description: 'Exclusive Dr. Doom Collection by OKTOPUS Clothing.',
    images: [`${baseUrl}/doom/doom-texture.jpg`],
  },
};

export default function DoomCollectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Dr. Doom Collection',
    description:
      'Exclusive Dr. Doom Collection by OKTOPUS Clothing.',
    url: collectionUrl,
    isPartOf: {
      '@type': 'WebSite',
      name: 'OKTOPUS Clothing',
      url: baseUrl,
    },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: baseUrl,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Collections',
          item: `${baseUrl}/products`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Dr. Doom Collection',
          item: collectionUrl,
        },
      ],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      {children}
    </>
  );
}
