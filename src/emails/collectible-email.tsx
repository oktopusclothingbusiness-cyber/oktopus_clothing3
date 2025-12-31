
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
} from "@react-email/components";

type CollectibleEmailProps = {
  orderId: string;
  userName: string;
  collectibleUrl: string;
};

export const CollectibleEmail = ({
  orderId,
  userName,
  collectibleUrl,
}: CollectibleEmailProps) => {
  const previewText = `Your exclusive digital collectible is here!`;
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
          <Heading style={h1}>A Gift For You, {userName}</Heading>
          <Text style={paragraph}>
            As a token of our appreciation for your order, we've created a unique, one-of-a-kind digital collectible just for you.
          </Text>
          
          <Section style={collectibleContainer}>
            <Img src={collectibleUrl} alt="Your Digital Collectible" style={collectibleImage} />
          </Section>

          <Section style={{ textAlign: 'center', marginTop: '32px' }}>
            <Text style={paragraph}>
                This piece of digital art is unique to your order (#{orderId.slice(-6)}). We hope you love it!
            </Text>
             <Button style={button} href={`https://oktopusclothing1.vercel.app/track-order/${orderId}`}>
                View Your Order
            </Button>
          </Section>
          
          <Text style={footer}>
            OKTOPUS CLOTHING | Kolkata, West Bengal, India
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default CollectibleEmail;

// Styles

const main = {
  backgroundColor: "#0a0a0a",
  color: "#ffffff",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#1a1a1a",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
  borderRadius: "8px",
  boxShadow: "0 8px 24px rgba(255,255,255,0.1)"
};

const logoContainer = {
  textAlign: "center" as const,
  padding: '20px 0',
};

const logo = {
    margin: "0 auto"
}

const h1 = {
  color: "#ffffff",
  fontSize: "28px",
  fontWeight: "bold",
  textAlign: "center" as const,
  margin: "30px 0",
  padding: "0 20px",
};

const paragraph = {
  color: "#cccccc",
  fontSize: "16px",
  lineHeight: "24px",
  textAlign: "center" as const,
  padding: "0 40px",
};

const collectibleContainer = {
    padding: "0 20px",
    marginTop: "32px",
};

const collectibleImage = {
    margin: "0 auto",
    borderRadius: "16px",
    border: "1px solid #333333",
    maxWidth: '100%',
}

const button = {
  backgroundColor: "#FBBF24",
  borderRadius: "8px",
  color: "#000",
  fontSize: "16px",
  fontWeight: 'bold',
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "14px 24px",
};

const footer = {
  color: "#8898aa",
  fontSize: "12px",
  lineHeight: "16px",
  textAlign: "center" as const,
  padding: "20px",
  marginTop: "30px",
};
