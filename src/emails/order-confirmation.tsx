
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Text,
  Section,
  Row,
  Column,
} from "@react-email/components";
import { format } from "date-fns";

type Product = {
  name: string;
  quantity: number;
  price: number;
};

type OrderConfirmationEmailProps = {
  orderId: string;
  userName: string;
  orderDate: Date;
  total: number;
  products: Product[];
};

export const OrderConfirmationEmail = ({
  orderId,
  userName,
  orderDate,
  total,
  products,
}: OrderConfirmationEmailProps) => {
  const previewText = `Your Order #${orderId.slice(-6)} confirmed!`;
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
          <Heading style={h1}>Thanks for your order, {userName}!</Heading>
          <Text style={paragraph}>
            We've received your order and will start working on it right away. Once your order ships, we'll send you another email with tracking information.
          </Text>
          
          <Section style={orderInfoContainer}>
            <Row>
              <Column>
                <Text style={infoTitle}>Order ID</Text>
                <Text style={infoValue}>#{orderId.slice(-6)}</Text>
              </Column>
              <Column style={{ textAlign: 'right' }}>
                <Text style={infoTitle}>Order Date</Text>
                <Text style={infoValue}>{format(new Date(orderDate), "PP")}</Text>
              </Column>
            </Row>
          </Section>

          <Heading style={h2}>Order Summary</Heading>
          
          <Section>
            {products.map((product, index) => (
              <Row key={index} style={productRow}>
                <Column>
                  <Text style={productName}>{product.name} (x{product.quantity})</Text>
                </Column>
                <Column style={{ textAlign: 'right' }}>
                  <Text style={productPrice}>₹{(product.price * product.quantity).toFixed(2)}</Text>
                </Column>
              </Row>
            ))}
          </Section>

          <Section style={totalContainer}>
             <Row>
              <Column style={totalLabel}>Total</Column>
              <Column style={totalValue}>₹{total.toFixed(2)}</Column>
            </Row>
          </Section>

          <Text style={footer}>
            OKTOPUS CLOTHING • Kolkata, West Bengal, India
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default OrderConfirmationEmail;

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

const h2 = {
  color: "#333",
  fontSize: "20px",
  fontWeight: "bold",
  margin: "30px 0 20px",
  padding: "0 20px",
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


const productRow = {
    padding: '10px 20px',
    borderBottom: '1px solid #eaeaea',
}

const productName = {
    margin: 0,
    color: '#333',
    fontSize: '14px'
}

const productPrice = {
    margin: 0,
    color: '#333',
    fontSize: '14px',
    fontWeight: 'bold' as const
}


const totalContainer = {
    padding: '20px',
    borderTop: '1px solid #eaeaea',
    marginTop: '20px',
};

const totalLabel = {
    fontSize: '16px',
    fontWeight: 'bold' as const,
    color: '#333',
    width: '80%'
}

const totalValue = {
    fontSize: '16px',
    fontWeight: 'bold' as const,
    color: '#333',
    textAlign: 'right' as const
}

const footer = {
  color: "#8898aa",
  fontSize: "12px",
  lineHeight: "16px",
  textAlign: "center" as const,
  padding: "0 20px",
};
