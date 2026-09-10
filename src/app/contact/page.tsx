'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare, CheckCircle2 } from 'lucide-react';
import { AnnouncementBar } from '@/components/storefront/announcement-bar';
import { StorefrontHeader } from '@/components/storefront/header';
import { StorefrontFooter } from '@/components/storefront/footer';
import { PageBanner } from '@/components/storefront/page-banner';
import { useToast } from '@/hooks/use-toast';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', orderNumber: '', message: '' });
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    toast({
      title: 'Message Received',
      description: 'Our customer experience team will respond within 24 hours.',
    });
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#FAF9F6] font-sans antialiased selection:bg-[#0F824B] selection:text-[#0A0A0A]">
      <AnnouncementBar />
      <StorefrontHeader />

      {/* DYNAMIC DATABASE BANNER FOR CONTACT PAGE */}
      <PageBanner
        placement="contact_page"
        fallbackTitle="CLIENT LIAISON & SUPPORT"
        fallbackDescription="FOR ORDER DISPATCH ASSISTANCE, WHOLESALE INQUIRIES, OR PRODUCT QUERIES."
        fallbackCtaText="REACH OUT TO US"
        fallbackCtaLink="/contact"
      />

      <main className="max-w-[1440px] mx-auto px-6 lg:px-12 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Form Side (7 cols) */}
          <div className="lg:col-span-7 bg-[#0E0E0E] border border-[#222222] rounded-2xl p-6 sm:p-10">
            <h2 className="text-2xl font-display font-black uppercase tracking-wider text-white mb-6">
              SEND DIRECT TRANSMISSION
            </h2>

            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-5 font-mono text-xs">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-[#8B8B86] uppercase block font-bold">
                    FULL NAME *
                  </label>
                  <input
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="ENTER YOUR NAME"
                    className="w-full px-4 py-3 bg-[#141414] border border-[#292929] focus:border-[#0F824B] rounded-xl text-[#FAF9F6] uppercase outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-[#8B8B86] uppercase block font-bold">
                    EMAIL ADDRESS *
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="NAME@DOMAIN.COM"
                    className="w-full px-4 py-3 bg-[#141414] border border-[#292929] focus:border-[#0F824B] rounded-xl text-[#FAF9F6] outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="order" className="text-[#8B8B86] uppercase block font-bold">
                    ORDER ID (OPTIONAL)
                  </label>
                  <input
                    id="order"
                    value={formData.orderNumber}
                    onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                    placeholder="E.G. #OKTO-9821"
                    className="w-full px-4 py-3 bg-[#141414] border border-[#292929] focus:border-[#0F824B] rounded-xl text-[#FAF9F6] uppercase outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="text-[#8B8B86] uppercase block font-bold">
                    MESSAGE OR INQUIRY *
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="HOW CAN OUR CREATIVE TEAM ASSIST YOU?"
                    className="w-full px-4 py-3 bg-[#141414] border border-[#292929] focus:border-[#0F824B] rounded-xl text-[#FAF9F6] uppercase outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-[#0F824B] hover:bg-[#0b663a] text-[#0A0A0A] font-display font-black text-xs uppercase tracking-widest rounded-full transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>TRANSMIT MESSAGE</span>
                </button>
              </form>
            ) : (
              <div className="py-16 text-center space-y-4 font-mono">
                <CheckCircle2 className="w-10 h-10 text-[#0F824B] mx-auto" />
                <h3 className="text-xl font-display font-bold uppercase text-white">
                  TRANSMISSION RECEIVED
                </h3>
                <p className="text-xs text-[#8B8B86] max-w-sm mx-auto">
                  Thank you, {formData.name}. Our customer liaison team will review your inquiry and respond within 24 business hours.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="text-xs text-[#0F824B] underline uppercase pt-2"
                >
                  SEND ANOTHER MESSAGE
                </button>
              </div>
            )}
          </div>

          {/* Contact Details Side (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 sm:p-8 bg-[#111111] border border-[#222222] rounded-2xl space-y-4">
              <span className="text-[10px] font-mono font-bold tracking-widest text-[#0F824B] uppercase">
                // DIRECT CHANNELS
              </span>

              <div className="space-y-4 text-xs font-mono text-[#8B8B86]">
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-[#0F824B] flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-white font-bold block">EMAIL SUPPORT</span>
                    <a href="mailto:support@oktopusclothing.in" className="hover:text-[#0F824B] transition-colors">
                      support@oktopusclothing.in
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MessageSquare className="w-4 h-4 text-[#0F824B] flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-white font-bold block">WHATSAPP CONCIERGE</span>
                    <span>Available Mon - Sat (10:00 AM - 7:00 PM IST)</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#0F824B] flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-white font-bold block">HEADQUARTERS & ATELIER</span>
                    <span>Oktopus Clothing Business Unit, India</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-[#0E0E0E] border border-[#222222] rounded-2xl font-mono text-xs text-[#8B8B86] space-y-2">
              <span className="text-white font-bold block uppercase">
                EXCHANGE & ORDER ASSISTANCE
              </span>
              <p className="leading-relaxed">
                If your inquiry concerns transit damage or a missing item, please have your uncut continuous unboxing video ready as required by our policy.
              </p>
            </div>
          </div>
        </div>
      </main>

      <StorefrontFooter />
    </div>
  );
}
