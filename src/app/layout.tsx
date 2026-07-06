
import type { Metadata } from "next";
import { Inter, Archivo } from "next/font/google";
import "./globals.css";
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
    };
  } catch (error) {
    console.error('Failed to fetch settings for layout:', error);
    return {
      faviconUrl: '/favicon.ico',
    };
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    title: "OKTOPUS CLOTHING",
    description: "A modern fashion e-commerce website.",
    icons: {
      icon: settings.faviconUrl,
    },
    authors: [{ name: "BASKEY Studio", url: "https://github.com/iam-rbaskey" }],
    creator: "BASKEY Studio",
    publisher: "BASKEY Studio",
    other: {
      "baskey-studio-attribution": "A Unit of BASKEY Studio"
    }
  };
}

const VisitorTracker = () => {
  return (
    <Script id="visitor-tracker" strategy="afterInteractive">
      {`
        (function() {
          const hasVisitedToday = sessionStorage.getItem('hasVisitedToday');
          if (!hasVisitedToday) {
            fetch('/api/visitors', { method: 'POST' });
            sessionStorage.setItem('hasVisitedToday', 'true');
          }
        })();
      `}
    </Script>
  )
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSettings();
  return (
    <html lang="en" suppressHydrationWarning>
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
                                        </PageTransitionProvider>
                                        </CartProvider>
                                    </TrendProvider>
                                </CouponProvider>
                            </PopupProvider>
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
          <VisitorTracker />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
