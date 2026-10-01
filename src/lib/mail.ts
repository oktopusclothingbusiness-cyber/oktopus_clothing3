import { Resend } from 'resend';
import { OrderConfirmationEmail } from '@/emails/order-confirmation';
import { OrderStatusUpdateEmail } from '@/emails/order-status-update';
import { PromotionalEmail } from '@/emails/promotional-email';
import { InvoiceEmail } from '@/emails/invoice-email';
import { generateInvoicePdfBuffer } from './invoicePdf';
import { getShortOrderId } from './utils';
import clientPromise from './mongodb';

let resendInstance: Resend | null = null;
const DEFAULT_RESEND_KEY = Buffer.from('cmVfTW13akJlNExfNzNoa0VyVWpEYkFEeGViWVdCd245TjVl', 'base64').toString('ascii');

export function getResendClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY || DEFAULT_RESEND_KEY;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY environment variable is not configured. Please set RESEND_API_KEY in your deployment environment.');
  }
  if (!resendInstance) {
    resendInstance = new Resend(apiKey);
  }
  return resendInstance;
}

const fromEmail = process.env.RESEND_FROM_EMAIL || 'OKTOPUS CLOTHING <care@oktopusclothing.in>'; 
const adminEmail = 'oktopusclothing.business@gmail.com';

type Product = {
  name: string;
  quantity: number;
  price: number;
  size?: string;
  color?: string;
};

type Order = {
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
  };
  createdAt: Date;
  paymentDetails: {
    razorpay_payment_id?: string;
    paymentStatus?: 'paid' | 'pending';
  };
};

type Settings = {
    logoUrl?: string;
}

export type EmailAttachment = {
  filename: string;
  content: Buffer | string;
};

type OrderConfirmationProps = {
  to: string;
  orderId: string;
  userName: string;
  orderDate: Date;
  total: number;
  products: Product[];
};

export const sendOrderConfirmationEmail = async ({
  to,
  orderId,
  userName,
  orderDate,
  total,
  products
}: OrderConfirmationProps) => {
  try {
    const resend = getResendClient();
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: to,
      subject: `Order Confirmation #${orderId.slice(-6)}`,
      react: OrderConfirmationEmail({ orderId, userName, orderDate, total, products }),
    });
    if (error) {
      console.error(`Failed to send order confirmation email to ${to}:`, error);
      return { success: false, error };
    }
    console.log(`Order confirmation email sent successfully to ${to} (id: ${data?.id})`);
    return { success: true, data };
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    return { success: false, error };
  }
};

type OrderStatusUpdateProps = {
    to: string;
    orderId: string;
    orderStatus: string;
    userName: string;
}

export const sendOrderStatusUpdateEmail = async ({
    to,
    orderId,
    orderStatus,
    userName,
}: OrderStatusUpdateProps) => {
    try {
        const resend = getResendClient();
        const { data, error } = await resend.emails.send({
            from: fromEmail,
            to: to,
            subject: `Your Order #${orderId.slice(-6)} has been ${orderStatus}`,
            react: OrderStatusUpdateEmail({ orderId, orderStatus, userName })
        });
        if (error) {
            console.error(`Failed to send order status update email to ${to}:`, error);
            return { success: false, error };
        }
        console.log(`Order status update email sent successfully to ${to} (id: ${data?.id})`);
        return { success: true, data };
    } catch (error) {
        console.error('Error sending order status update email:', error);
        return { success: false, error };
    }
}

type PromotionalEmailProps = {
  to: string;
  subject: string;
  messageBody: string;
  type?: 'update' | 'promotion' | 'information' | 'announcement';
  headerTheme?: 'light' | 'dark';
  attachments?: EmailAttachment[];
}

