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
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
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
    <>
      {/* DESKTOP VIEW */}
      <div className="hidden md:flex flex-col min-h-screen bg-background text-foreground">
        <Header />

        <main className="flex-grow pb-16">
          {/* TOP BREADCRUMB & BANNER */}
          <div className="border-b bg-muted/20 py-8 px-4 sm:px-6">
            <div className="container mx-auto max-w-6xl">
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                <Link href="/" className="hover:text-foreground transition">Home</Link>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-foreground font-medium">Legal and Policies</span>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-foreground font-medium">{policy.title}</span>
              </div>

              {/* Header Title & Metadata */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2.5 mb-2">
                    <Badge variant="outline" className="text-xs px-2.5 py-0.5">
                      {policy.badge}
                    </Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      Last Updated: {policy.lastUpdated}
                    </span>
                  </div>
                  <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight">
                    {policy.title}
                  </h1>
                  <p className="mt-2 text-sm text-muted-foreground max-w-3xl">
                    {policy.shortDescription}
                  </p>
                </div>
              </div>

              {/* TABS NAVIGATION */}
              <div className="mt-8 flex flex-wrap gap-2 border-t pt-4">
                {POLICY_TABS.map((tab) => {
                  const isActive = pathname === tab.href;
                  const Icon = tab.icon;
                  return (
                    <Link
                      key={tab.slug}
                      href={tab.href}
                      className={cn(
                        'flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all',
                        isActive
                          ? 'bg-primary text-primary-foreground shadow-xs font-semibold'
                          : 'bg-card hover:bg-muted text-muted-foreground hover:text-foreground border'
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
          <div className="container mx-auto max-w-6xl px-4 sm:px-6 py-10">
            {/* TWO COLUMN GRID: TABLE OF CONTENTS + CONTENT CARDS */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
              {/* STICKY TABLE OF CONTENTS */}
              <div className="hidden lg:block lg:col-span-1 sticky top-20 space-y-4">
                <div className="rounded-xl border bg-card p-4 space-y-3 shadow-xs">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Table of Contents
                  </h3>
                  <nav className="space-y-1">
                    {policy.sections.map((section) => (
                      <button
                        key={section.id}
                        onClick={() => scrollToSection(section.id)}
                        className={cn(
                          'w-full text-left px-2.5 py-1.5 rounded-md text-xs font-medium transition-all block truncate',
                          activeSection === section.id
                            ? 'bg-muted text-foreground font-semibold'
                            : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                        )}
                        title={section.title}
                      >
                        {section.title}
                      </button>
                    ))}
                  </nav>
                </div>

                {/* QUICK SUPPORT MINI CARD */}
                <div className="rounded-xl border bg-card p-4 space-y-2.5 text-xs shadow-xs">
                  <div className="flex items-center gap-1.5 font-bold text-foreground">
                    <HelpCircle className="w-3.5 h-3.5 text-muted-foreground" />
                    Customer Support
                  </div>
                  <p className="text-muted-foreground text-[11px] leading-relaxed">
                    Have questions regarding our policies? Our team is available to help.
                  </p>
                  <a
                    href={`mailto:${POLICY_CONTACT_INFO.email}`}
                    className="text-foreground hover:underline text-[11px] font-medium block truncate"
                  >
                    {POLICY_CONTACT_INFO.email}
                  </a>
                </div>
              </div>

              {/* POLICY SECTIONS LIST */}
              <div className="lg:col-span-3 space-y-6">
                {policy.sections.map((section) => (
                  <Card key={section.id} id={section.id} className="scroll-mt-24 shadow-xs">
                    <CardHeader className="pb-3 border-b bg-muted/10">
                      <CardTitle className="text-lg font-bold text-foreground">
                        {section.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-4 text-sm leading-relaxed text-muted-foreground">
                      {section.content.map((paragraph, pIdx) => (
                        <p key={pIdx} className="text-sm">
                          {paragraph}
                        </p>
                      ))}

                      {/* Subsections if present */}
                      {section.subsections && section.subsections.length > 0 && (
                        <div className="space-y-4 pt-2">
                          {section.subsections.map((sub, sIdx) => (
                            <div key={sIdx} className="p-3.5 rounded-lg bg-muted/20 border space-y-2">
                              <h4 className="text-xs font-bold text-foreground">
                                {sub.subtitle}
                              </h4>
                              <ul className="space-y-1.5 text-xs">
                                {sub.points.map((pt, ptIdx) => (
                                  <li key={ptIdx} className="flex items-start gap-2">
                                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground mt-1.5 shrink-0" />
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
                <Card className="shadow-xs">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-muted-foreground" />
                      Contact and Support
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs text-muted-foreground space-y-3 pt-2">
                    <p>
                      For any questions or order assistance, please reach out through our official channels:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/30 border">
                        <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                        <div className="truncate">
                          <span className="text-[10px] text-muted-foreground block">Email Support</span>
                          <a
                            href={`mailto:${POLICY_CONTACT_INFO.email}`}
                            className="font-semibold text-foreground hover:underline transition"
                          >
                            {POLICY_CONTACT_INFO.email}
                          </a>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/30 border">
                        <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                        <div className="truncate">
                          <span className="text-[10px] text-muted-foreground block">Phone and WhatsApp</span>
                          <a
                            href={`tel:${POLICY_CONTACT_INFO.phone}`}
                            className="font-semibold text-foreground hover:underline transition"
                          >
                            {POLICY_CONTACT_INFO.phone}
                          </a>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 pt-2 text-[11px]">
                      <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
                      <span>
                        <strong>Operating Address:</strong> {POLICY_CONTACT_INFO.companyName}, {POLICY_CONTACT_INFO.address} ({POLICY_CONTACT_INFO.hours})
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>

      {/* MOBILE VIEW */}
      <div className="md:hidden flex flex-col min-h-screen bg-background text-foreground">
        <MobileHeader title={policy.title} />

        <main className="flex-grow pb-24 px-4 pt-4 space-y-4">
          {/* TABS SELECTOR (HORIZONTAL SCROLL) */}
          <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-none -mx-4 px-4">
            {POLICY_TABS.map((tab) => {
              const isActive = pathname === tab.href;
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.slug}
                  href={tab.href}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap shrink-0 transition-all',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-xs font-semibold'
                      : 'bg-muted text-muted-foreground hover:text-foreground border'
                  )}
                >
                  <Icon className="w-3 h-3" />
                  <span>{tab.shortTitle}</span>
                </Link>
              );
            })}
          </div>

          {/* MOBILE HERO CARD */}
          <div className="rounded-xl border bg-card p-4 space-y-2 shadow-xs">
            <div className="flex items-center justify-between gap-2">
              <Badge variant="outline" className="text-[10px] px-2 py-0">
                {policy.badge}
              </Badge>
              <span className="text-[10px] text-muted-foreground">
                Updated: {policy.lastUpdated}
              </span>
            </div>
            <h1 className="text-xl font-extrabold tracking-tight">
              {policy.title}
            </h1>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {policy.shortDescription}
            </p>
          </div>

          {/* QUICK JUMP CHIPS */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-1">
              Jump to Section
            </span>
            <div className="flex overflow-x-auto gap-1.5 pb-1 scrollbar-none -mx-4 px-4">
              {policy.sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-muted text-foreground whitespace-nowrap shrink-0 border"
                >
                  {section.title.split('.')[0]}. {section.title.split('.')[1]?.trim() || section.title}
                </button>
              ))}
            </div>
          </div>

          {/* SECTIONS LIST FOR MOBILE */}
          <div className="space-y-4 pt-1">
            {policy.sections.map((section) => (
              <div
                key={section.id}
                id={section.id}
                className="rounded-xl border bg-card p-4 space-y-3 shadow-xs scroll-mt-20"
              >
                <h2 className="text-sm font-bold text-foreground border-b pb-2">
                  {section.title}
                </h2>
                <div className="space-y-2.5 text-xs text-muted-foreground leading-relaxed">
                  {section.content.map((p, pIdx) => (
                    <p key={pIdx}>{p}</p>
                  ))}

                  {/* Subsections on mobile */}
                  {section.subsections && section.subsections.length > 0 && (
                    <div className="space-y-2.5 pt-1">
                      {section.subsections.map((sub, sIdx) => (
                        <div key={sIdx} className="p-2.5 rounded-lg bg-muted/30 border space-y-1.5">
                          <h3 className="text-[11px] font-bold text-foreground">
                            {sub.subtitle}
                          </h3>
                          <ul className="space-y-1 text-[11px]">
                            {sub.points.map((pt, ptIdx) => (
                              <li key={ptIdx} className="flex items-start gap-1.5">
                                <span className="h-1 w-1 rounded-full bg-muted-foreground mt-1.5 shrink-0" />
                                <span>{pt}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* MOBILE SUPPORT CARD */}
            <div className="rounded-xl border bg-card p-4 space-y-3 shadow-xs">
              <h3 className="text-xs font-bold flex items-center gap-1.5 text-foreground">
                <HelpCircle className="w-3.5 h-3.5 text-muted-foreground" />
                Customer Support
              </h3>
              <p className="text-[11px] text-muted-foreground">
                For order assistance or questions:
              </p>
              <div className="space-y-1.5 text-xs">
                <a
                  href={`mailto:${POLICY_CONTACT_INFO.email}`}
                  className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 border font-semibold text-foreground hover:underline transition truncate"
                >
                  <Mail className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <span className="truncate">{POLICY_CONTACT_INFO.email}</span>
                </a>
                <a
                  href={`tel:${POLICY_CONTACT_INFO.phone}`}
                  className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 border font-semibold text-foreground hover:underline transition"
                >
                  <Phone className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <span>{POLICY_CONTACT_INFO.phone}</span>
                </a>
              </div>
              <p className="text-[10px] text-muted-foreground pt-1">
                {POLICY_CONTACT_INFO.companyName}, {POLICY_CONTACT_INFO.address}
              </p>
            </div>
          </div>
        </main>

        <MobileFooter />
      </div>
    </>
  );
}
