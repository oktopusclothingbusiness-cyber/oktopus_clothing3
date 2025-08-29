
'use client';

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { MobileHeader } from "@/components/mobile-header";
import { MobileFooter } from "@/components/mobile-footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPolicyPage() {
  return (
    <>
      {/* Desktop View */}
      <div className="hidden md:flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">Privacy Policy</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p>This Privacy Policy describes how OKTOPUS CLOTHING ("we", "us", or "our") collects, uses, and discloses your personal information when you visit our website, use our services, or make a purchase.</p>
              
              <h2>1. Information We Collect</h2>
              <p>We collect personal information you provide to us directly, such as:</p>
              <ul>
                <li><strong>Contact Information:</strong> Name, email address, phone number, and shipping address.</li>
                <li><strong>Account Information:</strong> Username and password when you create an account.</li>
                <li><strong>Order Information:</strong> Details about the products you purchase, including customization details.</li>
                <li><strong>Payment Information:</strong> While we use a third-party payment processor (Razorpay), we may receive transaction details necessary to confirm payment.</li>
              </ul>

              <h2>2. How We Use Your Information</h2>
              <p>We use the information we collect to:</p>
              <ul>
                <li>Fulfill your orders, including processing payments and shipping products.</li>
                <li>Communicate with you about your orders and provide customer support.</li>
                <li>Send you promotional emails, if you have opted in to receive them.</li>
                <li>Improve and optimize our website and services.</li>
              </ul>
              
              <h2>3. Information Sharing</h2>
              <p>We do not sell or trade your personal information. We may share your information with third-party service providers to help us operate our business, such as payment processors and shipping companies.</p>

              <h2>4. Data Security</h2>
              <p>We take reasonable precautions to protect your personal information from loss, misuse, and unauthorized access. However, no method of transmission over the Internet is 100% secure.</p>
              
              <h2>5. Your Rights</h2>
              <p>You have the right to access, correct, or delete your personal information. If you have an account with us, you can review and update your information by logging into your account.</p>

              <h2>6. Changes to This Policy</h2>
              <p>We may update this privacy policy from time to time. We will notify you of any changes by posting the new privacy policy on this page.</p>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>

      {/* Mobile View */}
      <div className="md:hidden">
        <MobileHeader title="Privacy Policy" />
        <main className="bg-secondary min-h-screen pb-24 p-4">
           <Card className="card-glass">
            <CardContent className="p-4 text-sm">
                <p className="mb-4">This policy explains how we collect, use, and protect your personal information.</p>
              
                <h3 className="font-bold mt-4 mb-2">1. Information We Collect</h3>
                <p>We collect contact, account, order, and payment details to process your orders and provide our services.</p>

                <h3 className="font-bold mt-4 mb-2">2. How We Use Information</h3>
                <p>Your information is used to fulfill orders, communicate with you, and improve our services. We may send marketing emails if you opt-in.</p>
                
                <h3 className="font-bold mt-4 mb-2">3. Information Sharing</h3>
                <p>We do not sell your data. We share it only with necessary service providers like payment gateways and shipping partners.</p>

                <h3 className="font-bold mt-4 mb-2">4. Data Security</h3>
                <p>We take reasonable steps to protect your data, but no online transmission is 100% secure.</p>

                <h3 className="font-bold mt-4 mb-2">5. Your Rights</h3>
                <p>You can access, correct, or delete your personal information through your account or by contacting us.</p>
                
                <h3 className="font-bold mt-4 mb-2">6. Policy Changes</h3>
                <p>We may update this policy and will post any changes here.</p>
            </CardContent>
          </Card>
        </main>
        <MobileFooter />
      </div>
    </>
  );
}
