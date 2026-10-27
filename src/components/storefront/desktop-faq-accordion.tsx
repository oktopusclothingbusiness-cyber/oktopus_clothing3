'use client';

import * as React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import Link from 'next/link';

export function DesktopFaqAccordion() {
  const faqs = [
    {
      id: 'item-1',
      question: 'What makes OKTOPUS 240 GSM combed cotton different from standard tees?',
      answer:
        'Standard retail t-shirts typically use lightweight 160–180 GSM cotton that easily stretches out of shape or sags at the collar. OKTOPUS uses heavy 240 GSM combed long-staple cotton that undergoes specialized bio-washing. This provides an architectural drape, luxurious soft-hand feel, and zero shrinkage after regular washing.',
    },
    {
      id: 'item-2',
      question: 'How do OKTOPUS garments fit? Should I order my normal size?',
      answer:
        'Our oversized t-shirts feature an authentic streetwear boxy cut with relaxed drop shoulders and wider chest measurements. If you prefer a relaxed modern streetwear fit, choose your standard true-to-fit size. If you prefer a fitted or athletic appearance, we recommend sizing down one step. Check our size chart on each product page for exact centimetre chest and length dimensions.',
    },
    {
      id: 'item-3',
      question: 'How should I care for my printed graphic streetwear to ensure print longevity?',
      answer:
        'To preserve the high-density screen printing and combed cotton fibers, we recommend machine washing inside-out in cold water with mild detergent. Avoid bleach or dry cleaning. Hang dry in shade or tumble dry on low heat. Never iron directly over the graphic print—iron on reverse or steam.',
    },
    {
      id: 'item-4',
      question: 'What are the shipping timelines, and is Cash on Delivery (COD) available?',
      answer:
        'Orders are dispatched within 24 to 48 business hours from our studio. Standard delivery across major metropolitan cities takes 3 to 5 business days, and 5 to 7 days for regional areas. We offer Free Express Shipping on all prepaid orders over ₹999. Cash on Delivery (COD) is available at checkout for eligible pin codes.',
    },
    {
      id: 'item-5',
      question: 'Can I order custom designer prints or personalized streetwear?',
      answer:
        'Yes! Through our Custom Design Studio, you can submit your own artwork, illustrations, or vector graphics for high-density printing onto our heavy cotton blanks. Our studio team reviews resolution, color-separates the design, and produces customized 1-of-1 or batch runs.',
    },
    {
      id: 'item-6',
      question: 'What is your exchange and return policy?',
      answer:
        'We offer a hassle-free 7-day return and exchange window for unworn, unwashed items with original tags and packaging intact. If you encounter sizing issues or any manufacturing defect, our support team will promptly organize a replacement pickup.',
    },
  ];

  return (
    <section className="bg-background py-16 lg:py-24 border-b border-white/10 select-none">
      <div className="container mx-auto px-6 lg:px-12 max-w-4xl">
        {/* Section Header */}
        <div className="text-center mb-12 space-y-2">
          <span className="text-xs font-mono font-bold uppercase tracking-[0.25em] text-zinc-500">
            INFO • CLIENT SERVICES
          </span>
          <h2 className="text-4xl lg:text-6xl font-black font-bebas tracking-tight text-foreground">
            FREQUENTLY ASKED QUESTIONS
          </h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Everything you need to know about fabric specifications, sizing, delivery, and garment care.
          </p>
        </div>

        {/* Radix Accordion */}
        <Accordion type="single" collapsible className="w-full space-y-3">
          {faqs.map((faq) => (
            <AccordionItem
              key={faq.id}
              value={faq.id}
              className="bg-zinc-950 border border-white/10 px-6 py-1 data-[state=open]:border-white/30 transition-all"
            >
              <AccordionTrigger className="text-left font-bebas text-xl lg:text-2xl tracking-wide uppercase text-foreground hover:no-underline hover:text-white py-4">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-xs lg:text-sm text-zinc-300 leading-relaxed font-normal pt-1 pb-4">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* Support Note */}
        <div className="mt-10 p-6 bg-zinc-950 border border-white/10 text-center space-y-2">
          <p className="text-xs text-zinc-400">
            Have a question that is not covered above?
          </p>
          <Link
            href="/contact"
            className="inline-block text-xs font-mono font-bold text-white hover:underline uppercase tracking-wider"
          >
            CONTACT OKTOPUS STUDIO SUPPORT →
          </Link>
        </div>
      </div>
    </section>
  );
}
