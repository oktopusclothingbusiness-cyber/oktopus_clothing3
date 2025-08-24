
import { Resend } from 'resend';
import { OrderConfirmationEmail } from '@/emails/order-confirmation';
import { OrderStatusUpdateEmail } from '@/emails/order-status-update';
import clientPromise from './mongodb';

const resend = new Resend("re_hUGiai9e_8FKbk9HRaRFEpXHgnS755XGr");
const fromEmail = 'OKTOPUS CLOTHING <onboarding@resend.dev>'; 

type Product = {
  name: string;
  quantity: number;
  price: number;
};

type OrderConfirmationProps = {
  to: string;
  orderId: string;
  userName: string;
  orderDate: Date;
  total: number;
  products: Product[];
};

const getLogoUrl = async () => {
    try {
        const client = await clientPromise;
        const db = client.db();
        const settings = await db.collection('settings').findOne({ _id: 'global' });
        return settings?.logoUrl || "https://i.ibb.co/GfTs981G/okto-new-logo-white.png";
    } catch (error) {
        console.error("Failed to fetch logo for email:", error);
        return "https://i.ibb.co/GfTs981G/okto-new-logo-white.png";
    }
}

export const sendOrderConfirmationEmail = async ({
  to,
  orderId,
  userName,
  orderDate,
  total,
  products
}: OrderConfirmationProps) => {
  try {
    const logoUrl = await getLogoUrl();
    await resend.emails.send({
      from: fromEmail,
      to: to,
      subject: `Order Confirmation #${orderId.slice(-6)}`,
      react: OrderConfirmationEmail({ orderId, userName, orderDate, total, products, logoUrl }),
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
        const logoUrl = await getLogoUrl();
        await resend.emails.send({
            from: fromEmail,
            to: to,
            subject: `Your Order #${orderId.slice(-6)} has been ${orderStatus}`,
            react: OrderStatusUpdateEmail({ orderId, orderStatus, userName, logoUrl })
        });
         console.log(`Order status update email sent to ${to}`);
    } catch (error) {
        console.error('Error sending order status update email:', error);
    }
}
