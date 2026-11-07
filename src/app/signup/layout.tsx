import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create an Account | Join Oktopus Rewards',
  description: 'Sign up for an Oktopus Clothing account. Earn Oktocoins on every order, save customized designs, and enjoy exclusive drops.',
  robots: {
    index: false,
    follow: true,
  },
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

