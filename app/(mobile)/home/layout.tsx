import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Home | Fracassa Autolinee',
  description: 'Cerca orari e corse Fracassa Autolinee',
};

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}



