
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
              <CardTitle className="text-3xl">Refunds & Cancellations Policy</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p>At OKTOPUS CLOTHING, every product is crafted with care and attention to detail. Since we specialize in customized and made-to-order clothing, we want to ensure our customers clearly understand our policy before placing an order.</p>
              
              <h2>1. Returns & Exchanges</h2>
              <h3>Customized / Made-to-Order Products</h3>
              <p>All customized products are made specifically according to the customer’s chosen design, size, and personalization details.</p>
              <p><strong>We do not accept returns or exchanges on customized products</strong>, as they are made uniquely for you and cannot be resold. Please double-check your size, design, and color selections before placing your order.</p>
              
              <h3>Non-Customized Products</h3>
              <p>For any non-customized products, returns will only be accepted if the item is unused, unworn, and returned in its original packaging within 7 days of delivery. Customers must contact our support team before initiating any return.</p>

              <h2>2. Cancellations</h2>
              <p>You may request to cancel your order within <strong>24 hours</strong> of placing it. After this period, production begins, and we can no longer accept cancellations for customized items.</p>

              <h2>3. Refund Policy</h2>
              <p>Refunds are only applicable under the following conditions:</p>
              <ul>
                <li>
                  <strong>Cancellation:</strong> If you cancel your order within the 24-hour window.
                </li>
                <li>
                  <strong>Product Not Delivered:</strong> If your order has not been delivered within the specified maximum delivery time due to unforeseen circumstances or logistical issues, you are eligible for a full refund.
                </li>
                <li>
                  <strong>Order Not Possible to Fulfill:</strong> In the rare case that we are unable to produce your order (e.g., due to material unavailability), we will notify you and issue a full refund.
                </li>
                <li>
                  <strong>Incorrect or Damaged Product (Our Error):</strong> If you receive an item that is incorrect (wrong size, design, color) or damaged due to a mistake on our part, we will review the case. A replacement will be offered first. If a replacement is not feasible, a full refund will be issued.
                </li>
              </ul>

              <h2>4. Non-Refundable Situations</h2>
              <p>Refunds will not be granted if:</p>
              <ul>
                <li>You provided incorrect details (e.g., size, design, customization input, or delivery address).</li>
                <li>You change your mind after the 24-hour cancellation period for a customized order.</li>
                <li>The product has already been delivered successfully as per your customization request.</li>
              </ul>

              <h2>5. Refund Process</h2>
              <p>To request a refund, please contact us at <a href="mailto:oktopusclothing.business@gmail.com">oktopusclothing.business@gmail.com</a> with your order number and details.</p>
              <p>Once your request is approved, the refund will be processed to your original payment method within <strong>5-7 business days</strong>. The time it takes for the amount to credit to your bank account may vary depending on your bank.</p>

              <h2>6. Contact Us</h2>
              <p>If you have any questions, please reach out to us:</p>
              <ul>
                <li>📧 <strong>Email:</strong> <a href="mailto:oktopusclothing.business@gmail.com">oktopusclothing.business@gmail.com</a></li>
                <li>📞 <strong>Phone:</strong> <a href="tel:6291337506">+91 62913 37506</a></li>
                <li>🏢 <strong>Operating Address:</strong> Kolkata, West Bengal, India</li>
              </ul>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>

      {/* Mobile View */}
      <div className="md:hidden">
        <MobileHeader title="Refunds & Cancellations" />
        <main className="bg-secondary min-h-screen pb-24 p-4">
          <Card className="card-glass">
            <CardContent className="p-4 text-sm">
                <p className="mb-4">Because our products are customized, please review our policy carefully.</p>
              
                <h3 className="font-bold mt-4 mb-2">1. Returns & Exchanges</h3>
                <p>We do not accept returns or exchanges on customized products. Please verify all details before ordering.</p>
                
                <h3 className="font-bold mt-4 mb-2">2. Cancellations</h3>
                <p>Orders can be cancelled within 24 hours of placement.</p>

                <h3 className="font-bold mt-4 mb-2">3. Refund Eligibility</h3>
                <p>Refunds are provided for:</p>
                <ul className="list-disc pl-5 space-y-2 mt-2">
                    <li>Orders cancelled within 24 hours.</li>
                    <li>Non-delivered items after the maximum timeline.</li>
                    <li>Incorrect or damaged items due to our error (replacement offered first).</li>
                </ul>

                <h3 className="font-bold mt-4 mb-2">4. Non-Refundable Situations</h3>
                <p>No refunds for incorrect details provided by you, or for change of mind after 24 hours.</p>

                <h3 className="font-bold mt-4 mb-2">5. Refund Process</h3>
                <p>Approved refunds are processed within <strong>5-7 business days</strong> to your original payment method.</p>

                <h3 className="font-bold mt-4 mb-2">6. Contact Us</h3>
                <p>For questions, email <a href="mailto:oktopusclothing.business@gmail.com" className="text-primary">oktopusclothing.business@gmail.com</a> or call <a href="tel:6291337506" className="text-primary">+91 62913 37506</a>.</p>
            </CardContent>
          </Card>
        </main>
        <MobileFooter />
      </div>
    </>
  );
}
