import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { authenticateRequest } from '@/lib/auth';
import { getShortOrderId } from '@/lib/utils';
import { format } from 'date-fns';

// GET /api/mobile/orders/[id]/invoice/pdf - Generates print/PDF HTML document for mobile app Expo Print / FileSystem download
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = authenticateRequest(request, { allowAppSecret: true });
    if (!auth.authenticated) {
      return NextResponse.json({ message: auth.error || 'Unauthorized' }, { status: auth.statusCode || 401 });
    }

    const { id } = await params;
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid or missing Order ID.' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const order = await db.collection('orders').findOne({ _id: new ObjectId(id) });
    if (!order) {
      return NextResponse.json({ message: 'Order not found.' }, { status: 404 });
    }

    const settings = await db.collection('settings').findOne({ _id: 'global' as any });
    const shortCode = getShortOrderId(id);
    const invoiceNum = `OKT-${shortCode}`;
    const formattedDate = order.createdAt ? format(new Date(order.createdAt), 'MMMM dd, yyyy') : 'N/A';

    const subtotal = order.subtotal || (order.products || []).reduce((acc: number, p: any) => acc + p.price * p.quantity, 0);
    const shipping = order.shipping || 0;
    const discount = order.discount || 0;
    const total = order.total || 0;

    const host = request.headers.get('host') || 'localhost:9002';
    const protocol = request.headers.get('x-forwarded-proto') || 'https';
    const baseUrl = `${protocol}://${host}`;
    const logoUrl = settings?.logoUrl || `${baseUrl}/oktopus-logo.png`;
    const mascotUrl = `${baseUrl}/adaptive-icon.png`;

    const productsHtml = (order.products || []).map((item: any) => `
      <tr style="border-bottom: 1px solid #f1f5f9;">
        <td style="padding: 14px 16px;">
          <p style="font-weight: 600; color: #0f172a; margin: 0; font-size: 14px;">${item.name || 'Apparel Item'}</p>
          ${item.size || item.color ? `<p style="font-size: 12px; color: #64748b; margin: 4px 0 0 0;">${item.size ? `Size: ${item.size}` : ''}${item.size && item.color ? ' | ' : ''}${item.color ? `Color: ${item.color}` : ''}</p>` : ''}
        </td>
        <td style="padding: 14px 16px; text-align: center; font-family: monospace; font-size: 14px; font-weight: 500; color: #334155;">${item.quantity}</td>
        <td style="padding: 14px 16px; text-align: right; font-family: monospace; font-size: 14px; color: #334155;">₹${(item.price || 0).toFixed(2)}</td>
        <td style="padding: 14px 16px; text-align: right; font-family: monospace; font-size: 14px; font-weight: 700; color: #0f172a;">₹${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</td>
      </tr>
    `).join('');

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tax Invoice #${invoiceNum}</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 24px;
      background-color: #f8fafc;
      color: #0f172a;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    @page { margin: 8mm; size: auto; }
    .invoice-card {
      max-width: 800px;
      margin: 0 auto;
      background: #ffffff;
      border: 2px solid #cbd5e1;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .content { padding: 40px; }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding-bottom: 24px;
      border-bottom: 1px solid #e2e8f0;
    }
    .logo-container {
      width: 160px;
      text-align: center;
    }
    .logo-img {
      width: 160px;
      height: 50px;
      object-fit: contain;
      display: block;
      margin: 0 auto;
    }
    .baskey-label {
      width: 160px;
      font-size: 9.5px;
      font-weight: 800;
      letter-spacing: 0.14em;
      color: #d97706;
      text-transform: uppercase;
      text-align: center;
      margin: 6px 0 2px 0;
    }
    .location-label {
      width: 160px;
      font-size: 10.5px;
      color: #94a3b8;
      text-align: center;
      margin: 0;
    }
    .invoice-meta { text-align: right; }
    .invoice-tag { font-size: 11px; font-weight: 700; color: #94a3b8; letter-spacing: 0.1em; text-transform: uppercase; font-family: monospace; }
    .invoice-num { font-size: 22px; font-weight: 700; font-family: monospace; color: #0f172a; margin: 4px 0; }
    .invoice-date { font-size: 12px; color: #64748b; margin: 0; }
    .payment-status { font-size: 12px; font-weight: 600; text-transform: uppercase; margin-top: 6px; }
    .paid { color: #059669; }
    .pending { color: #d97706; }
    
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 32px;
      margin-top: 28px;
    }
    .info-title { font-size: 11px; font-weight: 700; color: #94a3b8; letter-spacing: 0.1em; text-transform: uppercase; font-family: monospace; margin: 0 0 6px 0; }
    .info-name { font-size: 16px; font-weight: 700; color: #0f172a; margin: 0 0 4px 0; }
    .info-text { font-size: 14px; color: #475569; margin: 0; line-height: 1.5; }
    
    .table-container { margin-top: 28px; }
    table { width: 100%; border-collapse: collapse; text-align: left; }
    th { font-size: 11px; font-weight: 700; color: #0f172a; letter-spacing: 0.1em; text-transform: uppercase; font-family: monospace; padding: 12px 16px; border-bottom: 2px solid #0f172a; background: #f8fafc; }

    .summary-section {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-top: 28px;
      padding-top: 16px;
      border-top: 1px solid #e2e8f0;
      position: relative;
    }
    .totals-box { width: 280px; font-size: 14px; color: #475569; font-weight: 500; }
    .total-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-family: monospace; }
    .grand-total { display: flex; justify-content: space-between; padding-top: 12px; border-top: 2px solid #0f172a; font-size: 16px; font-weight: 700; color: #0f172a; font-family: monospace; }

    .stamp-container {
      position: absolute;
      right: 0;
      bottom: -10px;
      width: 130px;
      height: 130px;
      transform: rotate(-12deg);
      pointer-events: none;
      opacity: 0.95;
    }

    .footer {
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid #f1f5f9;
      text-align: center;
    }
    .footer-title { font-size: 12px; font-weight: 600; color: #334155; margin: 0; }
    .footer-sub { font-size: 11px; color: #94a3b8; font-family: monospace; margin: 4px 0 0 0; }
    .footer-credit { font-size: 10px; color: #94a3b8; font-family: monospace; letter-spacing: 0.1em; text-transform: uppercase; margin: 8px 0 0 0; }

    .wave-bar {
      width: 100%;
      height: 48px;
      display: block;
      line-height: 0;
    }
  </style>
</head>
<body>

<div class="invoice-card">
  <div class="content">
    
    <!-- Header -->
    <div class="header">
      <div class="logo-container">
        <img src="${logoUrl}" alt="Oktopus Logo" class="logo-img" />
        <p class="baskey-label">A Unit of BASKEY Studio</p>
        <p class="location-label">Kolkata, West Bengal, India</p>
      </div>

      <div class="invoice-meta">
        <span class="invoice-tag">TAX INVOICE</span>
        <h1 class="invoice-num">#${invoiceNum}</h1>
        <p class="invoice-date">${formattedDate}</p>
        <p class="payment-status ${order.paymentDetails?.paymentStatus === 'paid' ? 'paid' : 'pending'}">
          Payment: ${order.paymentDetails?.paymentStatus === 'paid' ? 'PAID' : 'PENDING'}
        </p>
      </div>
    </div>

    <!-- Info Grid -->
    <div class="info-grid">
      <div>
        <h2 class="info-title">Billed To</h2>
        <p class="info-name">${order.userName || 'Customer'}</p>
        <p class="info-text">${order.shippingAddress?.address || 'N/A'}</p>
        <p class="info-text" style="font-family: monospace; font-size: 12px; margin-top: 4px;">Mobile: ${order.shippingAddress?.mobile || 'N/A'}</p>
      </div>

      <div style="text-align: right;">
        <h2 class="info-title">Order Summary</h2>
        <p class="info-text" style="font-family: monospace;"><span style="color: #94a3b8;">Order ID:</span> #${shortCode}</p>
        ${order.paymentDetails?.razorpay_payment_id ? `<p class="info-text" style="font-family: monospace; font-size: 12px;"><span style="color: #94a3b8;">Payment Ref:</span> ${order.paymentDetails.razorpay_payment_id}</p>` : ''}
        <p class="info-text" style="font-size: 12px;"><span style="color: #94a3b8;">Dispatch Mode:</span> Express Shipping</p>
      </div>
    </div>

    <!-- Items Table -->
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th style="text-align: center;">Qty</th>
            <th style="text-align: right;">Unit Price</th>
            <th style="text-align: right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${productsHtml}
        </tbody>
      </table>
    </div>

    <!-- Summary & Stamp -->
    <div class="summary-section">
      <div style="flex-grow: 1;"></div>

      <div class="totals-box">
        <div class="total-row">
          <span style="color: #64748b;">Subtotal</span>
          <span>₹${subtotal.toFixed(2)}</span>
        </div>
        ${discount > 0 ? `<div class="total-row" style="color: #059669;"><span>Discount</span><span>-₹${discount.toFixed(2)}</span></div>` : ''}
        <div class="total-row">
          <span style="color: #64748b;">Shipping</span>
          <span>${shipping > 0 ? `₹${shipping.toFixed(2)}` : 'FREE'}</span>
        </div>
        <div class="grand-total">
          <span>Total Amount</span>
          <span>₹${total.toFixed(2)}</span>
        </div>
      </div>
    </div>

    <!-- Footer & Official Stamp -->
    <div class="footer" style="position: relative;">
      <p class="footer-title">Thank you for shopping with OKTOPUS CLOTHING!</p>
      <p class="footer-sub">Customer Support: oktopusclothing.business@gmail.com</p>
      <p class="footer-credit">OKTOPUS CLOTHING — A Unit of BASKEY Studio (Government of India Registered MSME)</p>

      <!-- SVG Official Ink Stamp -->
      <div class="stamp-container">
        <svg viewBox="0 0 160 160" style="width: 100%; height: 100%; color: #474e5d;">
          <defs>
            <path id="stampPath" d="M 80, 80 m -57, 0 a 57,57 0 1,1 114,0 a 57,57 0 1,1 -114,0" />
          </defs>
          <circle cx="80" cy="80" r="76" fill="none" stroke="currentColor" stroke-width="2.5" stroke-dasharray="6 3" />
          <circle cx="80" cy="80" r="68" fill="none" stroke="currentColor" stroke-width="1.4" />
          <text fill="currentColor" style="font-weight: 800; font-size: 9.2px; letter-spacing: 0.25em; text-transform: uppercase; font-family: monospace;">
            <textPath href="#stampPath" startOffset="0%">★ OKTOPUS CLOTHING ★ OFFICIAL VERIFIED SEAL</textPath>
          </text>
          <circle cx="80" cy="80" r="45" fill="none" stroke="currentColor" stroke-width="1.5" />
          <circle cx="80" cy="80" r="41" fill="none" stroke="currentColor" stroke-width="0.8" stroke-dasharray="3 2" />
          <image href="${mascotUrl}" x="54" y="54" width="52" height="52" preserveAspectRatio="xMidYMid meet" />
        </svg>
      </div>
    </div>

  </div>

  <!-- Multi-Color Wave -->
  <div class="wave-bar">
    <svg viewBox="0 0 1200 120" preserveAspectRatio="none" style="width: 100%; height: 48px; display: block;">
      <defs>
        <linearGradient id="invWave" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#f59e0b" />
          <stop offset="30%" stop-color="#ef4444" />
          <stop offset="65%" stop-color="#8b5cf6" />
          <stop offset="100%" stop-color="#3b82f6" />
        </linearGradient>
      </defs>
      <path d="M0,0 C150,90 350,-40 500,45 C650,130 900,10 1200,40 L1200,120 L0,120 Z" fill="url(#invWave)" />
    </svg>
  </div>
</div>

</body>
</html>
    `;

    return new Response(htmlContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `inline; filename="OKT-INVOICE-${shortCode}.html"`,
        'Cache-Control': 'public, max-age=3600',
      },
    });

  } catch (error) {
    console.error('Failed to generate mobile PDF/HTML invoice:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
