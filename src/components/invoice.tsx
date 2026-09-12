'use client';

import { format } from 'date-fns';
import Image from 'next/image';
import { getShortOrderId } from '@/lib/utils';

type OrderProduct = {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  size: string;
  color: string;
};

type Order = {
  _id: string;
  userName: string;
  products: OrderProduct[];
  total: number;
  shipping: number;
  discount: number;
  subtotal: number;
  shippingAddress: {
    address: string;
    mobile: string;
  };
  createdAt: string;
  paymentDetails: {
    razorpay_payment_id?: string;
    paymentStatus?: 'paid' | 'pending';
  };
};

type Settings = {
  logoUrl?: string;
};

type InvoiceProps = {
  order: Order;
  settings: Settings | null;
};

/**
 * Authentic Official Verification Circular Ink Stamp Graphic
 * Color-matched to the dark slate/charcoal (#474e5d) of adaptive-icon.png
 */
const VerifiedStamp = () => (
  <div
    className="relative w-36 h-36 -rotate-12 select-none pointer-events-none print:block opacity-95 transition-all filter drop-shadow-xs"
    style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
  >
    <svg viewBox="0 0 160 160" className="w-full h-full text-[#474e5d]">
      <defs>
        {/* Circle Path for Curved Text */}
        <path
          id="stampTextPath"
          d="M 80, 80 m -57, 0 a 57,57 0 1,1 114,0 a 57,57 0 1,1 -114,0"
        />
      </defs>

      {/* Outer Rubber Stamp Borders */}
      <circle cx="80" cy="80" r="76" fill="none" stroke="currentColor" strokeWidth="2.5" strokeDasharray="6 3" />
      <circle cx="80" cy="80" r="68" fill="none" stroke="currentColor" strokeWidth="1.4" />

      {/* Outer Curved Text matching mascot theme */}
      <text fill="currentColor" className="font-extrabold text-[9.2px] tracking-[0.25em] uppercase font-mono">
        <textPath href="#stampTextPath" startOffset="0%">
          ★ OKTOPUS CLOTHING ★ OFFICIAL VERIFIED SEAL
        </textPath>
      </text>

      {/* Inner Stamp Borders */}
      <circle cx="80" cy="80" r="45" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="80" cy="80" r="41" fill="none" stroke="currentColor" strokeWidth="0.8" strokeDasharray="3 2" />

      {/* Center Mascot Image matching color */}
      <image
        href="/adaptive-icon.png"
        x="54"
        y="54"
        width="52"
        height="52"
        preserveAspectRatio="xMidYMid meet"
      />
    </svg>
  </div>
);

