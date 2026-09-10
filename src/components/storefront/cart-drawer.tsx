'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/cart-context';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const FREE_SHIPPING_THRESHOLD = 999;

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { cart, removeFromCart, updateQuantity, subtotal } = useCart();

  if (!isOpen) return null;

  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const freeShippingProgress = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer content */}
      <div className="relative w-full max-w-[460px] bg-[#0A0A0A] text-[#FAF9F6] border-l border-[#222222] flex flex-col h-full shadow-2xl z-10">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#222222]">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#0F824B]" />
            <h2 className="text-base font-display font-extrabold uppercase tracking-widest text-[#FAF9F6]">
              YOUR BAG ({cart.reduce((sum, item) => sum + item.quantity, 0)})
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close bag"
            className="p-1.5 text-[#8B8B86] hover:text-[#0F824B] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress Bar */}
        <div className="bg-[#111111] px-6 py-3.5 border-b border-[#222222]">
          <div className="flex items-center justify-between text-[11px] font-mono mb-2">
            {remainingForFreeShipping > 0 ? (
              <span>
                ADD <strong className="text-[#0F824B]">₹{remainingForFreeShipping}</strong> MORE FOR FREE SHIPPING
              </span>
            ) : (
              <span className="text-[#0F824B] font-bold">
                YOU HAVE UNLOCKED FREE SHIPPING!
              </span>
            )}
            <span className="text-[#8B8B86]">{freeShippingProgress}%</span>
          </div>
          <div className="w-full bg-[#222222] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#0F824B] h-full transition-all duration-500 rounded-full"
              style={{ width: `${freeShippingProgress}%` }}
            />
          </div>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-16 space-y-4">
              <p className="text-xl font-display font-bold uppercase tracking-wider text-[#FAF9F6]">
                YOUR BAG IS EMPTY.
              </p>
              <p className="text-xs font-mono text-[#8B8B86] max-w-[220px]">
                NOT FOR LONG. EXPLORE THE LATEST SILHOUETTES.
              </p>
              <Link
                href="/collections/drop-04"
                onClick={onClose}
                className="inline-flex items-center gap-2 bg-[#FFFFFF] text-[#0A0A0A] px-6 py-3 text-xs font-mono font-bold uppercase tracking-wider rounded-sm hover:bg-[#0F824B] transition-colors"
              >
                <span>SHOP NEW DROP</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={`${item.id}-${item.size}-${item.color}`}
                className="flex gap-4 pb-4 border-b border-[#1A1A1A] last:border-b-0"
              >
                <div className="relative w-20 h-24 bg-[#141414] rounded-sm overflow-hidden flex-shrink-0">
                  <Image
                    src={item.imageUrls?.[0] || 'https://m.media-amazon.com/images/X/bxt1/M/Ebxt1BRRIJUjrNQ.jpg'}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-xs font-display font-bold uppercase tracking-wide text-[#FAF9F6] line-clamp-1">
                        {item.name}
                      </h3>
                      <button
                        onClick={() => removeFromCart(item.id, item.size, item.color)}
                        aria-label="Remove item"
                        className="text-[#8B8B86] hover:text-[#CB2222] transition-colors p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-[11px] font-mono text-[#8B8B86] mt-0.5">
                      SIZE: <span className="text-[#FAF9F6] font-bold">{item.size || 'FREE'}</span> | COLOR: <span className="text-[#FAF9F6] font-bold">{item.color || 'DEFAULT'}</span>
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    {/* Quantity Stepper */}
                    <div className="flex items-center border border-[#292929] rounded-sm bg-[#111111]">
                      <button
                        onClick={() => updateQuantity(item.id, item.size, item.color, Math.max(1, item.quantity - 1))}
                        className="px-2.5 py-1 text-xs text-[#FAF9F6] hover:text-[#0F824B] transition-colors"
                      >
                        -
                      </button>
                      <span className="px-2 text-xs font-mono font-bold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.size, item.color, item.quantity + 1)}
                        className="px-2.5 py-1 text-xs text-[#FAF9F6] hover:text-[#0F824B] transition-colors"
                      >
                        +
                      </button>
                    </div>

                    {/* Price */}
                    <p className="text-sm font-mono font-bold text-[#FAF9F6]">
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Checkout Summary */}
        {cart.length > 0 && (
          <div className="p-6 border-t border-[#222222] bg-[#0E0E0E] space-y-4">
            <div className="flex items-center justify-between text-sm font-mono">
              <span className="text-[#8B8B86]">SUBTOTAL</span>
              <span className="text-base font-bold text-[#FAF9F6]">
                ₹{subtotal.toLocaleString('en-IN')}
              </span>
            </div>
            <p className="text-[11px] font-mono text-[#8B8B86]">
              Taxes calculated at checkout. Shipping calculated automatically.
            </p>

            <Link
              href="/checkout"
              onClick={onClose}
              className="w-full flex items-center justify-center gap-2 bg-[#0F824B] hover:bg-[#FFFFFF] text-[#0A0A0A] font-display font-extrabold text-sm uppercase tracking-widest py-3.5 px-6 rounded-sm transition-all duration-200 shadow-lg group"
            >
              <span>PROCEED TO CHECKOUT</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>

            <div className="flex items-center justify-center">
              <Link
                href="/cart"
                onClick={onClose}
                className="text-xs font-mono text-[#8B8B86] hover:text-[#FAF9F6] underline-offset-4 hover:underline"
              >
                VIEW FULL CART DETAILS
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
