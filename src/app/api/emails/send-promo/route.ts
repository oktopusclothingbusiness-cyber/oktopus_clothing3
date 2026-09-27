
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { sendPromotionalEmail, EmailAttachment } from '@/lib/mail';
import { generateInvoicePdfBuffer } from '@/lib/invoicePdf';
import { getShortOrderId } from '@/lib/utils';
import { ObjectId } from 'mongodb';

export async function POST(request: Request) {
  try {
    const { userId, subject, messageBody, attachments, orderId, type, headerTheme } = await request.json();

    if (!subject || !messageBody) {
      return NextResponse.json({ message: 'Subject and message body are required.' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    const usersCollection = db.collection('users');
    let recipients: any[] = [];

    if (userId === 'all') {
      recipients = await usersCollection.find({}, { projection: { email: 1 } }).toArray();
    } else if (ObjectId.isValid(userId)) {
      const user = await usersCollection.findOne({ _id: new ObjectId(userId) }, { projection: { email: 1 } });
      if (user) {
        recipients.push(user);
      }
    }

    if (recipients.length === 0) {
      return NextResponse.json({ message: 'No valid recipients found.' }, { status: 404 });
    }

    // Process attachments
    const processedAttachments: EmailAttachment[] = [];

    // 1. Process uploaded file attachments (base64)
    if (Array.isArray(attachments) && attachments.length > 0) {
      for (const att of attachments) {
        if (att.filename && att.content) {
          const rawContent = typeof att.content === 'string' && att.content.includes('base64,')
            ? att.content.split('base64,')[1]
            : att.content;
          const contentBuffer = typeof rawContent === 'string'
            ? Buffer.from(rawContent, 'base64')
            : Buffer.from(rawContent);

          processedAttachments.push({
            filename: att.filename,
            content: contentBuffer,
          });
        }
      }
    }

    // 2. If an orderId is provided to attach its official invoice PDF
    if (orderId && ObjectId.isValid(orderId)) {
      try {
        const order = await db.collection('orders').findOne({ _id: new ObjectId(orderId) });
        if (order) {
          const pdfBuffer = await generateInvoicePdfBuffer(order as any);
          const shortCode = getShortOrderId(order._id.toString());
          processedAttachments.push({
            filename: `Invoice-OKT-${shortCode}.pdf`,
            content: pdfBuffer,
          });
        }
      } catch (pdfErr) {
        console.warn('Failed to generate attached order invoice PDF:', pdfErr);
      }
    }

    // Dispatch emails to recipients
    for (const recipient of recipients) {
      if (recipient.email) {
        await sendPromotionalEmail({
          to: recipient.email,
          subject: subject,
          messageBody: messageBody,
          type: type || 'information',
          headerTheme: headerTheme || 'light',
          attachments: processedAttachments.length > 0 ? processedAttachments : undefined,
        });
      }
    }

    const message = `Email sent successfully to ${recipients.length} recipient(s)${
      processedAttachments.length > 0 ? ` with ${processedAttachments.length} attachment(s)` : ''
    }.`;
    return NextResponse.json({ message: message }, { status: 200 });

  } catch (error) {
    console.error('Failed to send promotional email(s):', error);
    return NextResponse.json({ message: 'An internal server error occurred while sending emails.' }, { status: 500 });
  }
}
