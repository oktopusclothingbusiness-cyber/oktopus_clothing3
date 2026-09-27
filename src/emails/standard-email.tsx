import React from 'react';
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
  Button,
  Hr,
  Link,
  Row,
  Column,
} from "@react-email/components";

export type StandardEmailType = 'update' | 'promotion' | 'information' | 'announcement';

export type StandardEmailProps = {
  subject: string;
  messageBody: string;
  type?: StandardEmailType;
  actionText?: string;
  actionUrl?: string;
  headerTheme?: 'light' | 'dark';
};

// Official Dark Brand Assets hosted live on custom verified domain
const LOGO_AVATAR = "https://www.oktopusclothing.in/logo1.png";  // Dark Mascot / Profile Avatar
const LOGO_DARK = "https://www.oktopusclothing.in/logo2b.png";   // Dark / Black Horizontal Brand Wordmark

export const StandardEmailTemplate = ({
  subject,
  messageBody,
  type = 'information',
  actionText,
  actionUrl,
}: StandardEmailProps) => {
  const previewText = subject;

  const typeLabels: Record<StandardEmailType, { label: string; color: string; bg: string }> = {
    update: { label: 'STORE UPDATE', color: '#0369a1', bg: '#e0f2fe' },
    promotion: { label: 'EXCLUSIVE PROMOTION', color: '#b45309', bg: '#fef3c7' },
    information: { label: 'OFFICIAL NOTICE', color: '#334155', bg: '#f1f5f9' },
    announcement: { label: 'ANNOUNCEMENT', color: '#6d28d9', bg: '#ede9fe' },
  };

  const badge = typeLabels[type] || typeLabels.information;

  // Split message into paragraphs safely
  const paragraphs = (messageBody || '')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <Html lang="en">
      <Head>
        {/* Force Mobile Email Clients (Gmail, Apple Mail, Outlook) to Render Light Theme */}
        <meta name="color-scheme" content="light only" />
        <meta name="supported-color-schemes" content="light only" />
        <style>{`
          :root {
            color-scheme: light only !important;
            supported-color-schemes: light only !important;
          }
          /* Lock light theme across iOS, Android, macOS, and Windows dark mode */
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
            .email-card {
              background-color: #f8fafc !important;
              background-image: linear-gradient(#f8fafc, #f8fafc) !important;
              border-color: #e2e8f0 !important;
            }
            .email-query-box {
              background-color: #ffffff !important;
              background-image: linear-gradient(#ffffff, #ffffff) !important;
              border-color: #cbd5e1 !important;
            }
            h1, h2, h3, p, span, a, td, th {
              color: #0f172a !important;
            }
            .light-text-subtle {
              color: #64748b !important;
            }
            .light-text-muted {
              color: #94a3b8 !important;
            }
          }
          /* Outlook & WebKit specific dark mode immunity */
          [data-ogsc] body, [data-ogsb] body {
            background-color: #f6f9fc !important;
          }
          [data-ogsc] .email-container, [data-ogsb] .email-container {
            background-color: #ffffff !important;
          }
        `}</style>
      </Head>
      <Preview>{previewText}</Preview>
      <Body style={main} className="email-body">
        <Container style={container} className="email-container">
          
          {/* 1. BRAND HEADER: CRISP LIGHT BACKGROUND WITH DARK LOGOS ONLY */}
          <Section style={headerSection}>
            <table
              role="presentation"
              cellSpacing="0"
              cellPadding="0"
              border={0}
              align="center"
              style={{ margin: "0 auto" }}
            >
              <tbody>
                <tr>
                  <td style={{ verticalAlign: 'middle', paddingRight: '12px' }}>
                    <Img
                      src={LOGO_AVATAR}
                      width="42"
                      height="42"
                      alt="Oktopus Mascot"
                      style={avatarIconStyle}
                    />
                  </td>
                  <td style={{ verticalAlign: 'middle' }}>
                    <Img
                      src={LOGO_DARK}
                      width="180"
                      height="38"
                      alt="OKTOPUS CLOTHING"
                      style={logoHorizontalStyle}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
            <Text style={baskeyLabel}>A UNIT OF BASKEY STUDIO</Text>
            <Text style={locationLabel} className="light-text-muted">Kolkata, West Bengal, India</Text>
          </Section>

          <Hr style={headerDivider} />

          {/* 2. BADGE & SUBJECT HEADING */}
          <Section style={contentSection}>
            <div style={{ marginBottom: '14px' }}>
              <span
                style={{
                  display: 'inline-block',
                  fontSize: '10px',
                  fontWeight: 800,
                  letterSpacing: '1.2px',
                  color: badge.color,
                  backgroundColor: badge.bg,
                  padding: '4px 10px',
                  borderRadius: '4px',
                  fontFamily: 'monospace',
                }}
              >
                {badge.label}
              </span>
            </div>

            <Heading style={h1}>{subject}</Heading>

            {/* Message Body */}
            {paragraphs.length > 0 ? (
              paragraphs.map((p, idx) => (
                <Text key={idx} style={paragraph}>
                  {p}
                </Text>
              ))
            ) : (
              <Text style={paragraph}>
                {messageBody}
              </Text>
            )}

            {/* Optional Call to Action Button */}
            {actionText && actionUrl && (
              <Section style={{ textAlign: 'center' as const, marginTop: '26px', marginBottom: '16px' }}>
                <Button style={actionButton} href={actionUrl}>
                  {actionText}
                </Button>
              </Section>
            )}
          </Section>

          {/* 3. DEDICATED CUSTOMER SUPPORT & QUERY SUBMISSION CARD (LIGHT BACKGROUND) */}
          <Section style={supportSection}>
            <div style={supportCard} className="email-card">
              <Row>
                <Column style={{ width: '48px', verticalAlign: 'top' }}>
                  <Img
                    src={LOGO_AVATAR}
                    width="42"
                    height="42"
                    alt="Oktopus Care Avatar"
                    style={{ borderRadius: '50%', border: '1px solid #cbd5e1', display: 'block' }}
                  />
                </Column>
                <Column style={{ paddingLeft: '12px' }}>
                  <Text style={supportTitle}>Customer Queries & Design Support</Text>
                  <Text style={supportDesc} className="light-text-subtle">
                    Have any questions regarding orders, sizing, delivery, or custom designs? Write directly to our support desk:
                  </Text>
                </Column>
              </Row>

              <div style={queryEmailBox} className="email-query-box">
                <Text style={queryEmailLabel} className="light-text-muted">Direct Query Submission Email</Text>
                <Text style={queryEmailValue}>oktopusclothing.business@gmail.com</Text>
              </div>

              <Text style={careEmailNote} className="light-text-subtle">
                Customer care inquiries: {' '}
                <Link href="mailto:care@oktopusclothing.in" style={careLink}>
                  care@oktopusclothing.in
                </Link>
              </Text>
            </div>
          </Section>

          {/* 4. BRAND SIGNATURE CARD: CLEAN LIGHT CARD WITH DARK LOGOS ONLY */}
          <Section style={brandSignatureSection}>
            <div style={brandSignatureCard} className="email-card">
              <table
                role="presentation"
                cellSpacing="0"
                cellPadding="0"
                border={0}
                align="center"
                style={{ margin: "0 auto 6px" }}
              >
                <tbody>
                  <tr>
                    <td style={{ verticalAlign: 'middle', paddingRight: '10px' }}>
                      <Img
                        src={LOGO_AVATAR}
                        width="30"
                        height="30"
                        alt="Oktopus"
                        style={{ borderRadius: '50%', display: 'block' }}
                      />
                    </td>
                    <td style={{ verticalAlign: 'middle' }}>
                      <Img
                        src={LOGO_DARK}
                        width="150"
                        height="31"
                        alt="OKTOPUS CLOTHING"
                        style={{ display: 'block' }}
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
              <Text style={brandTagline} className="light-text-subtle">STREETWEAR • OVERSIZED • ESSENTIALS</Text>
            </div>
          </Section>

          {/* 5. BUSINESS DETAILS & APPROVED MSME FOOTER */}
          <Section style={footerSection}>
            <Text style={footerGratitude}>Thank you for choosing OKTOPUS CLOTHING!</Text>
            <Text style={footerCredit} className="light-text-subtle">
              <strong>OKTOPUS CLOTHING</strong> • A Unit of <strong>BASKEY STUDIO</strong> (Government of India Registered MSME)
            </Text>
            <Text style={footerAddress} className="light-text-muted">
              Registered Location: Kolkata, West Bengal, India
            </Text>

            <Section style={footerLinksContainer}>
              <Link href="https://oktopusclothing.in" style={footerLink}>
                Store Website
              </Link>
              <span style={footerSeparator}>•</span>
              <Link href="https://oktopusclothing.in/track-order" style={footerLink}>
                Track Order
              </Link>
              <span style={footerSeparator}>•</span>
              <Link href="mailto:oktopusclothing.business@gmail.com" style={footerLink}>
                Submit Query
              </Link>
            </Section>
          </Section>

          {/* 6. SIGNATURE MULTI-COLOR GRADIENT WAVE BAR */}
          <Section style={{ padding: '0 24px 24px' }}>
            <div style={colorfulBar} />
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default StandardEmailTemplate;

// Standard Styles locked to light backgrounds with mobile dark-mode immunity
const main = {
  backgroundColor: "#f6f9fc",
  backgroundImage: "linear-gradient(#f6f9fc, #f6f9fc)",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  backgroundImage: "linear-gradient(#ffffff, #ffffff)",
  margin: "32px auto",
  borderRadius: "12px",
  boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
  border: "1px solid #e2e8f0",
  maxWidth: "600px",
  overflow: "hidden" as const,
};

const headerSection = {
  backgroundColor: "#ffffff",
  backgroundImage: "linear-gradient(#ffffff, #ffffff)",
  textAlign: "center" as const,
  padding: "32px 24px 18px",
};

const avatarIconStyle = {
  borderRadius: "50%",
  display: "block",
  border: "1px solid #e2e8f0",
};

const logoHorizontalStyle = {
  display: "block",
};

const baskeyLabel = {
  fontSize: "10px",
  fontWeight: "800" as const,
  color: "#d97706",
  letterSpacing: "1.5px",
  textTransform: "uppercase" as const,
  margin: "10px 0 2px",
};

const locationLabel = {
  fontSize: "11px",
  color: "#94a3b8",
  margin: "0",
};

const headerDivider = {
  borderTop: "1px solid #f1f5f9",
  margin: "0 24px",
};

const contentSection = {
  padding: "24px 32px 16px",
  backgroundColor: "#ffffff",
  backgroundImage: "linear-gradient(#ffffff, #ffffff)",
};

const h1 = {
  color: "#0f172a",
  fontSize: "22px",
  fontWeight: "800" as const,
  lineHeight: "30px",
  margin: "0 0 16px",
};

const paragraph = {
  color: "#334155",
  fontSize: "15px",
  lineHeight: "24px",
  margin: "0 0 14px",
};

const actionButton = {
  backgroundColor: "#0f172a",
  backgroundImage: "linear-gradient(#0f172a, #0f172a)",
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: "700" as const,
  padding: "12px 24px",
  borderRadius: "6px",
  textDecoration: "none",
  display: "inline-block",
};

const supportSection = {
  padding: "8px 32px 16px",
};

const supportCard = {
  backgroundColor: "#f8fafc",
  backgroundImage: "linear-gradient(#f8fafc, #f8fafc)",
  border: "1px solid #e2e8f0",
  borderRadius: "10px",
  padding: "20px",
};

const supportTitle = {
  fontSize: "14px",
  fontWeight: "700" as const,
  color: "#0f172a",
  margin: "0 0 4px",
};

const supportDesc = {
  fontSize: "12.5px",
  color: "#64748b",
  lineHeight: "18px",
  margin: "0 0 12px",
};

const queryEmailBox = {
  backgroundColor: "#ffffff",
  backgroundImage: "linear-gradient(#ffffff, #ffffff)",
  border: "1px solid #cbd5e1",
  borderRadius: "6px",
  padding: "10px 14px",
  textAlign: "center" as const,
};

const queryEmailLabel = {
  fontSize: "10px",
  fontWeight: "700" as const,
  color: "#94a3b8",
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
  margin: "0 0 2px",
};

const queryEmailValue = {
  fontSize: "13.5px",
  fontWeight: "700" as const,
  color: "#0f172a",
  fontFamily: "monospace",
  margin: "0",
};

const careEmailNote = {
  fontSize: "11.5px",
  color: "#64748b",
  textAlign: "center" as const,
  margin: "12px 0 0",
};

const careLink = {
  color: "#0f172a",
  fontWeight: "600" as const,
  textDecoration: "underline",
};

const brandSignatureSection = {
  padding: "4px 32px 0",
};

const brandSignatureCard = {
  backgroundColor: "#f8fafc",
  backgroundImage: "linear-gradient(#f8fafc, #f8fafc)",
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  padding: "16px 20px",
  textAlign: "center" as const,
};

const brandTagline = {
  color: "#64748b",
  fontSize: "9.5px",
  fontWeight: "700" as const,
  letterSpacing: "1.8px",
  textTransform: "uppercase" as const,
  margin: "4px 0 0",
};

const footerSection = {
  padding: "20px 32px 16px",
  textAlign: "center" as const,
};

const footerGratitude = {
  fontSize: "12px",
  fontWeight: "600" as const,
  color: "#334155",
  margin: "0 0 6px",
};

const footerCredit = {
  fontSize: "10.5px",
  color: "#64748b",
  margin: "0 0 4px",
  lineHeight: "16px",
};

const footerAddress = {
  fontSize: "10.5px",
  color: "#94a3b8",
  margin: "0 0 12px",
};

const footerLinksContainer = {
  textAlign: "center" as const,
  margin: "8px 0",
};

const footerLink = {
  fontSize: "11px",
  color: "#475569",
  fontWeight: "600" as const,
  textDecoration: "none",
};

const footerSeparator = {
  color: "#cbd5e1",
  padding: "0 6px",
};

const colorfulBar = {
  height: "8px",
  width: "100%",
  borderRadius: "4px",
  background: "linear-gradient(to right, #f59e0b, #ef4444, #8b5cf6, #3b82f6)",
};
