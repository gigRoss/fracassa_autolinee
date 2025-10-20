import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cerca Corse | Fracassa Autolinee',
  description: 'Cerca orari e percorsi autobus',
};

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

