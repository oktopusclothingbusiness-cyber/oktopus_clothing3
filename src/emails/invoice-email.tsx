
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

type InvoiceEmailProps = {
  order: Order;
  settings: Settings | null;
};

export const InvoiceEmail = ({ order, settings }: InvoiceEmailProps) => {
  const previewText = `Invoice for your Order #${order._id.slice(-6)}`;
  
  // These values may not exist on old orders, so we calculate them
  const subtotal = order.subtotal || order.products.reduce((acc, p) => acc + (p.price * p.quantity), 0);
  const shipping = order.shipping || 0;
  const discount = order.discount || 0;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
           <Section style={header}>
            <div>
              {settings?.logoUrl && (
                <Img src={settings.logoUrl} alt="Oktopus Logo" width="150" style={logo} />
              )}
              <Text style={address}>Kolkata, West Bengal, India</Text>
            </div>
            <div style={{ textAlign: 'right' }}>
              <Heading as="h1" style={h1}>INVOICE</Heading>
              <Text style={invoiceId}>#{order._id.slice(-6).toUpperCase()}</Text>
            </div>
          </Section>

           <Section style={customerInfo}>
            <Row>
              <Column>
                <Text style={infoTitle}>BILLED TO</Text>
                <Text style={infoValueBold}>{order.userName}</Text>
                <Text style={infoValue}>{order.shippingAddress.address}</Text>
                <Text style={infoValue}>{order.shippingAddress.mobile}</Text>
              </Column>
              <Column style={{ textAlign: 'right' }}>
                 <Text style={infoTitle}>INVOICE DATE</Text>
                 <Text style={infoValue}>{format(new Date(order.createdAt), 'MMMM dd, yyyy')}</Text>
                 <Text style={infoTitle}>PAYMENT STATUS</Text>
                 <Text style={infoValue}>{order.paymentDetails?.paymentStatus?.toUpperCase()}</Text>
              </Column>
            </Row>
          </Section>

          <Section>
            <table style={table}>
              <thead>
                <tr style={tableHeaderRow}>
                  <th style={tableHeaderCell}>Description</th>
                  <th style={tableHeaderCellCenter}>Qty</th>
                  <th style={tableHeaderCellRight}>Unit Price</th>
                  <th style={tableHeaderCellRight}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {order.products.map((item, index) => (
                  <tr key={index} style={tableRow}>
                    <td style={tableCell}>
                        <Text style={productName}>{item.name}</Text>
                        <Text style={productDetails}>
                            Size: {item.size}, Color: {item.color}
                        </Text>
                    </td>
                    <td style={tableCellCenter}>{item.quantity}</td>
                    <td style={tableCellRight}>₹{item.price.toFixed(2)}</td>
                    <td style={tableCellRightBold}>₹{(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>

          <Section style={totalsSection}>
             <Row style={totalRow}>
              <Column style={totalLabel}>Subtotal</Column>
              <Column style={totalValue}>₹{subtotal.toFixed(2)}</Column>
            </Row>
             {discount > 0 && (
                <Row style={totalRow}>
                    <Column style={totalLabel}>Discount</Column>
                    <Column style={totalValue}>-₹{discount.toFixed(2)}</Column>
                </Row>
            )}
             <Row style={totalRow}>
              <Column style={totalLabel}>Shipping</Column>
              <Column style={totalValue}>₹{shipping.toFixed(2)}</Column>
            </Row>
            <Row style={grandTotalRow}>
              <Column style={grandTotalLabel}>Total</Column>
              <Column style={grandTotalValue}>₹{order.total.toFixed(2)}</Column>
            </Row>
          </Section>

          <Text style={footer}>
            Thank you for your business! If you have any questions, please contact us at oktopusclothing.business@gmail.com
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default InvoiceEmail;

// Styles

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 40px 48px",
  marginBottom: "64px",
};

const header = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "40px",
}

const logo = {
    width: "150px"
}

const address = {
    fontSize: "12px",
    color: "#555",
    margin: "8px 0 0"
}

const h1 = {
  fontSize: "32px",
  fontWeight: "bold",
  color: "#333",
  margin: 0
};

const invoiceId = {
    color: "#555",
    margin: "4px 0 0"
}

const customerInfo = {
    marginBottom: "40px"
}

const infoTitle = {
    textTransform: "uppercase" as const,
    fontSize: "12px",
    color: "#888",
    marginBottom: "4px"
}

const infoValue = {
    fontSize: "14px",
    color: "#333",
    margin: 0
}

const infoValueBold = { ...infoValue, fontWeight: "bold" as const }


const table = {
    width: "100%",
    marginBottom: "40px",
    borderCollapse: "collapse" as const
}

const tableHeaderRow = {
    borderBottom: "2px solid #eaeaea",
    textAlign: "left" as const,
    fontSize: "12px",
    textTransform: "uppercase" as const,
    color: "#555"
}

const tableHeaderCell = {
    padding: "8px 0",
    fontWeight: "600" as const,
}

const tableHeaderCellCenter = { ...tableHeaderCell, textAlign: "center" as const };
const tableHeaderCellRight = { ...tableHeaderCell, textAlign: "right" as const };

const tableRow = {
    borderBottom: "1px solid #f0f0f0"
}

const tableCell = {
    padding: "16px 0",
}

const tableCellCenter = { ...tableCell, textAlign: "center" as const };
const tableCellRight = { ...tableCell, textAlign: "right" as const };
const tableCellRightBold = { ...tableCellRight, fontWeight: "bold" as const };

const productName = {
    fontSize: "14px",
    fontWeight: "500" as const,
    margin: 0
}

const productDetails = {
    fontSize: "12px",
    color: "#555",
    margin: "4px 0 0"
}


const totalsSection = {
    width: "100%",
    display: "flex",
    justifyContent: "flex-end"
}

const totalRow = {
    display: "flex",
    justifyContent: "space-between",
    padding: "4px 0"
}

const totalLabel = {
    color: "#555"
}

const totalValue = {
    textAlign: "right" as const
}

const grandTotalRow = {
    ...totalRow,
    paddingTop: "12px",
    marginTop: "8px",
    borderTop: "2px solid #eaeaea"
}

const grandTotalLabel = {
    fontSize: "18px",
    fontWeight: "bold" as const,
}

const grandTotalValue = {
    ...grandTotalLabel,
    textAlign: "right" as const
}


const footer = {
  color: "#8898aa",
  fontSize: "12px",
  lineHeight: "16px",
  textAlign: "center" as const,
  marginTop: "40px"
};
