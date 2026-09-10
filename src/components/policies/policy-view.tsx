'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FileText,
  ShieldCheck,
  Truck,
  RotateCcw,
  Clock,
  Mail,
  Phone,
  MapPin,
  ChevronRight,
  HelpCircle,
} from 'lucide-react';
import { StorefrontHeader } from '@/components/storefront/header';
import { StorefrontFooter } from '@/components/storefront/footer';
import { MobileHeader } from '@/components/mobile-header';
import { MobileFooter } from '@/components/mobile-footer';
import { PolicyDocument, POLICY_CONTACT_INFO } from '@/data/policies-content';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const POLICY_TABS = [
  {
    slug: 'terms-and-conditions',
    href: '/terms-and-conditions',
    title: 'Terms and Conditions',
    shortTitle: 'Terms',
    icon: FileText,
  },
  {
    slug: 'return-policy',
    href: '/return-policy',
    title: 'Return and Refund',
    shortTitle: 'Refunds',
    icon: RotateCcw,
  },
  {
    slug: 'shipping-policy',
    href: '/shipping-policy',
    title: 'Shipping Policy',
    shortTitle: 'Shipping',
    icon: Truck,
  },
  {
    slug: 'privacy-policy',
    href: '/privacy-policy',
    title: 'Privacy Policy',
    shortTitle: 'Privacy',
    icon: ShieldCheck,
  },
];

interface PolicyViewProps {
  policy: PolicyDocument;
}

