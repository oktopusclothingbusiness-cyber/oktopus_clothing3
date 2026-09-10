'use client';

import React, { useState } from 'react';
import { STOREFRONT_FAQS } from '@/data/storefront-data';
import { Plus, Minus, HelpCircle } from 'lucide-react';

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleAccordion = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <section className="w-full bg-[#0A0A0A] border-b border-[#222222] py-16 md:py-24 text-[#FAF9F6]">
      <div className="max-w-[1000px] mx-auto px-6 lg:px-12">
        <div className="text-center space-y-2 mb-12">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-bold tracking-[0.25em] text-[#0F824B] uppercase">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>KNOWLEDGE BASE</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-display font-black tracking-tight uppercase text-white">
            FREQUENTLY ASKED QUESTIONS
          </h2>
          <p className="text-xs font-mono text-[#8B8B86] uppercase tracking-wider">
            CLEAR ANSWERS ON SIZING, FABRIC, DISPATCH & EXCHANGES
          </p>
        </div>

        {/* Accordion List */}
        <div className="divide-y divide-[#222222] border-y border-[#222222]">
          {STOREFRONT_FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div key={idx} className="py-5">
                <button
                  onClick={() => toggleAccordion(idx)}
                  className="w-full flex items-center justify-between text-left gap-4 group focus:outline-none"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-[#141414] border border-[#222222] text-[#0F824B] rounded-xs uppercase flex-shrink-0">
                      {faq.category}
                    </span>
                    <h3 className="text-sm sm:text-base font-display font-bold uppercase tracking-wider text-[#FAF9F6] group-hover:text-[#0F824B] transition-colors">
                      {faq.question}
                    </h3>
                  </div>
                  <div className="p-1 rounded-sm border border-[#222222] text-[#8B8B86] group-hover:text-[#0F824B] group-hover:border-[#0F824B] transition-all flex-shrink-0">
                    {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </div>
                </button>

                <div
                  className={`overflow-hidden transition-all duration-300 text-xs font-mono text-[#8B8B86] leading-relaxed uppercase ${
                    isOpen ? 'max-h-60 mt-4 pl-16 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  {faq.answer}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
