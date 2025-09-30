
'use client';

import { format } from 'date-fns';
import Image from 'next/image';

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
}

type InvoiceProps = {
    order: Order;
    settings: Settings | null;
}

export const Invoice = ({ order, settings }: InvoiceProps) => {

    // These values may not exist on old orders, so we calculate them
    const subtotal = order.subtotal || order.products.reduce((acc, p) => acc + (p.price * p.quantity), 0);
    const shipping = order.shipping || 0;
    const discount = order.discount || 0;


  return (
    <div className="bg-white p-8 md:p-12 text-gray-800 font-sans">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-12">
          <div>
            {settings?.logoUrl && (
              <Image src={settings.logoUrl} alt="Oktopus Logo" width={180} height={60} className="object-contain" />
            )}
            <p className="text-sm text-gray-500 mt-2">Kolkata, West Bengal, India</p>
          </div>
          <div className="text-right">
            <h1 className="text-4xl font-bold text-gray-800">INVOICE</h1>
            <p className="text-gray-500">#{order._id.slice(-6).toUpperCase()}</p>
          </div>
        </div>

        {/* Billed To and Order Info */}
        <div className="grid grid-cols-2 gap-8 mb-12">
          <div>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Billed To</h2>
            <p className="font-bold">{order.userName}</p>
            <p>{order.shippingAddress.address}</p>
            <p>{order.shippingAddress.mobile}</p>
          </div>
          <div className="text-right">
             <div className="mb-4">
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Invoice Date</p>
                <p className="font-medium">{format(new Date(order.createdAt), 'MMMM dd, yyyy')}</p>
             </div>
             <div>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Payment Status</p>
                <p className="font-medium capitalize">{order.paymentDetails?.paymentStatus}</p>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <table className="w-full mb-12">
          <thead>
            <tr className="border-b-2 border-gray-200 text-left text-sm text-gray-500 uppercase">
              <th className="py-2 pr-4 font-semibold">Description</th>
              <th className="py-2 px-4 font-semibold text-center">Qty</th>
              <th className="py-2 px-4 font-semibold text-right">Unit Price</th>
              <th className="py-2 pl-4 font-semibold text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {order.products.map((item, index) => (
              <tr key={index} className="border-b border-gray-100">
                <td className="py-4 pr-4">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-500">
                        Size: {item.size}, Color: {item.color}
                    </p>
                </td>
                <td className="py-4 px-4 text-center">{item.quantity}</td>
                <td className="py-4 px-4 text-right">₹{item.price.toFixed(2)}</td>
                <td className="py-4 pl-4 text-right font-medium">₹{(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end mb-12">
            <div className="w-full max-w-sm">
                <div className="flex justify-between py-2">
                    <span className="text-gray-500">Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                     <div className="flex justify-between py-2">
                        <span className="text-gray-500">Discount</span>
                        <span>-₹{discount.toFixed(2)}</span>
                    </div>
                )}
                 <div className="flex justify-between py-2">
                    <span className="text-gray-500">Shipping</span>
                    <span>₹{shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-4 border-t-2 border-gray-200 mt-2">
                    <span className="font-bold text-lg">Total</span>
                    <span className="font-bold text-lg">₹{order.total.toFixed(2)}</span>
                </div>
            </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm">
          <p>Thank you for your business!</p>
          <p>If you have any questions, please contact us at oktopusclothing.business@gmail.com</p>
        </div>
      </div>
    </div>
  );
};
