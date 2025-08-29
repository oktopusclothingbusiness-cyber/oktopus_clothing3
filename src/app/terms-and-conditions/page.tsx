
'use client';

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { MobileHeader } from "@/components/mobile-header";
import { MobileFooter } from "@/components/mobile-footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsAndConditionsPage() {
  return (
    <>
      {/* Desktop View */}
      <div className="hidden md:flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">Terms and Conditions</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p>Welcome to OKTOPUS CLOTHING. These terms and conditions outline the rules and regulations for the use of our website and the purchase of our products.</p>
              
              <h2>1. General</h2>
              <p>By accessing this website and/or placing an order, you agree to be bound by these terms and conditions. If you do not agree to these terms, please do not use our site.</p>
              <p>All products and services are available only to individuals who can form legally binding contracts under applicable law.</p>

              <h2>2. Products and Pricing</h2>
              <p>All prices for products are quoted in Indian Rupees (INR). We reserve the right to change prices for products displayed on our website at any time.</p>
              <p>We specialize in customized apparel. You, the customer, are responsible for providing accurate design specifications, sizes, and any other personalization details. We are not responsible for errors resulting from incorrect information provided by you.</p>

              <h2>3. Orders and Payment</h2>
              <p>All orders are subject to acceptance and availability. We accept payment through our designated payment gateway, Razorpay. Payment must be completed in full before an order is processed.</p>
              <p>By placing an order, you confirm that all details you provide to us are true and accurate, that you are an authorized user of the credit or debit card used to make your payment and that there are sufficient funds to cover the cost of the goods.</p>

              <h2>4. Intellectual Property</h2>
              <p>The content displayed on this website, including but not limited to text, graphics, logos, images, and software, is the property of OKTOPUS CLOTHING or its content suppliers and is protected by international copyright laws.</p>
              <p>For custom designs submitted by you, you grant OKTOPUS CLOTHING a non-exclusive, royalty-free license to use, reproduce, and modify the design for the purpose of fulfilling your order.</p>

              <h2>5. Limitation of Liability</h2>
              <p>OKTOPUS CLOTHING will not be liable for any indirect, special, incidental, or consequential damages of any kind related to your use of this website or the products purchased from it.</p>
              
              <h2>6. Governing Law</h2>
              <p>These terms and conditions are governed by and construed in accordance with the laws of India and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.</p>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>

      {/* Mobile View */}
      <div className="md:hidden">
        <MobileHeader title="Terms & Conditions" />
        <main className="bg-secondary min-h-screen pb-24 p-4">
           <Card className="card-glass">
            <CardContent className="p-4 text-sm">
                <p className="mb-4">Welcome to OKTOPUS CLOTHING. These terms and conditions outline the rules and regulations for the use of our website and the purchase of our products.</p>
              
                <h3 className="font-bold mt-4 mb-2">1. General</h3>
                <p>By accessing this website and/or placing an order, you agree to be bound by these terms and conditions.</p>

                <h3 className="font-bold mt-4 mb-2">2. Products and Pricing</h3>
                <p>All prices are in Indian Rupees (INR). As we specialize in customized items, you are responsible for providing accurate design and sizing information.</p>
                
                <h3 className="font-bold mt-4 mb-2">3. Orders and Payment</h3>
                <p>Orders are subject to acceptance. Full payment is required before processing. You must be an authorized user of the payment method used.</p>

                 <h3 className="font-bold mt-4 mb-2">4. Intellectual Property</h3>
                <p>All content on this site is owned by OKTOPUS CLOTHING. By submitting a custom design, you grant us a license to use it to create your product.</p>

                <h3 className="font-bold mt-4 mb-2">5. Limitation of Liability</h3>
                <p>We are not liable for any indirect or consequential damages arising from your use of our site or products.</p>
                
                <h3 className="font-bold mt-4 mb-2">6. Governing Law</h3>
                <p>These terms are governed by the laws of India.</p>
            </CardContent>
          </Card>
        </main>
        <MobileFooter />
      </div>
    </>
  );
}
