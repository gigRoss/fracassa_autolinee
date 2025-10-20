import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Fracassa Autolinee',
  description: 'Servizio autobus Fracassa Autolinee',
};

/**
 * Splash screen layout - minimal, no navigation
 */
export default function SplashLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}



