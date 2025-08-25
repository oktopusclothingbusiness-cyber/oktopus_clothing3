
'use client';

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { MobileHeader } from "@/components/mobile-header";
import { MobileFooter } from "@/components/mobile-footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ReturnPolicyPage() {
  return (
    <>
      {/* Desktop View */}
      <div className="hidden md:flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">Return & Refund Policy</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p>At OKTOPUS CLOTHING, every product is crafted with care and attention to detail. Since we specialize in customized and made-to-order clothing, we want to ensure our customers clearly understand our Return & Refund Policy before placing an order.</p>
              
              <h2>1. Returns Policy</h2>
              <h3>Customized / Made-to-Order Products</h3>
              <p>All customized products are made specifically according to the customer’s chosen design, size, and personalization.</p>
              <p>We do not accept returns or exchanges on customized products, as they are made uniquely for you and cannot be resold.</p>
              
              <h3>Non-Customized Products (if any are offered in the future)</h3>
              <p>Returns will only be accepted if the item is unused, unworn, and returned in its original packaging within 7 days of delivery.</p>
              <p>Customers must contact our support team before initiating any return.</p>

              <h2>2. Refund Policy</h2>
              <p>Refunds are only applicable under the following conditions:</p>
              <ul>
                <li>
                  <strong>Product Not Delivered:</strong> If your order has not been delivered within the specified delivery time due to unforeseen circumstances or logistical issues, you are eligible for a full refund.
                </li>
                <li>
                  <strong>Order Not Possible to Fulfill:</strong> In rare cases where we are unable to produce or deliver your customized order (for example, due to material unavailability or technical constraints), we will notify you promptly and issue a full refund.
                </li>
                <li>
                  <strong>Incorrect or Damaged Product (by our error only):</strong> If you receive an incorrect item or a product damaged during production, we will review the case. A replacement will be offered wherever possible. If replacement is not feasible, a full refund will be issued.
                </li>
              </ul>

              <h2>3. Non-Refundable Situations</h2>
              <p>Refunds will not be granted if:</p>
              <ul>
                <li>You provided incorrect details (size, design, customization input, or delivery address).</li>
                <li>You change your mind after placing a confirmed customized order.</li>
                <li>The product has already been delivered successfully as per your customization request.</li>
              </ul>

              <h2>4. Refund Process</h2>
              <p>To request a refund, contact us at <a href="mailto:oktopusclothing.business@gmail.com">oktopusclothing.business@gmail.com</a> with your order details.</p>
              <p>Once your request is reviewed and approved, refunds will be processed to your original payment method within 5–7 business days.</p>

              <h2>5. Contact Us</h2>
              <p>If you have any questions regarding our Return & Refund Policy, please reach out to us:</p>
              <ul>
                <li>📧 Email: <a href="mailto:oktopusclothing.business@gmail.com">oktopusclothing.business@gmail.com</a></li>
                <li>📞 Phone: <a href="tel:6291337506">6291337506</a></li>
              </ul>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>

      {/* Mobile View */}
      <div className="md:hidden">
        <MobileHeader title="Return & Refund Policy" />
        <main className="bg-secondary min-h-screen pb-24 p-4">
          <Card className="card-glass">
            <CardContent className="p-4 text-sm">
                <p className="mb-4">At OKTOPUS CLOTHING, every product is crafted with care and attention to detail. Since we specialize in customized and made-to-order clothing, we want to ensure our customers clearly understand our Return & Refund Policy before placing an order.</p>
              
                <h3 className="font-bold mt-4 mb-2">1. Returns Policy</h3>
                <h4 className="font-semibold mt-2">Customized / Made-to-Order Products</h4>
                <p>All customized products are made specifically according to the customer’s chosen design, size, and personalization. We do not accept returns or exchanges on customized products, as they are made uniquely for you and cannot be resold.</p>
                
                <h4 className="font-semibold mt-2">Non-Customized Products</h4>
                <p>Returns will only be accepted if the item is unused, unworn, and returned in its original packaging within 7 days of delivery. Customers must contact our support team before initiating any return.</p>

                <h3 className="font-bold mt-4 mb-2">2. Refund Policy</h3>
                <p>Refunds are only applicable under the following conditions:</p>
                <ul className="list-disc pl-5 space-y-2 mt-2">
                  <li><strong>Product Not Delivered:</strong> If your order has not been delivered within the specified delivery time, you are eligible for a full refund.</li>
                  <li><strong>Order Not Possible to Fulfill:</strong> In rare cases where we are unable to produce your order, we will notify you and issue a full refund.</li>
                  <li><strong>Incorrect or Damaged Product:</strong> If you receive an incorrect or damaged item due to our error, a replacement or refund will be provided.</li>
                </ul>

                <h3 className="font-bold mt-4 mb-2">3. Non-Refundable Situations</h3>
                <p>Refunds will not be granted if:</p>
                 <ul className="list-disc pl-5 space-y-2 mt-2">
                    <li>You provided incorrect details (size, address, etc.).</li>
                    <li>You change your mind after placing a customized order.</li>
                    <li>The product was successfully delivered as requested.</li>
                </ul>

                <h3 className="font-bold mt-4 mb-2">4. Refund Process</h3>
                <p>To request a refund, contact us at <a href="mailto:oktopusclothing.business@gmail.com" className="text-primary">oktopusclothing.business@gmail.com</a>. Approved refunds are processed to the original payment method within 5–7 business days.</p>

                <h3 className="font-bold mt-4 mb-2">5. Contact Us</h3>
                <p>If you have any questions, please reach out:</p>
                <ul className="list-disc pl-5 space-y-2 mt-2">
                    <li>Email: <a href="mailto:oktopusclothing.business@gmail.com" className="text-primary">oktopusclothing.business@gmail.com</a></li>
                    <li>Phone: <a href="tel:6291337506" className="text-primary">6291337506</a></li>
                </ul>
            </CardContent>
          </Card>
        </main>
        <MobileFooter />
      </div>
    </>
  );
}
