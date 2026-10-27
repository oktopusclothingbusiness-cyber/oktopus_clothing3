'use client';

import * as React from 'react';

export function DesktopQualityStory() {
  const pillars = [
    {
      code: 'SPEC 01',
      spec: '240 GSM',
      title: 'Combed Cotton Canvas',
      subtitle: 'HEAVYWEIGHT YARN INTEGRITY',
      description:
        'Engineered with dense, long-staple combed cotton fibers that undergo specialized bio-washing. The heavy 240 GSM fabric provides structural drape without stiffness, eliminating fabric shrinkage and neck sagging.',
      features: [
        '100% Combed Compact Cotton',
        'Pre-shrunk & Bio-washed Yarn',
        'Reinforced Zero-Sag Collar Ribbing',
      ],
    },
    {
      code: 'SPEC 02',
      spec: 'HIGH-DENSITY',
      title: 'Discharge Screen Art',
      subtitle: 'EMBEDDED PIGMENT REGISTRATION',
      description:
        'Our prints are embedded directly into the textile weave using industrial-grade discharge and plastisol techniques. The artwork breathes with the cotton, resisting cracking, peeling, or fading across dozens of washes.',
      features: [
        'High-Detail Graphic Registration',
        'Breathable Ink Soft-Hand Feel',
        'Fade-Resistant Pigmentation',
      ],
    },
    {
      code: 'SPEC 03',
      spec: 'BOXY FIT',
      title: 'Architectural Cut',
      subtitle: 'PRECISION DROP-SHOULDER TAILORING',
      description:
        'Tailored with a relaxed, dropped-shoulder silhouette inspired by modern Tokyo and Berlin streetwear. Finished with reinforced collar ribbing and dual-needle edge topstitching for lasting structural durability.',
      features: [
        'Relaxed Drop-Shoulder Fit',
        'Reinforced 1x1 Collar Ribbing',
        'Twin-Needle Sleeve & Hem Stitches',
      ],
    },
  ];

  return (
    <section className="bg-background py-16 lg:py-24 border-b border-white/10 select-none">
      <div className="container mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="max-w-2xl mb-14 space-y-2">
          <span className="text-xs font-mono font-bold uppercase tracking-[0.25em] text-zinc-500">
            ENGINEERING SPECIFICATIONS • MATERIALS
          </span>
          <h2 className="text-4xl lg:text-6xl font-black font-bebas tracking-tight text-foreground">
            THE QUALITY ANATOMY
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Every garment is tested against rigorous streetwear standards. We engineer every stitch, yarn weight, and print process from the ground up.
          </p>
        </div>

        {/* 3 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {pillars.map((pillar) => (
            <div
              key={pillar.code}
              className="relative p-8 bg-zinc-950 border border-white/10 flex flex-col justify-between hover:border-white/30 transition-all duration-300 group"
            >
              <div>
                {/* Top Badge & Number */}
                <div className="flex items-center justify-between pb-6 border-b border-white/10 mb-6">
                  <span className="text-xs font-mono tracking-widest text-zinc-400 font-bold">
                    {pillar.code}
                  </span>
                  <span className="text-[11px] font-mono tracking-wider text-white px-2 py-0.5 bg-zinc-900 border border-white/15">
                    {pillar.spec}
                  </span>
                </div>

                {/* Subtitle & Title */}
                <p className="text-[10px] font-mono tracking-widest uppercase text-zinc-500 mb-1">
                  {pillar.subtitle}
                </p>
                <h3 className="text-2xl lg:text-3xl font-black font-bebas tracking-wide uppercase text-foreground mb-3">
                  {pillar.title}
                </h3>

                <p className="text-xs text-muted-foreground leading-relaxed mb-6">
                  {pillar.description}
                </p>
              </div>

              {/* Technical Specifications List */}
              <ul className="space-y-2.5 pt-4 border-t border-white/10">
                {pillar.features.map((feat, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs font-mono text-zinc-300">
                    <span className="text-zinc-500 font-bold">—</span>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

