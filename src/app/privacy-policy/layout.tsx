import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'Learn how Oktopus Clothing collects, uses, and protects your personal information across our website and mobile application.',
  alternates: {
    canonical: 'https://www.oktopusclothing.in/privacy-policy',
  },
};

export default function PrivacyPolicyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