export function PolicyView({ policy }: PolicyViewProps) {
  const pathname = usePathname();
  const [activeSection, setActiveSection] = React.useState<string>(
    policy.sections[0]?.id || ''
  );

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="bg-[#0A0A0A] text-[#FAF9F6] font-sans min-h-screen">
      {/* DESKTOP VIEW */}
      <div className="hidden md:flex flex-col min-h-screen">
        <StorefrontHeader />

        <main className="flex-grow pb-16">
          {/* TOP BREADCRUMB & BANNER */}
          <div className="border-b border-white/10 bg-[#0E0E0E] py-10 px-6 lg:px-12">
            <div className="container mx-auto max-w-6xl">
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 mb-4 uppercase">
                <Link href="/store" className="hover:text-white transition">Home</Link>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
                <span className="text-white font-bold">Legal and Policies</span>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
                <span className="text-[#0F824B] font-bold">{policy.title}</span>
              </div>

              {/* Header Title & Metadata */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2.5 mb-2">
                    <Badge variant="outline" className="text-[10px] font-mono font-bold uppercase px-3 py-0.5 bg-[#0F824B]/10 text-[#0F824B] border-[#0F824B]/30">
                      {policy.badge}
                    </Badge>
                    <span className="text-xs font-mono text-zinc-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#0F824B]" />
                      Last Updated: {policy.lastUpdated}
                    </span>
                  </div>
                  <h1 className="text-4xl lg:text-6xl font-black font-bebas tracking-wider uppercase text-white">
                    {policy.title}
                  </h1>
                  <p className="mt-2 text-xs font-mono text-zinc-400 max-w-3xl leading-relaxed">
                    {policy.shortDescription}
                  </p>
                </div>
              </div>

              {/* TABS NAVIGATION */}
              <div className="mt-8 flex flex-wrap gap-2 border-t border-white/10 pt-4 font-mono text-xs">
                {POLICY_TABS.map((tab) => {
                  const isActive = pathname === tab.href;
                  const Icon = tab.icon;
                  return (
                    <Link
                      key={tab.slug}
                      href={tab.href}
                      className={cn(
                        'flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase transition-all',
                        isActive
                          ? 'bg-[#0F824B] text-white shadow-md'
                          : 'bg-[#141414] hover:bg-zinc-800 text-zinc-300 border border-white/10'
                      )}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{tab.title}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* MAIN CONTENT BODY */}
          <div className="container mx-auto max-w-6xl px-6 lg:px-12 py-10">
            {/* TWO COLUMN GRID: TABLE OF CONTENTS + CONTENT CARDS */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
              {/* STICKY TABLE OF CONTENTS */}
              <div className="hidden lg:block lg:col-span-1 sticky top-24 space-y-4 font-mono">
                <div className="rounded-2xl border border-white/10 bg-[#121212] p-5 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#0F824B]">
                    Table of Contents
                  </h3>
                  <nav className="space-y-1">
                    {policy.sections.map((section) => (
                      <button
                        key={section.id}
                        onClick={() => scrollToSection(section.id)}
                        className={cn(
                          'w-full text-left px-3 py-1.5 rounded-xl text-xs transition-all block truncate',
                          activeSection === section.id
                            ? 'bg-white/10 text-white font-bold'
                            : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                        )}
                        title={section.title}
                      >
                        {section.title}
                      </button>
                    ))}
                  </nav>
                </div>

                {/* QUICK SUPPORT MINI CARD */}
                <div className="rounded-2xl border border-white/10 bg-[#121212] p-5 space-y-2.5 text-xs text-white">
                  <div className="flex items-center gap-1.5 font-bold uppercase text-[#0F824B]">
                    <HelpCircle className="w-4 h-4" />
                    Support Desk
                  </div>
                  <p className="text-zinc-400 text-[11px] leading-relaxed">
                    Have questions regarding our policies? Our team is available to help.
                  </p>
                  <a
                    href={`mailto:${POLICY_CONTACT_INFO.email}`}
                    className="text-[#0F824B] hover:underline text-[11px] font-bold block truncate"
                  >
                    {POLICY_CONTACT_INFO.email}
                  </a>
                </div>
              </div>

              {/* POLICY SECTIONS LIST */}
              <div className="lg:col-span-3 space-y-6">
                {policy.sections.map((section) => (
                  <Card key={section.id} id={section.id} className="scroll-mt-28 bg-[#121212] border-white/10 text-white rounded-2xl overflow-hidden shadow-xl">
                    <CardHeader className="pb-3 border-b border-white/10 bg-[#171717]">
                      <CardTitle className="text-2xl font-black font-bebas uppercase tracking-wide text-white">
                        {section.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-5 space-y-4 text-xs font-mono leading-relaxed text-zinc-300">
                      {section.content.map((paragraph, pIdx) => (
                        <p key={pIdx}>
                          {paragraph}
                        </p>
                      ))}

                      {/* Subsections if present */}
                      {section.subsections && section.subsections.length > 0 && (
                        <div className="space-y-4 pt-2">
                          {section.subsections.map((sub, sIdx) => (
                            <div key={sIdx} className="p-4 rounded-xl bg-[#0A0A0A] border border-white/10 space-y-2">
                              <h4 className="text-xs font-bold text-[#0F824B] uppercase">
                                {sub.subtitle}
                              </h4>
                              <ul className="space-y-1.5 text-xs">
                                {sub.points.map((pt, ptIdx) => (
                                  <li key={ptIdx} className="flex items-start gap-2 text-zinc-300">
                                    <span className="h-1.5 w-1.5 rounded-full bg-[#0F824B] mt-1.5 shrink-0" />
                                    <span>{pt}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}

                {/* OFFICIAL CONTACT & GRIEVANCE CARD */}
                <Card className="bg-[#121212] border-white/10 text-white rounded-2xl overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl font-black font-bebas uppercase tracking-wide flex items-center gap-2">
                      <HelpCircle className="w-5 h-5 text-[#0F824B]" />
                      Official Support & Grievance Contact
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs font-mono text-zinc-300 space-y-3 pt-2">
                    <p>
                      For any questions or order assistance, please reach out through our official channels:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div className="flex items-center gap-2 p-3 rounded-xl bg-[#0A0A0A] border border-white/10">
                        <Mail className="w-4 h-4 text-[#0F824B] shrink-0" />
                        <div className="truncate">
                          <span className="text-[10px] text-zinc-400 block uppercase">Email Support</span>
                          <a
                            href={`mailto:${POLICY_CONTACT_INFO.email}`}
                            className="font-bold text-white hover:text-[#0F824B] transition"
                          >
                            {POLICY_CONTACT_INFO.email}
                          </a>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 p-3 rounded-xl bg-[#0A0A0A] border border-white/10">
                        <Phone className="w-4 h-4 text-[#0F824B] shrink-0" />
                        <div className="truncate">
                          <span className="text-[10px] text-zinc-400 block uppercase">Phone & WhatsApp</span>
                          <a
                            href={`tel:${POLICY_CONTACT_INFO.phone}`}
                            className="font-bold text-white hover:text-[#0F824B] transition"
                          >
                            {POLICY_CONTACT_INFO.phone}
                          </a>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 pt-2 text-[11px] text-zinc-400">
                      <MapPin className="w-3.5 h-3.5 text-[#0F824B] shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-white">Operating Address:</strong> {POLICY_CONTACT_INFO.companyName}, {POLICY_CONTACT_INFO.address} ({POLICY_CONTACT_INFO.hours})
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>

        <StorefrontFooter />
      </div>

      {/* MOBILE VIEW */}
      <div className="md:hidden flex flex-col min-h-screen bg-[#0A0A0A] text-[#FAF9F6]">
        <MobileHeader title={policy.title} />

        <main className="flex-grow pb-24 px-4 pt-4 space-y-4">
          {/* TABS SELECTOR */}
          <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-none -mx-4 px-4 font-mono">
            {POLICY_TABS.map((tab) => {
              const isActive = pathname === tab.href;
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.slug}
                  href={tab.href}
                  className={cn(
                    'flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap shrink-0 transition-all uppercase',
                    isActive
                      ? 'bg-[#0F824B] text-white font-extrabold'
                      : 'bg-[#121212] text-zinc-300 border border-white/10'
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.shortTitle}</span>
                </Link>
              );
            })}
          </div>

          {/* MOBILE HERO CARD */}
          <div className="rounded-2xl border border-white/10 bg-[#121212] p-5 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Badge variant="outline" className="text-[10px] font-mono px-2 py-0 bg-[#0F824B]/10 text-[#0F824B] border-[#0F824B]/30">
                {policy.badge}
              </Badge>
              <span className="text-[10px] font-mono text-zinc-400">
                Updated: {policy.lastUpdated}
              </span>
            </div>
            <h1 className="text-2xl font-black font-bebas uppercase tracking-wide text-white">
              {policy.title}
            </h1>
            <p className="text-xs font-mono text-zinc-400 leading-relaxed">
              {policy.shortDescription}
            </p>
          </div>

          {/* SECTIONS LIST FOR MOBILE */}
          <div className="space-y-4 pt-1">
            {policy.sections.map((section) => (
              <div
                key={section.id}
                id={section.id}
                className="rounded-2xl border border-white/10 bg-[#121212] p-5 space-y-3 scroll-mt-20"
              >
                <h2 className="text-xl font-black font-bebas uppercase text-white border-b border-white/10 pb-2">
                  {section.title}
                </h2>
                <div className="space-y-2.5 text-xs font-mono text-zinc-300 leading-relaxed">
                  {section.content.map((p, pIdx) => (
                    <p key={pIdx}>{p}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </main>

        <MobileFooter />
      </div>
    </div>
  );
}
