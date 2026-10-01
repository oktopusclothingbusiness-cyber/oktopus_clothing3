import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import { format } from 'date-fns';
import { getShortOrderId } from './utils';

type Product = {
  name: string;
  quantity: number;
  price: number;
  size?: string;
  color?: string;
};

type OrderForInvoice = {
  _id: string;
  userName: string;
  products: Product[];
  total: number;
  shipping: number;
  discount: number;
  subtotal: number;
  shippingAddress: {
    address: string;
    mobile: string;
    instructions?: string;
  };
  createdAt: Date | string;
  paymentDetails?: {
    razorpay_payment_id?: string;
    paymentStatus?: 'paid' | 'pending';
    paymentMethod?: string;
    transactionRef?: string;
  };
  invoiceNumber?: string;
  orderId?: string;
  dispatchMode?: string;
};

/**
 * Generates an official Tax Invoice PDF adhering strictly to the
 * approved Oktopus Clothing Tax Invoice template (src/components/invoice.tsx).
 */
export async function generateInvoicePdfBuffer(order: OrderForInvoice): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const shortCode = getShortOrderId(order._id);
      const displayOrderId = order.orderId || order.invoiceNumber || `OKT-${shortCode}`;
      const cleanOrderId = String(displayOrderId).replace(/^#/, '');

      const doc = new PDFDocument({
        margin: 36,
        size: 'A4',
        info: {
          Title: `Tax Invoice #${cleanOrderId}`,
          Author: 'OKTOPUS CLOTHING',
          Subject: 'Official Tax Invoice',
        },
      });

      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', (err) => reject(err));

      const invoiceDate = order.createdAt ? format(new Date(order.createdAt), 'MMMM dd, yyyy') : 'N/A';
      const isPaid = order.paymentDetails?.paymentStatus === 'paid';

      const cardX = 36;
      const cardY = 36;
      const cardW = 523;
      const cardH = 770;

      // 1. Approved Outer Card Container with 2px border and rounded corners
      doc.roundedRect(cardX, cardY, cardW, cardH, 12).lineWidth(2).strokeColor('#cbd5e1').fillColor('#ffffff').fillAndStroke();

      // 2. Header Section
      const leftColX = cardX + 24;
      const rightColX = cardX + cardW - 24;
      let headerY = cardY + 24;

      // Left Header: Brand Logo & MSME Parent Company Details
      const logoPath = path.join(process.cwd(), 'public', 'logo2b.png');
      if (fs.existsSync(logoPath)) {
        try {
          doc.image(logoPath, leftColX, headerY, { width: 140 });
        } catch {
          doc.fillColor('#0f172a').fontSize(16).font('Helvetica-Bold').text('OKTOPUS CLOTHING', leftColX, headerY);
        }
      } else {
        doc.fillColor('#0f172a').fontSize(16).font('Helvetica-Bold').text('OKTOPUS CLOTHING', leftColX, headerY);
      }

      doc.fillColor('#d97706').fontSize(8.5).font('Helvetica-Bold').text('A UNIT OF BASKEY STUDIO', leftColX, headerY + 34);
      doc.fillColor('#94a3b8').fontSize(9).font('Helvetica').text('Kolkata, West Bengal, India', leftColX, headerY + 46);

      // Right Header: Tax Invoice Meta
      doc.fillColor('#94a3b8').fontSize(10).font('Helvetica-Bold').text('TAX INVOICE', cardX, headerY, { align: 'right', width: cardW - 24 });
      doc.fillColor('#0f172a').fontSize(18).font('Helvetica-Bold').text(`#${cleanOrderId}`, cardX, headerY + 14, { align: 'right', width: cardW - 24 });
      doc.fillColor('#64748b').fontSize(10).font('Helvetica').text(invoiceDate, cardX, headerY + 36, { align: 'right', width: cardW - 24 });
      
      doc.font('Helvetica-Bold').fontSize(10);
      doc.fillColor('#64748b').text('Payment: ', cardX, headerY + 52, { align: 'right', width: cardW - 65 });
      doc.fillColor(isPaid ? '#059669' : '#d97706').text(isPaid ? 'PAID' : 'PENDING', cardX, headerY + 52, { align: 'right', width: cardW - 24 });

      // Header Divider Line
      let currentY = headerY + 74;
      doc.moveTo(leftColX, currentY).lineTo(rightColX, currentY).lineWidth(1).strokeColor('#e2e8f0').stroke();

      // 3. Customer Information & Order Summary (2-Column Grid matching web version)
      currentY += 16;
      doc.fillColor('#94a3b8').fontSize(9.5).font('Helvetica-Bold').text('BILLED TO', leftColX, currentY);
      doc.text('ORDER SUMMARY', 320, currentY);

      currentY += 14;
      doc.fillColor('#0f172a').fontSize(12).font('Helvetica-Bold').text(order.userName || 'Customer', leftColX, currentY);
      doc.fillColor('#0f172a').fontSize(10).font('Helvetica-Bold');
      doc.text(`Order ID: #${cleanOrderId}`, 320, currentY);

      currentY += 14;
      const cleanAddress = (order.shippingAddress?.address || 'Address not specified').replace(/\n/g, ', ');
      doc.fillColor('#334155').fontSize(9.5).font('Helvetica');
      doc.text(cleanAddress, leftColX, currentY, { width: 230 });
      const payRef = order.paymentDetails?.transactionRef || order.paymentDetails?.razorpay_payment_id || (order.paymentDetails?.paymentMethod ? `Mode: ${order.paymentDetails.paymentMethod.toUpperCase()}` : 'Direct Payment');
      doc.text(`Payment Ref: ${payRef}`, 320, currentY);

      currentY += 24;
      doc.text(`Mobile: ${order.shippingAddress?.mobile || 'N/A'}`, leftColX, currentY);
      doc.text(`Dispatch Mode: ${order.dispatchMode || 'Express Shipping'}`, 320, currentY);

      // 4. Itemized Product Table
      currentY += 26;
      const tableX = leftColX;
      const tableW = cardW - 48;
      const tableH = 22;

      // Table Header Background (#f8fafc with 2px bottom border #0f172a)
      doc.rect(tableX, currentY, tableW, tableH).fillColor('#f8fafc').fill();
      doc.moveTo(tableX, currentY + tableH).lineTo(tableX + tableW, currentY + tableH).lineWidth(2).strokeColor('#0f172a').stroke();

      doc.fillColor('#0f172a').fontSize(9).font('Helvetica-Bold');
      doc.text('DESCRIPTION', tableX + 8, currentY + 6);
      doc.text('QTY', tableX + 270, currentY + 6, { width: 35, align: 'center' });
      doc.text('UNIT PRICE', tableX + 325, currentY + 6, { width: 65, align: 'right' });
      doc.text('AMOUNT', tableX + 400, currentY + 6, { width: 67, align: 'right' });

      currentY += tableH + 8;
      const items = Array.isArray(order.products) ? order.products : [];

      items.forEach((item) => {
        const itemTotal = (item.price || 0) * (item.quantity || 1);
        doc.fillColor('#0f172a').fontSize(9.5).font('Helvetica-Bold').text(item.name || 'Apparel Item', tableX + 8, currentY, { width: 250 });
        
        const variantParts = [item.size ? `Size: ${item.size}` : '', item.color ? `Color: ${item.color}` : ''].filter(Boolean);
        if (variantParts.length > 0) {
          doc.fillColor('#64748b').fontSize(8).font('Helvetica').text(variantParts.join(' | '), tableX + 8, currentY + 12);
        }

        doc.fillColor('#334155').fontSize(9).font('Helvetica');
        doc.text(String(item.quantity || 1), tableX + 270, currentY + 3, { width: 35, align: 'center' });
        doc.text(`INR ${(item.price || 0).toFixed(2)}`, tableX + 325, currentY + 3, { width: 65, align: 'right' });
        doc.fillColor('#0f172a').font('Helvetica-Bold').text(`INR ${itemTotal.toFixed(2)}`, tableX + 400, currentY + 3, { width: 67, align: 'right' });

        currentY += 26;
        doc.moveTo(tableX, currentY).lineTo(tableX + tableW, currentY).lineWidth(0.5).strokeColor('#f1f5f9').stroke();
        currentY += 6;
      });

      // 5. Financial Summary Section
      currentY = Math.max(currentY + 6, cardY + 410);
      const subtotal = order.subtotal || items.reduce((acc, p) => acc + (p.price || 0) * (p.quantity || 1), 0);
      const shipping = order.shipping || 0;
      const discount = order.discount || 0;
      const total = order.total || subtotal + shipping - discount;

      const sumLabelX = 320;
      const sumValX = cardX + cardW - 120;
      const sumValW = 96;

      doc.fillColor('#64748b').fontSize(9.5).font('Helvetica');
      doc.text('Subtotal', sumLabelX, currentY);
      doc.fillColor('#0f172a').text(`INR ${subtotal.toFixed(2)}`, sumValX, currentY, { width: sumValW, align: 'right' });

      if (discount > 0) {
        currentY += 16;
        doc.fillColor('#059669').text('Discount', sumLabelX, currentY);
        doc.text(`-INR ${discount.toFixed(2)}`, sumValX, currentY, { width: sumValW, align: 'right' });
      }

      currentY += 16;
      doc.fillColor('#64748b').text('Shipping', sumLabelX, currentY);
      doc.fillColor('#0f172a').text(shipping > 0 ? `INR ${shipping.toFixed(2)}` : 'FREE', sumValX, currentY, { width: sumValW, align: 'right' });

      currentY += 18;
      doc.moveTo(sumLabelX, currentY).lineTo(rightColX, currentY).lineWidth(2).strokeColor('#0f172a').stroke();
      currentY += 8;

      doc.fillColor('#0f172a').fontSize(11).font('Helvetica-Bold');
      doc.text('Total Amount', sumLabelX, currentY);
      doc.text(`INR ${total.toFixed(2)}`, sumValX, currentY, { width: sumValW, align: 'right' });

      // 6. Footer Section & Official Stamp Graphic
      const footerY = cardY + cardH - 125;
      doc.moveTo(leftColX, footerY).lineTo(rightColX, footerY).lineWidth(1).strokeColor('#f1f5f9').stroke();

      // Footer Text on Left
      doc.fillColor('#334155').fontSize(10).font('Helvetica-Bold').text('Thank you for shopping with OKTOPUS CLOTHING!', leftColX, footerY + 12);
      doc.fillColor('#64748b').fontSize(8.5).font('Helvetica').text('Customer Support: oktopusclothing.business@gmail.com', leftColX, footerY + 28);
      doc.fillColor('#94a3b8').fontSize(7.5).font('Helvetica').text('OKTOPUS CLOTHING — A Unit of BASKEY Studio (Government of India Registered MSME)', leftColX, footerY + 42);

      // Verified Circular Ink Stamp Graphic on Right (#474e5d color)
      const stampCenterX = cardX + cardW - 75;
      const stampCenterY = footerY + 40;
      doc.save();
      doc.circle(stampCenterX, stampCenterY, 36).lineWidth(1.5).dash(5, { space: 3 }).strokeColor('#474e5d').stroke();
      doc.circle(stampCenterX, stampCenterY, 32).lineWidth(1).undash().strokeColor('#474e5d').stroke();
      doc.circle(stampCenterX, stampCenterY, 20).lineWidth(0.8).strokeColor('#474e5d').stroke();
      
      doc.fillColor('#474e5d').fontSize(5.5).font('Helvetica-Bold');
      doc.text('★ OKTOPUS CLOTHING ★', stampCenterX - 32, stampCenterY - 26, { width: 64, align: 'center' });
      doc.text('OFFICIAL VERIFIED', stampCenterX - 30, stampCenterY - 3, { width: 60, align: 'center' });
      doc.text('TAX INVOICE SEAL', stampCenterX - 30, stampCenterY + 4, { width: 60, align: 'center' });
      doc.restore();

      // 7. Multi-Color Wave Element at the Bottom (Matches SVG Stops #f59e0b, #ef4444, #8b5cf6, #3b82f6)
      const waveY = cardY + cardH - 28;
      const waveW = cardW;
      const wavePartW = waveW / 4;

      doc.rect(cardX, waveY, wavePartW, 28).fill('#f59e0b');
      doc.rect(cardX + wavePartW, waveY, wavePartW, 28).fill('#ef4444');
      doc.rect(cardX + wavePartW * 2, waveY, wavePartW, 28).fill('#8b5cf6');
      doc.rect(cardX + wavePartW * 3, waveY, wavePartW, 28).fill('#3b82f6');

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
