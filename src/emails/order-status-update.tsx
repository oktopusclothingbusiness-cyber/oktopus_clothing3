
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
}: OrderStatusUpdateEmailProps) => {
  const previewText = `Your Order #${orderId.slice(-6)} has been updated.`;
  const description = statusDescriptions[orderStatus] || `Your order status has been updated to: ${orderStatus}.`
  const logoUrl = "https://www.oktopusclothing.in/logo2b.png";
  const avatarUrl = "https://www.oktopusclothing.in/logo1.png";

  return (
    <Html lang="en">
      <Head>
        <meta name="color-scheme" content="light only" />
        <meta name="supported-color-schemes" content="light only" />
        <style>{`
          :root {
            color-scheme: light only !important;
            supported-color-schemes: light only !important;
          }
          @media (prefers-color-scheme: dark) {
            body, .email-body {
              background-color: #f6f9fc !important;
              background-image: linear-gradient(#f6f9fc, #f6f9fc) !important;
              color: #0f172a !important;
            }
            .email-container {
              background-color: #ffffff !important;
              background-image: linear-gradient(#ffffff, #ffffff) !important;
              border-color: #e2e8f0 !important;
            }
            h1, h2, p, span, td {
              color: #0f172a !important;
            }
          }
        `}</style>
      </Head>
      <Preview>{previewText}</Preview>
      <Body style={main} className="email-body">
        <Container style={container} className="email-container">
          <Section style={logoContainer}>
            <table role="presentation" cellSpacing="0" cellPadding="0" border={0} align="center" style={{ margin: "0 auto" }}>
              <tbody>
                <tr>
                  <td style={{ verticalAlign: 'middle', paddingRight: '12px' }}>
                    <Img src={avatarUrl} width="38" height="38" alt="Oktopus Avatar" style={{ borderRadius: "50%", display: "block", border: "1px solid #e2e8f0" }} />
                  </td>
                  <td style={{ verticalAlign: 'middle' }}>
                    <Img src={logoUrl} width="168" height="35" alt="OKTOPUS CLOTHING" style={{ display: "block" }} />
                  </td>
                </tr>
              </tbody>
            </table>
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
                <Button style={button} href={`https://oktopusclothing.in/track-order/${orderId}`}>
                    Track Your Order
                </Button>
            </Section>
          )}

          <Text style={footer}>
            OKTOPUS CLOTHING • Kolkata, West Bengal, India
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default OrderStatusUpdateEmail;

const main = {
  backgroundColor: "#f6f9fc",
  backgroundImage: "linear-gradient(#f6f9fc, #f6f9fc)",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  backgroundImage: "linear-gradient(#ffffff, #ffffff)",
  margin: "0 auto",
  padding: "0 0 48px",
  marginBottom: "64px",
  borderRadius: "8px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  border: "1px solid #e2e8f0",
  overflow: "hidden" as const,
};

const logoContainer = {
  textAlign: "center" as const,
  padding: '24px 0',
  backgroundColor: "#ffffff",
  backgroundImage: "linear-gradient(#ffffff, #ffffff)",
  borderBottom: "1px solid #e2e8f0",
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
