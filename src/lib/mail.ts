
import { Resend } from 'resend';
import { OrderConfirmationEmail } from '@/emails/order-confirmation';
import { OrderStatusUpdateEmail } from '@/emails/order-status-update';

const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = 'onboarding@resend.dev'; // Replace with your verified sending email

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
      subject: `VogueVerse Order Confirmation #${orderId.slice(-6)}`,
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
            subject: `Your VogueVerse Order #${orderId.slice(-6)} has been ${orderStatus}`,
            react: OrderStatusUpdateEmail({ orderId, orderStatus, userName })
        });
         console.log(`Order status update email sent to ${to}`);
    } catch (error) {
        console.error('Error sending order status update email:', error);
    }
}
