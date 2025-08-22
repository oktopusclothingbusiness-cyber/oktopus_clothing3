import type { Metadata } from "next";
import { Inter, DM_Serif_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { CartProvider } from "@/context/cart-context";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const dmSerifDisplay = DM_Serif_Display({ 
  subsets: ["latin"], 
  weight: ["400"],
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
      <body className={`${inter.variable} ${dmSerifDisplay.variable} font-sans`}>
        <CartProvider>
          {children}
        </CartProvider>
        <Toaster />
      </body>
    </html>
  );
}
