
import { Resend } from 'resend';
import { OrderConfirmationEmail } from '@/emails/order-confirmation';
import { OrderStatusUpdateEmail } from '@/emails/order-status-update';
import { PromotionalEmail } from '@/emails/promotional-email';
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
