
import type { Metadata } from "next";
import { Inter, Archivo } from "next/font/google";
import "./globals.css";
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

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const archivo = Archivo({ 
  subsets: ["latin"], 
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-serif" 
});

export const metadata: Metadata = {
  title: "OKTOPUS CLOTHING",
  description: "A modern fashion e-commerce website.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${archivo.variable} font-sans`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <UserProvider>
              <CategoryProvider>
                <ProductProvider>
                  <PromotionProvider>
                    <CouponProvider>
                      <CartProvider>
                        {children}
                        <FloatingCartButton />
                      </CartProvider>
                    </CouponProvider>
                  </PromotionProvider>
                </ProductProvider>
              </CategoryProvider>
            </UserProvider>
          </AuthProvider>
          <Toaster />
          <Script
            id="razorpay-checkout-js"
            src="https://checkout.razorpay.com/v1/checkout.js"
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
