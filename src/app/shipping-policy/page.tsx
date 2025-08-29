
'use client';

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { MobileHeader } from "@/components/mobile-header";
import { MobileFooter } from "@/components/mobile-footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ShippingPolicyPage() {
  return (
    <>
      {/* Desktop View */}
      <div className="hidden md:flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">Shipping Policy</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p>Thank you for shopping at OKTOPUS CLOTHING. Here you will find all the information about our shipping procedures.</p>
              
              <h2>1. Order Processing</h2>
              <p>All orders are processed after payment confirmation. Since most of our products are customized, please allow 3-5 business days for production before your order is shipped.</p>

              <h2>2. Shipping Timelines</h2>
              <p>Once your order has been produced and dispatched, the estimated delivery time is as follows:</p>
              <ul>
                <li><strong>Minimum Timeline:</strong> 5-7 business days from the date of dispatch.</li>
                <li><strong>Maximum Timeline:</strong> 10-14 business days from the date of dispatch.</li>
              </ul>
              <p>Please note that these are estimated timelines and actual delivery may vary depending on your location and unforeseen logistical delays.</p>
              
              <h2>3. Shipping Charges & Pricing</h2>
              <p>All product prices and shipping charges are listed in Indian Rupees (INR). Shipping charges will be calculated at checkout and are based on the weight of the order and the delivery location.</p>

              <h2>4. Tracking Your Order</h2>
              <p>Once your order is shipped, we will send you an email with the tracking information and a link to the courier's website. You can use this to track the status of your delivery.</p>

              <h2>5. Contact Us</h2>
              <p>If you have any questions about your order or our shipping policy, please contact us at:</p>
              <ul>
                <li><strong>Email:</strong> <a href="mailto:oktopusclothing.business@gmail.com">oktopusclothing.business@gmail.com</a></li>
                <li><strong>Phone:</strong> <a href="tel:6291337506">+91 62913 37506</a></li>
              </ul>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>

      {/* Mobile View */}
      <div className="md:hidden">
        <MobileHeader title="Shipping Policy" />
        <main className="bg-secondary min-h-screen pb-24 p-4">
           <Card className="card-glass">
            <CardContent className="p-4 text-sm">
                <p className="mb-4">Thank you for shopping with us. Here are the details of our shipping process.</p>
              
                <h3 className="font-bold mt-4 mb-2">1. Order Processing</h3>
                <p>Please allow 3-5 business days for production of your custom items before they are shipped.</p>

                <h3 className="font-bold mt-4 mb-2">2. Shipping Timelines</h3>
                 <ul className="list-disc pl-5 space-y-2 mt-2">
                    <li><strong>Minimum:</strong> 5-7 business days after dispatch.</li>
                    <li><strong>Maximum:</strong> 10-14 business days after dispatch.</li>
                </ul>
                
                <h3 className="font-bold mt-4 mb-2">3. Charges & Pricing</h3>
                <p>All prices are in INR. Shipping fees are calculated at checkout.</p>

                <h3 className="font-bold mt-4 mb-2">4. Order Tracking</h3>
                <p>You will receive a tracking link via email once your order has been shipped.</p>

                <h3 className="font-bold mt-4 mb-2">5. Contact Us</h3>
                <p>For any questions, please contact us at oktopusclothing.business@gmail.com or +91 62913 37506.</p>
            </CardContent>
          </Card>
        </main>
        <MobileFooter />
      </div>
    </>
  );
}
