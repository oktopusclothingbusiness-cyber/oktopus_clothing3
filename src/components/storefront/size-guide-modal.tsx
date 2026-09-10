'use client';

import React from 'react';
import { X, CheckCircle2 } from 'lucide-react';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MEASUREMENTS = [
  { size: 'XS', chest: '40"', shoulder: '19.5"', length: '27.5"', fit: 'Standard Oversized' },
  { size: 'S', chest: '42"', shoulder: '20.5"', length: '28.5"', fit: 'Engineered Drop Shoulder' },
  { size: 'M', chest: '44"', shoulder: '21.5"', length: '29.5"', fit: 'Engineered Drop Shoulder' },
  { size: 'L', chest: '46"', shoulder: '22.5"', length: '30.5"', fit: 'Engineered Drop Shoulder' },
  { size: 'XL', chest: '48"', shoulder: '23.5"', length: '31.5"', fit: 'Heavy Drop Shoulder' },
  { size: 'XXL', chest: '50"', shoulder: '24.5"', length: '32.5"', fit: 'Maximum Streetwear Drape' },
];

export function SizeGuideModal({ isOpen, onClose }: SizeGuideModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-md"
        onClick={onClose}
      />
      <div className="relative w-full max-w-xl bg-[#0E0E0E] text-[#FAF9F6] border border-[#292929] rounded-sm p-6 md:p-8 z-10 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-[#222222]">
          <div>
            <h3 className="text-lg font-display font-bold uppercase tracking-wider text-[#FAF9F6]">
              SIZE & FIT SPECIFICATION
            </h3>
            <p className="text-xs font-mono text-[#8B8B86] mt-0.5">
              ALL MEASUREMENTS IN INCHES // GARMENT FLAT LAID
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close size guide"
            className="p-1.5 text-[#8B8B86] hover:text-[#0F824B] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Model Reference Card */}
        <div className="my-5 p-3.5 bg-[#141414] border border-[#222222] rounded-xs flex items-center gap-3">
          <CheckCircle2 className="w-4 h-4 text-[#0F824B] flex-shrink-0" />
          <p className="text-xs font-mono text-[#FAF9F6]">
            MODEL STATS: <strong>5&apos;11&quot; (180 CM)</strong>, <strong>72 KG</strong> WEARING SIZE <strong>L</strong>
          </p>
        </div>

        {/* Measurements Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#292929] text-[#8B8B86]">
                <th className="py-2.5 px-3">SIZE</th>
                <th className="py-2.5 px-3">CHEST</th>
                <th className="py-2.5 px-3">SHOULDER</th>
                <th className="py-2.5 px-3">LENGTH</th>
                <th className="py-2.5 px-3 hidden sm:table-cell">FIT TYPE</th>
              </tr>
            </thead>
            <tbody>
              {MEASUREMENTS.map((m) => (
                <tr
                  key={m.size}
                  className="border-b border-[#1A1A1A] hover:bg-[#141414] transition-colors"
                >
                  <td className="py-3 px-3 font-bold text-[#0F824B]">{m.size}</td>
                  <td className="py-3 px-3 text-[#FAF9F6]">{m.chest}</td>
                  <td className="py-3 px-3 text-[#FAF9F6]">{m.shoulder}</td>
                  <td className="py-3 px-3 text-[#FAF9F6]">{m.length}</td>
                  <td className="py-3 px-3 text-[#8B8B86] hidden sm:table-cell">{m.fit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Fit Advice */}
        <div className="mt-6 pt-4 border-t border-[#222222] text-[11px] font-mono text-[#8B8B86] space-y-1">
          <p>• Engineered with a boxy, dropped-shoulder silhouette.</p>
          <p>• For true oversized streetwear look, order your standard size.</p>
          <p>• For standard regular fit, order one size down.</p>
        </div>
      </div>
    </div>
  );
}
