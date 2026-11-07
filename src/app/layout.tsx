
import type { Metadata, Viewport } from "next";
import { Inter, Archivo } from "next/font/google";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};
import "mapbox-gl/dist/mapbox-gl.css";
import { Toaster } from "@/components/ui/toaster";
import { CartProvider } from "@/context/cart-context";
import { ProductProvider } from "@/context/product-context";
import { AuthProvider } from "@/context/auth-context";
import { UserProvider } from "@/context/user-context";
import { PromotionProvider } from "@/context/promotion-context";
import { CategoryProvider } from "@/context/category-context";
import Script from "next/script";
import { ThemeProvider } from "@/context/theme-provider";
import { FloatingCartButton } from "@/components/floating-cart-button";
import { CouponProvider } from "@/context/coupon-context";
import clientPromise from "@/lib/mongodb";
import { TrendProvider } from "@/context/trend-context";
import { PageTransitionProvider } from "@/context/page-transition-context";
import { PageLoader } from "@/components/page-loader";
import { PopupProvider } from "@/context/popup-context";
import { SizeChartProvider } from "@/context/size-chart-context";
import { FramerMotionWrapper } from "./framer-motion-wrapper";
import { Analytics } from "@vercel/analytics/next";
import { RewardProvider } from "@/context/reward-context";
import { PosterProvider } from "@/context/poster-context";
import { StorefrontPosterPopup } from "@/components/storefront-poster-popup";
import { VisitorTracker } from "@/components/visitor-tracker";
import { DeliveryLocationDialog } from "@/components/delivery-location-dialog";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const archivo = Archivo({ 
  subsets: ["latin"], 
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-serif" 
});

async function getSettings() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const settings = await db.collection('settings').findOne({ _id: 'global' as any });
    return {
      faviconUrl: settings?.faviconUrl || '/favicon.ico',
      logoUrl: settings?.logoUrl || 'https://www.oktopusclothing.in/logo2b.png',
    };
  } catch (error) {
    console.error('Failed to fetch settings for layout:', error);
    return {
      faviconUrl: '/favicon.ico',
      logoUrl: 'https://www.oktopusclothing.in/logo2b.png',
    };
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.oktopusclothing.in';

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: 'Oktopus Clothing | Premium Streetwear & Oversized Fashion',
      template: '%s | Oktopus Clothing',
    },
    description:
      'Individuality over conformity. Discover premium oversized graphic t-shirts, heavyweight drop-shoulder streetwear, custom design apparel, and limited edition drops with fast delivery across India.',
    keywords: [
      'Oktopus Clothing',
      'Oktopus streetwear',
      'oversized t-shirts',
      'graphic t-shirts India',
      'heavyweight cotton t-shirt',
      'drop shoulder t-shirts',
      'streetwear brand India',
      'custom t-shirt design',
      'anime streetwear',
      'bengali graphic t-shirts',
      'unisex oversized t-shirts',
      'premium streetwear',
    ],
    icons: {
      icon: settings.faviconUrl,
      shortcut: settings.faviconUrl,
      apple: settings.faviconUrl,
    },
    authors: [{ name: 'BASKEY Studio', url: 'https://github.com/iam-rbaskey' }],
    creator: 'BASKEY Studio',
    publisher: 'Oktopus Clothing',
    alternates: {
      canonical: siteUrl,
    },
    openGraph: {
      type: 'website',
      locale: 'en_IN',
      url: siteUrl,
      siteName: 'Oktopus Clothing',
      title: 'Oktopus Clothing | Premium Streetwear & Oversized Fashion',
      description:
        'Individuality over conformity. Discover premium oversized graphic t-shirts, heavyweight streetwear, and custom-designed apparel with fast delivery across India.',
      images: [
        {
          url: settings.logoUrl || '/logo1w.png',
          width: 1200,
          height: 630,
          alt: 'Oktopus Clothing - Premium Streetwear Brand',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Oktopus Clothing | Premium Streetwear & Oversized Fashion',
      description:
        'Individuality over conformity. Discover premium oversized graphic t-shirts and streetwear apparel.',
      images: [settings.logoUrl || '/logo1w.png'],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      google: 'google76fa96448a07af65',
    },
    other: {
      'baskey-studio-attribution': 'A Unit of BASKEY Studio',
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSettings();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.oktopusclothing.in';

  // Schema.org Structured Data
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Oktopus Clothing',
    url: siteUrl,
    logo: settings.logoUrl || 'https://www.oktopusclothing.in/logo2b.png',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+91-6291337506',
      contactType: 'customer service',
      email: 'care@oktopusclothing.in',
      areaServed: 'IN',
      availableLanguage: ['English', 'Hindi', 'Bengali'],
    },
    sameAs: [
      'https://www.instagram.com/oktopusclothing',
      'https://www.facebook.com/oktopusclothing',
    ],
  };

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Oktopus Clothing',
    url: siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteUrl}/products?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body className={`${inter.variable} ${archivo.variable} font-sans`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <UserProvider>
                <SizeChartProvider>
                    <CategoryProvider>
                      <RewardProvider>
                        <ProductProvider>
                        <PromotionProvider>
                          <PosterProvider>
                            <PopupProvider>
                                <CouponProvider>
                                    <TrendProvider>
                                        <CartProvider>
                                        <PageTransitionProvider>
                                            <FramerMotionWrapper>
                                                {children}
                                            </FramerMotionWrapper>
                                            <PageLoader faviconUrl={settings.faviconUrl} />
                                            <FloatingCartButton />
                                            <StorefrontPosterPopup />
                                            <VisitorTracker />
                                            <DeliveryLocationDialog />
                                        </PageTransitionProvider>
                                        </CartProvider>
                                    </TrendProvider>
                                </CouponProvider>
                            </PopupProvider>
                          </PosterProvider>
                        </PromotionProvider>
                        </ProductProvider>
                      </RewardProvider>
                    </CategoryProvider>
                </SizeChartProvider>
            </UserProvider>
          </AuthProvider>
          <Toaster />
          <Script
            id="razorpay-checkout-js"
            src="https://checkout.razorpay.com/v1/checkout.js"
          />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
