
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
} from "@react-email/components";

type PromotionalEmailProps = {
  subject: string;
  messageBody: string;
};

export const PromotionalEmail = ({
  subject,
  messageBody,
}: PromotionalEmailProps) => {
  const previewText = subject;
  const logoUrl = "https://i.ibb.co/GfTs981G/okto-new-logo-white.png";
  
  // Simple check to add <br /> tags for newlines
  const formattedMessage = messageBody.replace(/\n/g, '<br />');

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoContainer}>
            <Img src={logoUrl} width="140" height="40" alt="OKTOPUS CLOTHING" style={logo} />
          </Section>
          <Heading style={h1}>{subject}</Heading>
          
          <Section style={contentSection}>
            <Text style={paragraph} dangerouslySetInnerHTML={{ __html: formattedMessage }} />
          </Section>
          
          <Text style={footer}>
            OKTOPUS CLOTHING | 123 Fashion Ave, Style City, 12345
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default PromotionalEmail;

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
  padding: "0 20px",
};

const contentSection = {
  padding: "0 40px",
}

const paragraph = {
  color: "#555",
  fontSize: "16px",
  lineHeight: "26px",
};

const footer = {
  color: "#8898aa",
  fontSize: "12px",
  lineHeight: "16px",
  textAlign: "center" as const,
  padding: "20px",
  borderTop: "1px solid #eaeaea",
  marginTop: "30px",
};
