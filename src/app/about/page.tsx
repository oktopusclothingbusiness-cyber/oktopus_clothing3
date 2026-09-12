'use client';

import * as React from 'react';
import Link from 'next/link';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { MobileHeader } from '@/components/mobile-header';
import { MobileFooter } from '@/components/mobile-footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import BaskeyAttribution from '@/components/baskey-attribution';
import { ArrowRight, Shirt, Palette, ShieldCheck, Sparkles, Building2 } from 'lucide-react';

export default function AboutPage() {
  const beliefs = [
    {
      title: 'INDIVIDUALITY OVER CONFORMITY',
      description: 'Your clothes are part of your identity. We create pieces that give you room to express it.',
      tag: '01',
    },
    {
      title: 'CREATIVITY WITHOUT LIMITS',
      description: "Ideas don't have to fit into a predefined category. We experiment with graphics, concepts, styles and custom designs.",
      tag: '02',
    },
    {
      title: 'QUALITY THAT EARNS ITS PLACE',
      description: "Good design means little if the product doesn't feel good to wear. We focus on materials, construction, comfort and finishing.",
      tag: '03',
    },
    {
      title: 'PERSONALIZATION MATTERS',
      description: "A piece becomes more meaningful when it feels like it belongs to you. That's why customization is an important part of the OKTOPUS experience.",
      tag: '04',
    },
    {
      title: 'ALWAYS EVOLVING',
      description: 'Fashion changes. People change. Ideas change. OKTOPUS is designed to evolve with them.',
      tag: '05',
    },
  ];

  return (
    <>
      {/* DESKTOP VIEW */}
      <div className="hidden md:flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300">
        <Header />

        <main className="flex-grow">
          {/* HERO BANNER */}
          <section className="relative border-b py-20 bg-muted/20">
            <div className="container mx-auto px-4 max-w-5xl text-center space-y-6">
              <div className="flex items-center justify-center gap-3">
                <BaskeyAttribution className="px-3.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold tracking-[0.2em] text-[11px]" />
                <Badge variant="outline" className="text-[11px] font-semibold uppercase tracking-wider px-3 py-0.5 border-primary/30 text-primary">
                  GOI Registered MSME
                </Badge>
              </div>

              <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight font-bebas uppercase leading-none text-foreground">
                WEAR WHAT YOU STAND FOR.
              </h1>

              <p className="text-xl font-medium text-foreground max-w-3xl mx-auto leading-relaxed">
                OKTOPUS CLOTHING is an Indian fashion brand built around one simple idea:
                <br />
                <span className="font-bold text-primary">Clothing should feel like an extension of who you are.</span>
              </p>

              <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                We create clothing for people who don’t want to disappear into the crowd. From everyday essentials to expressive designs and personalized pieces, OKTOPUS is about individuality, creativity, and the freedom to wear something that feels distinctly yours.
              </p>

              <div className="pt-2 flex items-center justify-center gap-4">
                <Button size="lg" className="font-bold text-xs gap-2 px-8 shadow-sm" asChild>
                  <Link href="/products">
                    <Shirt className="h-4 w-4" />
                    EXPLORE COLLECTION
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="font-bold text-xs gap-2 px-8" asChild>
                  <Link href="/customize">
                    <Palette className="h-4 w-4 text-primary" />
                    CUSTOM DESIGN STUDIO
                  </Link>
                </Button>
              </div>
            </div>
          </section>

          {/* MORE THAN A CLOTHING BRAND */}
          <section className="py-16 container mx-auto px-4 max-w-5xl">
            <div className="max-w-3xl mx-auto space-y-6">
              <span className="text-xs font-bold uppercase tracking-widest text-primary font-mono">
                // BRAND PHILOSOPHY
              </span>
              <h2 className="text-4xl font-extrabold font-bebas uppercase tracking-wide">
                MORE THAN A CLOTHING BRAND.
              </h2>

              <div className="space-y-4 text-muted-foreground leading-relaxed text-base">
                <p>OKTOPUS started with a belief that fashion should be personal.</p>
                <p>
                  Not everyone sees the world the same way. Not everyone has the same taste, the same story, or the same way of expressing themselves.
                </p>
                <p className="font-bold text-foreground text-lg">So why should everyone dress the same?</p>
                <p>
                  We built OKTOPUS to create clothing that gives people another way to express their identity — through graphics, ideas, details, silhouettes, and customization.
                </p>
                <div className="p-5 bg-card border-l-4 border-primary rounded-r-lg font-bold text-foreground text-lg my-6">
                  “Every piece is designed with the intention of being more than something you wear. It should say something about you.”
                </div>
              </div>
            </div>
          </section>

          {/* THE STORY BEHIND THE NAME */}
          <section className="py-16 bg-muted/30 border-y">
            <div className="container mx-auto px-4 max-w-5xl space-y-10">
              <div className="max-w-3xl mx-auto space-y-4">
                <span className="text-xs font-bold uppercase tracking-widest text-primary font-mono">
                  // THE CONCEPT
                </span>
                <h2 className="text-4xl md:text-5xl font-extrabold font-bebas uppercase tracking-wide">
                  THE STORY BEHIND THE NAME
                </h2>
                <p className="text-muted-foreground leading-relaxed text-base">
                  The octopus is one of nature’s most adaptable and intelligent creatures. It can change, respond, explore and evolve — using each of its arms independently while remaining part of one coordinated whole.
                </p>
                <p className="text-foreground font-semibold text-base">That idea became the foundation of OKTOPUS.</p>
              </div>

              {/* 3 CORE CONCEPTS */}
              <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <Card className="border shadow-xs">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-2xl font-bold font-bebas tracking-wider text-primary">
                      ADAPTABILITY
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs text-muted-foreground leading-relaxed">
                    Responding, exploring, and evolving across styles while maintaining a unified identity.
                  </CardContent>
                </Card>

                <Card className="border shadow-xs">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-2xl font-bold font-bebas tracking-wider text-primary">
                      CREATIVITY
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs text-muted-foreground leading-relaxed">
                    Experimenting with graphics, visual concepts, silhouettes, and customization.
                  </CardContent>
                </Card>

                <Card className="border shadow-xs">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-2xl font-bold font-bebas tracking-wider text-primary">
                      INDIVIDUALITY
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs text-muted-foreground leading-relaxed">
                    Embracing your distinct story. Different ideas and styles coexisting together.
                  </CardContent>
                </Card>
              </div>

              <div className="text-center pt-4">
                <p className="text-sm text-muted-foreground max-w-2xl mx-auto mb-3">
                  Different ideas can exist together. Different styles can coexist. And there is no single definition of what personal style should look like. OKTOPUS represents that freedom.
                </p>
                <div className="text-3xl font-extrabold font-bebas tracking-widest text-primary uppercase">
                  ONE IDENTITY. MANY EXPRESSIONS.
                </div>
              </div>
            </div>
          </section>

          {/* BORN FROM BASKEY STUDIO */}
          <section className="py-20 container mx-auto px-4 max-w-5xl">
            <div className="rounded-2xl bg-card border p-8 md:p-12 shadow-sm space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b pb-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-primary">
                    <Building2 className="h-4 w-4" />
                    CREATIVE VENTURE
                  </div>
                  <h2 className="text-4xl md:text-5xl font-extrabold font-bebas tracking-wide uppercase">
                    BORN FROM BASKEY STUDIO
                  </h2>
                  <p className="text-sm font-semibold text-foreground">
                    OKTOPUS CLOTHING is a unit of <span className="text-primary">BASKEY Studio</span>.
                  </p>
                </div>

                <div className="bg-muted/50 border rounded-xl p-4 flex items-center gap-3 shrink-0">
                  <div className="w-10 h-10 rounded-lg bg-primary text-black flex items-center justify-center font-mono font-extrabold text-sm">
                    MSME
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">BASKEY Studio</p>
                    <p className="text-[11px] text-muted-foreground">Government of India — Registered MSME</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                <p>
                  OKTOPUS is part of <strong className="text-foreground">BASKEY Studio</strong>, an Indian creative venture built around ideas, design, technology and entrepreneurship.
                </p>
                <p>
                  The brand was created as a way to bring that creative mindset into fashion — turning concepts and visual ideas into products that people can actually wear.
                </p>
                <p>
                  This means OKTOPUS is not built simply around selling apparel. It is built around <strong className="text-foreground">creating, experimenting and developing a distinct identity through design.</strong>
                </p>
              </div>

              <div className="p-4 bg-muted/30 rounded-xl border flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono">
                <span className="font-bold text-foreground">BASKEY Studio: Creative • Digital • Design • Entrepreneurship</span>
                <span className="text-primary font-semibold">Independent in spirit. Indian at heart. Built for the long term.</span>
              </div>
            </div>
          </section>

          {/* WHAT WE BELIEVE */}
          <section className="py-16 bg-muted/20 border-y">
            <div className="container mx-auto px-4 max-w-5xl space-y-10">
              <div className="text-center max-w-3xl mx-auto space-y-2">
                <span className="text-xs font-bold uppercase tracking-widest text-primary font-mono">
                  // CORE VALUES
                </span>
                <h2 className="text-4xl md:text-5xl font-extrabold font-bebas uppercase tracking-wide">
                  WHAT WE BELIEVE
                </h2>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {beliefs.map((b) => (
                  <Card key={b.tag} className="border shadow-xs hover:border-primary/50 transition-colors">
                    <CardHeader className="pb-2">
                      <span className="text-xs font-mono font-bold text-primary">{b.tag}</span>
                      <CardTitle className="text-lg font-bold font-bebas tracking-wide text-foreground">
                        {b.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs text-muted-foreground leading-relaxed">
                      {b.description}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* FROM AN IDEA TO SOMETHING YOU CAN WEAR */}
          <section className="py-20 container mx-auto px-4 max-w-5xl">
            <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
              <span className="text-xs font-bold uppercase tracking-widest text-primary font-mono">
                // PROCESS & JOURNEY
              </span>
              <h2 className="text-4xl md:text-5xl font-extrabold font-bebas uppercase tracking-wide">
                FROM AN IDEA TO SOMETHING YOU CAN WEAR
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Every OKTOPUS piece begins with an idea. That idea goes through design, refinement and production before it becomes something physical.
              </p>
            </div>

            {/* FLOW PIPELINE */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-6 bg-card border rounded-xl space-y-2">
                <span className="text-xs font-mono text-primary font-bold">STEP 01</span>
                <p className="text-2xl font-extrabold font-bebas tracking-wider text-foreground">IDEA</p>
                <p className="text-xs text-muted-foreground">Concept & Inspiration</p>
              </div>

              <div className="p-6 bg-card border rounded-xl space-y-2">
                <span className="text-xs font-mono text-primary font-bold">STEP 02</span>
                <p className="text-2xl font-extrabold font-bebas tracking-wider text-foreground">DESIGN</p>
                <p className="text-xs text-muted-foreground">Visual Art & Details</p>
              </div>

              <div className="p-6 bg-card border rounded-xl space-y-2">
                <span className="text-xs font-mono text-primary font-bold">STEP 03</span>
                <p className="text-2xl font-extrabold font-bebas tracking-wider text-foreground">CREATE</p>
                <p className="text-xs text-muted-foreground">Precision Craftsmanship</p>
              </div>

              <div className="p-6 bg-card border rounded-xl space-y-2">
                <span className="text-xs font-mono text-primary font-bold">STEP 04</span>
                <p className="text-2xl font-extrabold font-bebas tracking-wider text-foreground">WEAR</p>
                <p className="text-xs text-muted-foreground">Your Unique Identity</p>
              </div>
            </div>

            <p className="text-center text-xs text-muted-foreground max-w-2xl mx-auto mt-8 italic">
              We care about the entire journey — not just the final product. Because the difference between an ordinary piece of clothing and something you actually connect with is often in the thought behind it.
            </p>
          </section>

          {/* MISSION & CLOSING MANIFESTO */}
          <section className="py-20 bg-primary text-primary-foreground">
            <div className="container mx-auto px-4 max-w-4xl text-center space-y-8">
              <span className="text-xs font-mono font-bold tracking-widest uppercase opacity-90">OUR MISSION</span>

              <h2 className="text-4xl md:text-6xl font-extrabold font-bebas uppercase tracking-wide leading-tight">
                THIS IS OKTOPUS.
              </h2>

              <p className="text-lg md:text-xl font-medium max-w-3xl mx-auto leading-relaxed">
                To build a fashion brand that gives people the freedom to express themselves through clothing — combining design, individuality, comfort and quality in everything we create.
              </p>

              <div className="p-6 rounded-xl bg-black/20 border border-white/10 max-w-xl mx-auto space-y-3">
                <p className="text-lg font-bold font-bebas tracking-wider uppercase">
                  NOT MADE FOR EVERYONE. MADE FOR PEOPLE WHO WANT TO EXPRESS SOMETHING.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-xs font-mono opacity-90">
                  <span>Wear your ideas.</span>
                  <span className="hidden sm:inline">•</span>
                  <span>Wear your identity.</span>
                  <span className="hidden sm:inline">•</span>
                  <span>Wear what feels like you.</span>
                </div>
              </div>

              <div className="pt-2">
                <Button size="lg" variant="secondary" className="font-bold text-xs gap-2 px-8 shadow-md" asChild>
                  <Link href="/products">
                    SHOP STORE <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>

              <div className="pt-8 border-t border-white/20 text-xs font-mono opacity-80">
                OKTOPUS CLOTHING — A Unit of BASKEY Studio (Government of India Registered MSME)
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>

      {/* MOBILE VIEW */}
      <div className="md:hidden flex flex-col min-h-screen bg-background text-foreground pb-24">
        <MobileHeader title="About OKTOPUS" />

        <main className="flex-1 p-4 space-y-5">
          {/* HERO */}
          <Card className="card-glass border-primary/20 shadow-xs text-center">
            <CardContent className="p-5 space-y-3">
              <div className="flex flex-col items-center gap-1.5">
                <BaskeyAttribution className="px-3 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold tracking-[0.2em] text-[10px]" />
                <Badge variant="outline" className="text-[9px] uppercase border-primary/30 text-primary">
                  GOI Registered MSME
                </Badge>
              </div>
              <h1 className="text-3xl font-extrabold font-bebas tracking-wide uppercase text-foreground">
                WEAR WHAT YOU STAND FOR
              </h1>
              <p className="text-xs text-muted-foreground leading-relaxed">
                OKTOPUS CLOTHING is an Indian fashion brand built around one simple idea: <strong className="text-foreground">Clothing should feel like an extension of who you are.</strong>
              </p>
            </CardContent>
          </Card>

          {/* MORE THAN A CLOTHING BRAND */}
          <Card className="card-glass shadow-xs">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold font-bebas uppercase tracking-wide">
                MORE THAN A CLOTHING BRAND
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-2 leading-relaxed">
              <p>Not everyone sees the world the same way. So why should everyone dress the same?</p>
              <p>We craft clothing that gives people another way to express their identity through graphics, details, silhouettes, and customization.</p>
              <div className="p-3 bg-muted/40 border-l-2 border-primary text-foreground font-semibold italic text-xs">
                “Every piece should say something about you.”
              </div>
            </CardContent>
          </Card>

          {/* STORY BEHIND THE NAME */}
          <Card className="card-glass shadow-xs">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold font-bebas uppercase tracking-wide text-primary">
                THE STORY BEHIND THE NAME
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-3 leading-relaxed">
              <p>Like the octopus—known for adaptability and intelligence—we embrace versatility in fashion.</p>
              <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-bold font-bebas pt-1">
                <div className="p-2 bg-muted border rounded-lg text-foreground">ADAPTABILITY</div>
                <div className="p-2 bg-muted border rounded-lg text-foreground">CREATIVITY</div>
                <div className="p-2 bg-muted border rounded-lg text-foreground">INDIVIDUALITY</div>
              </div>
              <p className="font-bold text-primary text-center text-xs tracking-wider font-bebas pt-1">
                ONE IDENTITY. MANY EXPRESSIONS.
              </p>
            </CardContent>
          </Card>

          {/* BASKEY STUDIO SHOWCASE */}
          <Card className="border shadow-sm bg-card">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-primary font-bold">
                <Building2 className="h-3.5 w-3.5" />
                CREATIVE VENTURE
              </div>
              <CardTitle className="text-xl font-bold font-bebas tracking-wide uppercase">
                BORN FROM BASKEY STUDIO
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-3 leading-relaxed">
              <p>
                OKTOPUS is part of <strong className="text-foreground">BASKEY Studio</strong>, an Indian creative venture built around ideas, design, technology and entrepreneurship.
              </p>
              <div className="p-2.5 bg-muted/40 border rounded-lg text-[10px] font-mono text-foreground">
                BASKEY Studio: Creative • Digital • Design • Entrepreneurship
              </div>
              <p className="text-[11px] text-primary font-mono font-semibold">
                Government of India Registered MSME
              </p>
            </CardContent>
          </Card>

          {/* WHAT WE BELIEVE */}
          <Card className="card-glass shadow-xs">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold font-bebas uppercase tracking-wide">WHAT WE BELIEVE</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              {beliefs.map((b) => (
                <div key={b.tag} className="p-2.5 bg-muted/30 border rounded-lg space-y-1">
                  <p className="font-bold font-bebas text-sm text-foreground tracking-wide">{b.title}</p>
                  <p className="text-[11px] text-muted-foreground">{b.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* PROCESS */}
          <Card className="card-glass shadow-xs text-center">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold font-bebas uppercase tracking-wide">
                IDEA ➔ DESIGN ➔ CREATE ➔ WEAR
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-3">
              <div className="grid grid-cols-4 gap-1">
                <div className="p-2 bg-muted/40 border rounded-md font-bold font-bebas text-primary text-xs">IDEA</div>
                <div className="p-2 bg-muted/40 border rounded-md font-bold font-bebas text-primary text-xs">DESIGN</div>
                <div className="p-2 bg-muted/40 border rounded-md font-bold font-bebas text-primary text-xs">CREATE</div>
                <div className="p-2 bg-muted/40 border rounded-md font-bold font-bebas text-primary text-xs">WEAR</div>
              </div>
              <p className="text-[11px] italic">“We care about the entire journey — not just the final product.”</p>
            </CardContent>
          </Card>

          {/* CLOSING */}
          <Card className="bg-primary text-primary-foreground text-center shadow-md">
            <CardContent className="p-5 space-y-3">
              <h2 className="text-2xl font-extrabold font-bebas uppercase tracking-wide">THIS IS OKTOPUS</h2>
              <p className="text-xs font-semibold">Not made for everyone. Made for people who want to express something.</p>
              <Button size="sm" variant="secondary" className="w-full font-bold text-xs" asChild>
                <Link href="/products">EXPLORE STORE</Link>
              </Button>
            </CardContent>
          </Card>
        </main>

        <MobileFooter />
      </div>
    </>
  );
}