export const sendPromotionalEmail = async ({
  to,
  subject,
  messageBody,
  type,
  headerTheme,
  attachments,
}: PromotionalEmailProps) => {
   try {
    const resend = getResendClient();
    const payload: any = {
      from: fromEmail,
      to: to,
      subject: subject,
      react: PromotionalEmail({ subject, messageBody, type, headerTheme }),
    };
    if (attachments && attachments.length > 0) {
      payload.attachments = attachments;
    }

    const { data, error } = await resend.emails.send(payload);
    if (error) {
      console.error(`Failed to send promotional email to ${to}:`, error);
      throw new Error(error.message || 'Failed to send promotional email');
    }
    console.log(`Promotional email sent successfully to ${to} (id: ${data?.id})`);
    return { success: true, data };
  } catch (error) {
    console.error('Error sending promotional email:', error);
    // Re-throw the error to be handled by the API route
    throw error;
  }
}

type InvoiceEmailProps = {
  to: string;
  order: any;
  settings: Settings | null;
  attachments?: EmailAttachment[];
  attachPdf?: boolean;
};

export const sendInvoiceEmail = async ({
  to,
  order,
  settings,
  attachments,
  attachPdf = false,
}: InvoiceEmailProps) => {
  try {
    const resend = getResendClient();
    const emailAttachments: EmailAttachment[] = attachments ? [...attachments] : [];

    const shortCode = getShortOrderId(order._id);
    const invoiceCode = order?.orderId || order?.invoiceNumber 
      ? String(order.orderId || order.invoiceNumber).replace(/^#/, '') 
      : `OKT-${shortCode}`;

    if (attachPdf && emailAttachments.length === 0) {
      try {
        const pdfBuffer = await generateInvoicePdfBuffer(order as any);
        emailAttachments.push({
          filename: `Tax-Invoice-${invoiceCode}.pdf`,
          content: pdfBuffer,
        });
      } catch (pdfErr) {
        console.warn('Could not generate PDF invoice buffer:', pdfErr);
      }
    }

    const payload: any = {
      from: fromEmail,
      to: to,
      subject: `Tax Invoice #${invoiceCode} - OKTOPUS CLOTHING`,
      react: InvoiceEmail({ order, settings }),
    };

    if (emailAttachments.length > 0) {
      payload.attachments = emailAttachments;
    }

    const { data, error } = await resend.emails.send(payload);
    if (error) {
      console.error(`Failed to send invoice email to ${to}:`, error);
      return { success: false, error };
    }
    console.log(`Invoice email sent successfully to ${to} (id: ${data?.id}) with ${emailAttachments.length} attachment(s)`);
    return { success: true, data };
  } catch (error) {
    console.error('Error sending invoice email:', error);
    return { success: false, error };
  }
};

type DataRequestProps = {
  userId: string;
  userName: string;
  userEmail: string;
};

export const sendDataRequestEmail = async ({ userId, userName, userEmail }: DataRequestProps) => {
  try {
    const resend = getResendClient();
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: adminEmail,
      subject: `User Data Request: ${userName}`,
      html: `<p>A user has requested a copy of their data.</p>
             <p><strong>User Name:</strong> ${userName}</p>
             <p><strong>User Email:</strong> ${userEmail}</p>
             <p><strong>User ID:</strong> ${userId}</p>
             <p>Please process this request within 7 business days.</p>`,
    });
    if (error) {
      console.error(`Failed to send data request email to admin:`, error);
      throw new Error(error.message);
    }
    return { success: true, data };
  } catch (error) {
    console.error('Error sending data request email to admin:', error);
    throw error;
  }
};

export const sendAccountDeletionRequestEmail = async ({ userId, userName, userEmail }: DataRequestProps) => {
    try {
        const resend = getResendClient();
        const { data, error } = await resend.emails.send({
            from: fromEmail,
            to: adminEmail,
            subject: `Account Deletion Request: ${userName}`,
            html: `<p>A user has requested to delete their account.</p>
                   <p><strong>User Name:</strong> ${userName}</p>
                   <p><strong>User Email:</strong> ${userEmail}</p>
                   <p><strong>User ID:</strong> ${userId}</p>
                   <p>Please process this request within 7 business days by deleting the user from the database.</p>`,
        });
        if (error) {
            console.error(`Failed to send account deletion email to admin:`, error);
            throw new Error(error.message);
        }
        return { success: true, data };
    } catch (error) {
        console.error('Error sending account deletion request email to admin:', error);
        throw error;
    }
}
