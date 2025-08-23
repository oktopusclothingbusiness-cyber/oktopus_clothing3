
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
  Section,
  Row,
  Column,
  Button,
  Img,
} from "@react-email/components";

type OrderStatusUpdateEmailProps = {
  orderId: string;
  userName: string;
  orderStatus: string;
  logoUrl?: string;
};

const statusDescriptions: Record<string, string> = {
    accepted: "We're happy to let you know that your order has been accepted and is now being processed.",
    packed: "Good news! Your order has been packed and is ready for shipment.",
    shipped: "Your order is on its way! You can track its progress using the button below.",
    delivered: "Your order has been delivered! We hope you enjoy your new items.",
    paid: "We've received your payment and your order is confirmed. We'll notify you when it ships.",
    rejected: "Unfortunately, we were unable to process your order. Please contact support for more details.",
    pending: "Your order is currently pending. We will notify you once it is accepted.",
}

export const OrderStatusUpdateEmail = ({
  orderId,
  userName,
  orderStatus,
  logoUrl = "https://i.ibb.co/GfTs981G/okto-new-logo-white.png"
}: OrderStatusUpdateEmailProps) => {
  const previewText = `Your Order #${orderId.slice(-6)} has been updated.`;
  const description = statusDescriptions[orderStatus] || `Your order status has been updated to: ${orderStatus}.`

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
           <Section style={logoContainer}>
            <Img src={logoUrl} width="140" height="40" alt="Logo" style={logo} />
          </Section>
          <Heading style={h1}>Order Status: {orderStatus.charAt(0).toUpperCase() + orderStatus.slice(1)}</Heading>
          <Text style={paragraph}>
            Hi {userName},
          </Text>
          <Text style={paragraph}>
           {description}
          </Text>
          
          <Section style={orderInfoContainer}>
            <Row>
              <Column>
                <Text style={infoTitle}>Order ID</Text>
                <Text style={infoValue}>#{orderId.slice(-6)}</Text>
              </Column>
            </Row>
          </Section>

          {orderStatus === 'shipped' && (
             <Section style={{ textAlign: 'center', marginTop: '20px' }}>
                <Button style={button} href={`http://localhost:3000/track-order/${orderId}`}>
                    Track Your Order
                </Button>
            </Section>
          )}

          <Text style={footer}>
            123 Fashion Ave, Style City, 12345
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default OrderStatusUpdateEmail;

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
  borderRadius: "8px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
};

const logoContainer = {
  textAlign: "center" as const,
  padding: '20px 0',
  borderBottom: "1px solid #eaeaea",
};

const logo = {
    margin: "0 auto"
}

const h1 = {
  color: "#333",
  fontSize: "28px",
  fontWeight: "bold",
  textAlign: "center" as const,
  margin: "30px 0",
  padding: "0",
};

const paragraph = {
  color: "#555",
  fontSize: "16px",
  lineHeight: "24px",
  textAlign: "center" as const,
  padding: "0 20px",
};

const orderInfoContainer = {
    padding: '0 20px',
    margin: '20px 0',
}

const infoTitle = {
    color: '#888',
    fontSize: '12px',
    lineHeight: 1.5,
    margin: 0
}

const infoValue = {
    color: '#333',
    fontSize: '14px',
    fontWeight: 'bold',
    margin: 0
}

const button = {
  backgroundColor: "#356854",
  borderRadius: "3px",
  color: "#fff",
  fontSize: "16px",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 20px",
};


const footer = {
  color: "#8898aa",
  fontSize: "12px",
  lineHeight: "16px",
  textAlign: "center" as const,
  padding: "20px",
};
