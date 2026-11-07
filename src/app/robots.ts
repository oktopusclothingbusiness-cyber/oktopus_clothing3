import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.oktopusclothing.in';

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/store',
          '/products',
          '/products/*',
          '/custom-design',
          '/about',
          '/contact',
          '/track-order',
          '/track-order/*',
          '/privacy-policy',
          '/terms-and-conditions',
          '/shipping-policy',
          '/return-policy',
          '/verify-product',
        ],
        disallow: [
          '/admin/',
          '/admin/*',
          '/mobile-admin/',
          '/mobile-admin/*',
          '/api/',
          '/api/*',
          '/checkout',
          '/checkout/*',
          '/cart',
          '/profile',
          '/profile/*',
          '/orders',
          '/orders/*',
          '/favorites',
          '/my-designs',
          '/payment-success',
          '/auth/',
          '/auth/*',
          '/delete-account',
          '/request-data',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