export const Invoice = ({ order, settings }: InvoiceProps) => {
  const subtotal = order.subtotal || order.products.reduce((acc, p) => acc + p.price * p.quantity, 0);
  const shipping = order.shipping || 0;
  const discount = order.discount || 0;

  const formattedDate = order.createdAt ? format(new Date(order.createdAt), 'MMMM dd, yyyy') : 'N/A';
  const shortCode = getShortOrderId(order._id);
  const invoiceNum = `OKT-${shortCode}`;

  return (
    <div className="min-h-screen bg-slate-100/50 py-8 px-4 sm:px-6 lg:px-8 print:py-0 print:px-0 print:bg-white flex flex-col items-center">
      {/* Printable Invoice Container with Explicit Print Border */}
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-sm border-2 border-slate-300 overflow-hidden print:border-2 print:border-slate-400 print:rounded-xl print:max-w-none print:w-full">
        
        {/* Main Content Area */}
        <div className="p-8 sm:p-12 space-y-8 relative">
          
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pb-6 border-b border-slate-200">
            
            {/* Left Header: Logo & Parent Company Text (Width Matched to Logo) */}
            <div className="w-[160px] flex flex-col items-center space-y-1">
              {settings?.logoUrl ? (
                <Image src={settings.logoUrl} alt="Oktopus Logo" width={160} height={50} className="object-contain" priority />
              ) : (
                <span className="text-xl font-bold tracking-tight text-slate-900 block text-center w-[160px]">OKTOPUS CLOTHING</span>
              )}

              {/* Baskey Studio Attribution - Exactly 160px wide to match logo */}
              <p className="w-[160px] text-[9.5px] font-extrabold tracking-[0.14em] text-amber-600 uppercase text-center block leading-tight pt-0.5">
                A Unit of BASKEY Studio
              </p>
              <p className="w-[160px] text-[10.5px] text-slate-400 font-normal text-center leading-tight">
                Kolkata, West Bengal, India
              </p>
            </div>

            {/* Right Header: 6-Digit Alphanumeric Order ID & Date */}
            <div className="text-left sm:text-right space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 font-mono">TAX INVOICE</span>
              <h1 className="text-xl font-mono font-bold text-slate-900">#{invoiceNum}</h1>
              <p className="text-xs text-slate-500">{formattedDate}</p>
              <p className="text-xs font-semibold text-slate-600 uppercase pt-1">
                Payment: <span className={order.paymentDetails?.paymentStatus === 'paid' ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold'}>
                  {order.paymentDetails?.paymentStatus === 'paid' ? 'PAID' : 'PENDING'}
                </span>
              </p>
            </div>
          </div>

          {/* Customer & Order Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-sm pt-2">
            <div className="space-y-1">
              <h2 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 font-mono">Billed To</h2>
              <p className="font-bold text-slate-900 text-base">{order.userName || 'Customer'}</p>
              <p className="text-slate-600 leading-relaxed max-w-xs">{order.shippingAddress?.address || 'N/A'}</p>
              <p className="text-slate-500 font-mono text-xs pt-1">Mobile: {order.shippingAddress?.mobile || 'N/A'}</p>
            </div>

            <div className="space-y-1 sm:text-right">
              <h2 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 font-mono">Order Summary</h2>
              <p className="text-slate-700 font-medium font-mono"><span className="text-slate-400 font-normal">Order ID:</span> #{shortCode}</p>
              {order.paymentDetails?.razorpay_payment_id && (
                <p className="text-slate-700 font-medium text-xs font-mono"><span className="text-slate-400 font-normal">Payment Ref:</span> {order.paymentDetails.razorpay_payment_id}</p>
              )}
              <p className="text-slate-500 text-xs"><span className="text-slate-400 font-normal">Dispatch Mode:</span> Express Shipping</p>
            </div>
          </div>

          {/* Clean Item Table */}
          <div className="overflow-hidden pt-2">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-900 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                  <th className="py-2.5 pr-4 font-bold text-slate-900">Description</th>
                  <th className="py-2.5 px-4 font-bold text-slate-900 text-center">Qty</th>
                  <th className="py-2.5 px-4 font-bold text-slate-900 text-right">Unit Price</th>
                  <th className="py-2.5 pl-4 font-bold text-slate-900 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {order.products.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-3.5 pr-4">
                      <p className="font-semibold text-slate-900">{item.name}</p>
                      {(item.size || item.color) && (
                        <p className="text-xs text-slate-500 mt-0.5">
                          {item.size ? `Size: ${item.size}` : ''}{item.size && item.color ? ' | ' : ''}{item.color ? `Color: ${item.color}` : ''}
                        </p>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-medium">{item.quantity}</td>
                    <td className="py-3.5 px-4 text-right font-mono">₹{item.price.toFixed(2)}</td>
                    <td className="py-3.5 pl-4 text-right font-mono font-bold text-slate-900">₹{(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Summary */}
          <div className="flex justify-end pt-4 border-t border-slate-200">
            <div className="w-full max-w-xs space-y-2 text-sm text-slate-600 font-medium">
              <div className="flex justify-between">
                <span className="text-slate-500 font-mono">Subtotal</span>
                <span className="font-mono text-slate-900">₹{subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span className="font-mono">Discount</span>
                  <span className="font-mono">-₹{discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500 font-mono">Shipping</span>
                <span className="font-mono text-slate-900">{shipping > 0 ? `₹${shipping.toFixed(2)}` : 'FREE'}</span>
              </div>
              <div className="flex justify-between pt-3 border-t-2 border-slate-900 text-slate-900 text-base font-bold font-mono">
                <span>Total Amount</span>
                <span>₹{order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Clean Minimal Footer & Right Bottom Authentic Ink Stamp */}
          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center sm:items-end gap-4 relative">
            <div className="text-center sm:text-left space-y-1 max-w-md">
              <p className="text-xs font-semibold text-slate-700">Thank you for shopping with OKTOPUS CLOTHING!</p>
              <p className="text-[11px] text-slate-400 font-mono">
                Customer Support: oktopusclothing.business@gmail.com
              </p>
              <p className="text-[10px] text-slate-400 font-mono tracking-widest uppercase pt-1">
                OKTOPUS CLOTHING — A Unit of BASKEY Studio (Government of India Registered MSME)
              </p>
            </div>

            {/* Right Bottom Authentic Ink Stamp Container */}
            <div className="sm:absolute sm:right-0 sm:-bottom-4 sm:top-auto z-10 pointer-events-none">
              <VerifiedStamp />
            </div>
          </div>
        </div>

        {/* Graphical Multi-Color Wave Element (Includes Exact Print Styling) */}
        <div
          className="w-full overflow-hidden leading-none print:block"
          style={{
            WebkitPrintColorAdjust: 'exact',
            printColorAdjust: 'exact'
          }}
        >
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-12 block">
            <defs>
              <linearGradient id="invoiceWaveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="30%" stopColor="#ef4444" />
                <stop offset="65%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>
            <path
              d="M0,0 C150,90 350,-40 500,45 C650,130 900,10 1200,40 L1200,120 L0,120 Z"
              fill="url(#invoiceWaveGradient)"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};
