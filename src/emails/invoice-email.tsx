import * as React from "react";
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Text,
} from "@react-email/components";
import { format } from "date-fns";
import { getShortOrderId } from "@/lib/utils";

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
  createdAt: Date | string;
  paymentDetails: {
    razorpay_payment_id?: string;
    transactionRef?: string;
    paymentStatus?: 'paid' | 'pending';
    paymentMethod?: string;
  };
};

type Settings = {
  logoUrl?: string;
};

type InvoiceEmailProps = {
  order: Order & {
    invoiceNumber?: string;
    orderId?: string;
    notes?: string;
    dispatchMode?: string;
  };
  settings: Settings | null;
};

export const InvoiceEmail = ({ order, settings }: InvoiceEmailProps) => {
  const shortCode = getShortOrderId(order._id);
  const displayId = order.orderId || order.invoiceNumber || `OKT-${shortCode}`;
  const cleanId = String(displayId).replace(/^#/, '');
  const previewText = `Tax Invoice #${cleanId} - OKTOPUS CLOTHING`;

  const subtotal = order.subtotal || order.products.reduce((acc, p) => acc + p.price * p.quantity, 0);
  const shipping = order.shipping || 0;
  const discount = order.discount || 0;
  const isPaid = order.paymentDetails?.paymentStatus === 'paid';
  const formattedDate = order.createdAt ? format(new Date(order.createdAt), 'MMMM dd, yyyy') : 'N/A';
  const paymentRef = order.paymentDetails?.transactionRef || order.paymentDetails?.razorpay_payment_id;
  const dispatchMode = order.dispatchMode || 'Express Shipping';

  return (
    <Html lang="en">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="color-scheme" content="light only" />
        <meta name="supported-color-schemes" content="light only" />
        <style>{`
          :root {
            color-scheme: light only !important;
            supported-color-schemes: light only !important;
          }
          @media only screen and (max-width: 600px) {
            .email-container {
              width: 100% !important;
              max-width: 100% !important;
              padding: 18px 14px 0px 14px !important;
              border-radius: 12px !important;
            }
            .col-stack {
              display: block !important;
              width: 100% !important;
              box-sizing: border-box !important;
            }
            .col-stack-right {
              display: block !important;
              width: 100% !important;
              text-align: left !important;
              margin-top: 14px !important;
              box-sizing: border-box !important;
            }
            .col-stack-right * {
              text-align: left !important;
            }
            .table-cell-desc {
              width: 44% !important;
              padding: 8px 4px !important;
              font-size: 11px !important;
            }
            .table-cell-qty {
              width: 12% !important;
              padding: 8px 2px !important;
              font-size: 11px !important;
            }
            .table-cell-price {
              width: 22% !important;
              padding: 8px 2px !important;
              font-size: 11px !important;
            }
            .table-cell-amount {
              width: 22% !important;
              padding: 8px 2px !important;
              font-size: 11px !important;
            }
            .totals-wrap {
              width: 100% !important;
              max-width: 100% !important;
            }
            .footer-col-left {
              display: block !important;
              width: 100% !important;
              text-align: center !important;
            }
            .footer-col-right {
              display: block !important;
              width: 100% !important;
              text-align: center !important;
              margin-top: 16px !important;
            }
          }
        `}</style>
      </Head>
      <Preview>{previewText}</Preview>
      <Body style={main} className="email-body">
        <Container style={container} className="email-container">
          
          {/* HEADER SECTION (Table-based layout for 100% email client compatibility) */}
          <table role="presentation" cellSpacing="0" cellPadding="0" border={0} style={{ width: "100%", marginBottom: "16px" }}>
            <tbody>
              <tr>
                <td className="col-stack" style={{ verticalAlign: "top", width: "55%" }}>
                  <Img
                    src={settings?.logoUrl || "https://www.oktopusclothing.in/logo2b.png"}
                    alt="OKTOPUS CLOTHING"
                    width="150"
                    style={{ display: "block", marginBottom: "4px" }}
                  />
                  <Text style={baskeyLabel}>A UNIT OF BASKEY STUDIO</Text>
                  <Text style={address}>Kolkata, West Bengal, India</Text>
                </td>
                <td className="col-stack-right" style={{ verticalAlign: "top", textAlign: "right", width: "45%" }}>
                  <Text style={taxInvoiceLabel}>TAX INVOICE</Text>
                  <Heading as="h1" style={invoiceNumberHeading}>#{cleanId}</Heading>
                  <Text style={invoiceDateText}>{formattedDate}</Text>
                  <Text style={paymentStatusText}>
                    Payment:{" "}
                    <span style={{ color: isPaid ? "#059669" : "#d97706", fontWeight: "bold" }}>
                      {isPaid ? "PAID" : "PENDING"}
                    </span>
                  </Text>
                </td>
              </tr>
            </tbody>
          </table>

          <hr style={divider} />

          {/* CUSTOMER & ORDER INFORMATION (Matches web version 2-column layout) */}
          <table role="presentation" cellSpacing="0" cellPadding="0" border={0} style={{ width: "100%", marginBottom: "24px" }}>
            <tbody>
              <tr>
                <td className="col-stack" style={{ verticalAlign: "top", width: "50%", paddingRight: "8px" }}>
                  <Text style={sectionTitle}>BILLED TO</Text>
                  <Text style={customerNameText}>{order.userName || "Customer"}</Text>
                  <Text style={customerAddressText}>{order.shippingAddress?.address || "Address not specified"}</Text>
                  <Text style={customerMobileText}>Mobile: {order.shippingAddress?.mobile || "N/A"}</Text>
                </td>
                <td className="col-stack-right" style={{ verticalAlign: "top", textAlign: "right", width: "50%", paddingLeft: "8px" }}>
                  <Text style={sectionTitle}>ORDER SUMMARY</Text>
                  <Text style={orderIdText}>
                    <span style={{ color: "#94a3b8", fontWeight: "normal" }}>Order ID:</span> #{cleanId}
                  </Text>
                  {paymentRef && (
                    <Text style={orderMetaText}>
                      <span style={{ color: "#94a3b8", fontWeight: "normal" }}>Payment Ref:</span> {paymentRef}
                    </Text>
                  )}
                  <Text style={orderMetaText}>
                    <span style={{ color: "#94a3b8", fontWeight: "normal" }}>Dispatch Mode:</span> {dispatchMode}
                  </Text>
                </td>
              </tr>
            </tbody>
          </table>

          {/* ITEM TABLE (Matches web version border-slate-900 header and font styling) */}
          <table role="presentation" cellSpacing="0" cellPadding="0" border={0} style={productTable} className="mobile-table">
            <thead>
              <tr style={tableHeaderRow}>
                <th className="table-cell-desc" style={tableHeaderCell}>DESCRIPTION</th>
                <th className="table-cell-qty" style={tableHeaderCellCenter}>QTY</th>
                <th className="table-cell-price" style={tableHeaderCellRight}>UNIT PRICE</th>
                <th className="table-cell-amount" style={tableHeaderCellRight}>AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              {order.products.map((item, index) => (
                <tr key={index} style={tableRow}>
                  <td className="table-cell-desc" style={tableCell}>
                    <Text style={productNameText}>{item.name}</Text>
                    {(item.size || item.color) && (
                      <Text style={productDetailsText}>
                        {item.size ? `Size: ${item.size}` : ''}
                        {item.size && item.color ? ' | ' : ''}
                        {item.color ? `Color: ${item.color}` : ''}
                      </Text>
                    )}
                  </td>
                  <td className="table-cell-qty" style={tableCellCenter}>{item.quantity}</td>
                  <td className="table-cell-price" style={tableCellRight}>₹{item.price.toFixed(2)}</td>
                  <td className="table-cell-amount" style={tableCellRightBold}>₹{(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* FINANCIAL SUMMARY TABLE */}
          <table role="presentation" cellSpacing="0" cellPadding="0" border={0} style={{ width: "100%", marginBottom: "24px" }}>
            <tbody>
              <tr>
                <td className="col-stack" style={{ width: "42%" }}></td>
                <td className="col-stack totals-wrap" style={{ width: "58%" }}>
                  <table role="presentation" cellSpacing="0" cellPadding="0" border={0} style={{ width: "100%" }}>
                    <tbody>
                      <tr>
                        <td style={totalLabel}>Subtotal</td>
                        <td style={totalValue}>₹{subtotal.toFixed(2)}</td>
                      </tr>
                      {discount > 0 && (
                        <tr>
                          <td style={{ ...totalLabel, color: "#059669" }}>Discount</td>
                          <td style={{ ...totalValue, color: "#059669" }}>-₹{discount.toFixed(2)}</td>
                        </tr>
                      )}
                      <tr>
                        <td style={totalLabel}>Shipping</td>
                        <td style={totalValue}>{shipping > 0 ? `₹${shipping.toFixed(2)}` : 'FREE'}</td>
                      </tr>
                      <tr>
                        <td colSpan={2} style={{ padding: "6px 0" }}>
                          <div style={{ height: "2px", backgroundColor: "#0f172a", width: "100%" }} />
                        </td>
                      </tr>
                      <tr>
                        <td style={grandTotalLabel}>Total Amount</td>
                        <td style={grandTotalValue}>₹{order.total.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>

          {/* FOOTER WITH MINIMAL TEXT & VERIFIED INK STAMP SEAL */}
          <table role="presentation" cellSpacing="0" cellPadding="0" border={0} style={{ width: "100%", borderTop: "1px solid #f1f5f9", paddingTop: "20px", marginBottom: "20px" }}>
            <tbody>
              <tr>
                <td className="footer-col-left" style={{ verticalAlign: "middle", width: "66%" }}>
                  <Text style={footerBold}>Thank you for shopping with OKTOPUS CLOTHING!</Text>
                  <Text style={footerSupport}>Customer Support: oktopusclothing.business@gmail.com</Text>
                  <Text style={footerMsme}>OKTOPUS CLOTHING — A Unit of BASKEY Studio (Government of India Registered MSME)</Text>
                </td>
                <td className="footer-col-right" style={{ verticalAlign: "middle", textAlign: "right", width: "34%" }}>
                  {/* Verified Ink Stamp Seal Graphic */}
                  <div style={stampContainer}>
                    <div style={stampOuter}>
                      <table role="presentation" cellSpacing="0" cellPadding="0" border={0} style={{ width: "100%", height: "100%", borderRadius: "50%", border: "1.2px solid #474e5d" }}>
                        <tbody>
                          <tr>
                            <td style={{ textAlign: "center", verticalAlign: "middle", padding: "6px 2px" }}>
                              <div style={stampTextStar}>★ OKTOPUS CLOTHING ★</div>
                              <div style={stampTextTitle}>OFFICIAL VERIFIED</div>
                              <div style={stampTextSub}>TAX INVOICE SEAL</div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          {/* MULTI-COLOR GRADIENT WAVE BAR (Matches web version signature wave colors) */}
          <div style={waveWrapper}>
            <table role="presentation" cellSpacing="0" cellPadding="0" border={0} style={{ width: "100%", height: "10px", borderCollapse: "collapse" }}>
              <tbody>
                <tr>
                  <td style={{ backgroundColor: "#f59e0b", width: "25%", height: "10px", borderBottomLeftRadius: "6px" }}></td>
                  <td style={{ backgroundColor: "#ef4444", width: "25%", height: "10px" }}></td>
                  <td style={{ backgroundColor: "#8b5cf6", width: "25%", height: "10px" }}></td>
                  <td style={{ backgroundColor: "#3b82f6", width: "25%", height: "10px", borderBottomRightRadius: "6px" }}></td>
                </tr>
              </tbody>
            </table>
          </div>

        </Container>
      </Body>
    </Html>
  );
};

export default InvoiceEmail;

// --- STYLES (Engineered for complete cross-client and mobile responsiveness) ---

const main = {
  backgroundColor: "#f1f5f9",
  margin: "0",
  padding: "24px 0",
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  maxWidth: "600px",
  padding: "28px 32px 0px 32px",
  border: "2px solid #cbd5e1",
  borderRadius: "16px",
  overflow: "hidden" as const,
  boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)",
};

const baskeyLabel = {
  fontSize: "9.5px",
  fontWeight: "800" as const,
  color: "#d97706",
  letterSpacing: "1.4px",
  textTransform: "uppercase" as const,
  margin: "4px 0 2px 0",
};

const address = {
  fontSize: "10.5px",
  color: "#94a3b8",
  margin: "0",
};

const taxInvoiceLabel = {
  fontSize: "11px",
  fontWeight: "700" as const,
  color: "#94a3b8",
  letterSpacing: "2px",
  textTransform: "uppercase" as const,
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  margin: "0 0 2px 0",
};

const invoiceNumberHeading = {
  fontSize: "20px",
  fontWeight: "700" as const,
  color: "#0f172a",
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  margin: "0 0 2px 0",
};

const invoiceDateText = {
  fontSize: "12px",
  color: "#64748b",
  margin: "0 0 4px 0",
};

const paymentStatusText = {
  fontSize: "11px",
  fontWeight: "600" as const,
  color: "#64748b",
  textTransform: "uppercase" as const,
  margin: "0",
};

const divider = {
  border: "none",
  borderTop: "1px solid #e2e8f0",
  margin: "18px 0 22px 0",
};

const sectionTitle = {
  fontSize: "11px",
  fontWeight: "700" as const,
  color: "#94a3b8",
  letterSpacing: "1.5px",
  textTransform: "uppercase" as const,
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  margin: "0 0 6px 0",
};

const customerNameText = {
  fontSize: "15px",
  fontWeight: "700" as const,
  color: "#0f172a",
  margin: "0 0 4px 0",
};

const customerAddressText = {
  fontSize: "13px",
  color: "#475569",
  lineHeight: "18px",
  margin: "0 0 4px 0",
};

const customerMobileText = {
  fontSize: "12px",
  color: "#64748b",
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  margin: "0",
};

const orderIdText = {
  fontSize: "14px",
  fontWeight: "700" as const,
  color: "#0f172a",
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  margin: "0 0 4px 0",
};

const orderMetaText = {
  fontSize: "12px",
  color: "#64748b",
  margin: "0 0 2px 0",
};

const productTable = {
  width: "100%",
  borderCollapse: "collapse" as const,
  marginBottom: "24px",
};

const tableHeaderRow = {
  borderBottom: "2px solid #0f172a",
  backgroundColor: "#f8fafc",
};

const tableHeaderCell = {
  padding: "8px 10px",
  fontWeight: "700" as const,
  fontSize: "11px",
  textTransform: "uppercase" as const,
  color: "#0f172a",
  textAlign: "left" as const,
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  letterSpacing: "0.5px",
};

const tableHeaderCellCenter = {
  ...tableHeaderCell,
  textAlign: "center" as const,
};

const tableHeaderCellRight = {
  ...tableHeaderCell,
  textAlign: "right" as const,
};

const tableRow = {
  borderBottom: "1px solid #f1f5f9",
};

const tableCell = {
  padding: "12px 10px",
  verticalAlign: "middle" as const,
};

const tableCellCenter = {
  ...tableCell,
  textAlign: "center" as const,
  fontSize: "13px",
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  color: "#334155",
};

const tableCellRight = {
  ...tableCell,
  textAlign: "right" as const,
  fontSize: "13px",
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  color: "#334155",
};

const tableCellRightBold = {
  ...tableCell,
  textAlign: "right" as const,
  fontSize: "13px",
  fontWeight: "700" as const,
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  color: "#0f172a",
};

const productNameText = {
  fontSize: "13px",
  fontWeight: "600" as const,
  color: "#0f172a",
  margin: "0",
};

const productDetailsText = {
  fontSize: "11px",
  color: "#64748b",
  margin: "2px 0 0 0",
};

const totalLabel = {
  fontSize: "13px",
  color: "#64748b",
  padding: "4px 0",
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
};

const totalValue = {
  fontSize: "13px",
  color: "#0f172a",
  textAlign: "right" as const,
  padding: "4px 0",
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  fontWeight: "500" as const,
};

const grandTotalLabel = {
  fontSize: "15px",
  fontWeight: "700" as const,
  color: "#0f172a",
  padding: "6px 0 0 0",
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
};

const grandTotalValue = {
  fontSize: "16px",
  fontWeight: "700" as const,
  color: "#0f172a",
  textAlign: "right" as const,
  padding: "6px 0 0 0",
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
};

const footerBold = {
  fontSize: "12px",
  fontWeight: "600" as const,
  color: "#334155",
  margin: "0 0 3px 0",
};

const footerSupport = {
  fontSize: "11px",
  color: "#64748b",
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  margin: "0 0 3px 0",
};

const footerMsme = {
  fontSize: "9.5px",
  color: "#94a3b8",
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  letterSpacing: "0.4px",
  textTransform: "uppercase" as const,
  margin: "0",
};

const stampContainer = {
  display: "inline-block",
  transform: "rotate(-8deg)",
  opacity: 0.92,
};

const stampOuter = {
  width: "108px",
  height: "108px",
  borderRadius: "50%",
  border: "2px dashed #474e5d",
  padding: "3px",
  boxSizing: "border-box" as const,
  display: "inline-block",
};

const stampInner = {
  width: "100%",
  height: "100%",
  borderRadius: "50%",
  border: "1.2px solid #474e5d",
  textAlign: "center" as const,
  display: "flex",
  flexDirection: "column" as const,
  justifyContent: "center",
  alignItems: "center",
  padding: "4px 2px",
  boxSizing: "border-box" as const,
};

const stampTextStar = {
  fontSize: "6.5px",
  fontWeight: "800" as const,
  color: "#474e5d",
  letterSpacing: "0.8px",
  textTransform: "uppercase" as const,
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  margin: "0 0 2px 0",
  lineHeight: "8px",
};

const stampTextTitle = {
  fontSize: "7.5px",
  fontWeight: "800" as const,
  color: "#474e5d",
  letterSpacing: "1px",
  textTransform: "uppercase" as const,
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  margin: "0",
  lineHeight: "10px",
};

const stampTextSub = {
  fontSize: "6.5px",
  fontWeight: "700" as const,
  color: "#474e5d",
  letterSpacing: "0.8px",
  textTransform: "uppercase" as const,
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  margin: "2px 0 0 0",
  lineHeight: "8px",
};

const waveWrapper = {
  width: "100%",
  overflow: "hidden",
  borderRadius: "0 0 14px 14px",
  marginTop: "16px",
};
