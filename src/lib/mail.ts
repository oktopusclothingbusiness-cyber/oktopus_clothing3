
import { Resend } from 'resend';
import { OrderConfirmationEmail } from '@/emails/order-confirmation';
import { OrderStatusUpdateEmail } from '@/emails/order-status-update';
import { PromotionalEmail } from '@/emails/promotional-email';
import { InvoiceEmail } from '@/emails/invoice-email';
import clientPromise from './mongodb';
import { CollectibleEmail } from '@/emails/collectible-email';

const resend = new Resend("re_hUGiai9e_8FKbk9HRaRFEpXHgnS755XGr");
const fromEmail = 'OKTOPUS CLOTHING <onboarding@resend.dev>'; 
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
    await resend.emails.send({
      from: fromEmail,
      to: to,
      subject: `Order Confirmation #${orderId.slice(-6)}`,
      react: OrderConfirmationEmail({ orderId, userName, orderDate, total, products }),
    });
    console.log(`Order confirmation email sent to ${to}`);
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
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
        await resend.emails.send({
            from: fromEmail,
            to: to,
            subject: `Your Order #${orderId.slice(-6)} has been ${orderStatus}`,
            react: OrderStatusUpdateEmail({ orderId, orderStatus, userName })
        });
         console.log(`Order status update email sent to ${to}`);
    } catch (error) {
        console.error('Error sending order status update email:', error);
    }
}

type PromotionalEmailProps = {
  to: string;
  subject: string;
  messageBody: string;
}

export const sendPromotionalEmail = async ({
  to,
  subject,
  messageBody,
}: PromotionalEmailProps) => {
   try {
    await resend.emails.send({
      from: fromEmail,
      to: to,
      subject: subject,
      react: PromotionalEmail({ subject, messageBody }),
    });
    console.log(`Promotional email sent to ${to}`);
  } catch (error) {
    console.error('Error sending promotional email:', error);
    // Re-throw the error to be handled by the API route
    throw error;
  }
}

type InvoiceEmailProps = {
  to: string;
  order: Order;
  settings: Settings | null;
};

export const sendInvoiceEmail = async ({
  to,
  order,
  settings,
}: InvoiceEmailProps) => {
  try {
    await resend.emails.send({
      from: fromEmail,
      to: to,
      subject: `Invoice for your Order #${order._id.slice(-6)}`,
      react: InvoiceEmail({ order, settings }),
    });
    console.log(`Invoice email sent to ${to}`);
  } catch (error) {
    console.error('Error sending invoice email:', error);
  }
};

type CollectibleEmailProps = {
  to: string;
  orderId: string;
  userName: string;
  collectibleUrl: string;
};

export const sendCollectibleEmail = async ({
  to,
  orderId,
  userName,
  collectibleUrl,
}: CollectibleEmailProps) => {
  try {
    await resend.emails.send({
      from: fromEmail,
      to: to,
      subject: `Your Exclusive Collectible for Order #${orderId.slice(-6)} is Here!`,
      react: CollectibleEmail({ orderId, userName, collectibleUrl }),
    });
    console.log(`Collectible email sent to ${to}`);
  } catch (error) {
    console.error('Error sending collectible email:', error);
  }
};


type DataRequestProps = {
  userId: string;
  userName: string;
  userEmail: string;
};

export const sendDataRequestEmail = async ({ userId, userName, userEmail }: DataRequestProps) => {
  try {
    await resend.emails.send({
      from: fromEmail,
      to: adminEmail,
      subject: `User Data Request: ${userName}`,
      html: `<p>A user has requested a copy of their data.</p>
             <p><strong>User Name:</strong> ${userName}</p>
             <p><strong>User Email:</strong> ${userEmail}</p>
             <p><strong>User ID:</strong> ${userId}</p>
             <p>Please process this request within 7 business days.</p>`,
    });
  } catch (error) {
    console.error('Error sending data request email to admin:', error);
    throw error;
  }
};

export const sendAccountDeletionRequestEmail = async ({ userId, userName, userEmail }: DataRequestProps) => {
    try {
        await resend.emails.send({
            from: fromEmail,
            to: adminEmail,
            subject: `Account Deletion Request: ${userName}`,
            html: `<p>A user has requested to delete their account.</p>
                   <p><strong>User Name:</strong> ${userName}</p>
                   <p><strong>User Email:</strong> ${userEmail}</p>
                   <p><strong>User ID:</strong> ${userId}</p>
                   <p>Please process this request within 7 business days by deleting the user from the database.</p>`,
        });
    } catch (error) {
        console.error('Error sending account deletion request email to admin:', error);
        throw error;
    }
}
