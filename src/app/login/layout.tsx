import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In to Your Account',
  description: 'Log in to your Oktopus Clothing account to manage orders, track rewards, and access saved designs.',
  robots: {
    index: false,
    follow: true,
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

