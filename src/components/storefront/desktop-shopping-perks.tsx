'use client';

import * as React from 'react';

export function DesktopShoppingPerks() {
  const perks = [
    {
      code: 'EXPRESS DISPATCH',
      title: 'Free Express Delivery',
      description: 'On all orders above ₹999 across India',
    },
    {
      code: 'FABRIC PURITY',
      title: '240 GSM Combed Cotton',
      description: 'Heavyweight bio-washed compact yarn',
    },
    {
      code: 'SATISFACTION GUARANTEE',
      title: '7-Day Easy Exchanges',
      description: 'Hassle-free doorstep size swap',
    },
    {
      code: 'CLIENT ACCESS',
      title: 'Oktocoin Loyalty Rewards',
      description: 'Exclusive tier drops on every order',
    },
  ];

  return (
    <section className="border-t border-white/10 bg-black py-10 select-none">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {perks.map((perk, i) => (
            <div key={i} className="border-l border-white/15 pl-4 space-y-1">
              <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase block">
                {perk.code}
              </span>
              <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                {perk.title}
              </h4>
              <p className="text-[11px] text-zinc-400 font-sans leading-tight">{perk.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

