
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
  const logoUrl = "https://i.ibb.co/GfTs981G/okto-new-logo-white.png";
  
  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoContainer}>
            <Img src={logoUrl} width="140" height="40" alt="OKTOPUS CLOTHING" style={logo} />
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
                <Text style={infoValue}>{format(orderDate, "PP")}</Text>
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
            OKTOPUS CLOTHING | 123 Fashion Ave, Style City, 12345
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default OrderConfirmationEmail;

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
