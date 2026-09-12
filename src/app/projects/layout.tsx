import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ceibo Vidal',
  description: 'Estado, facturas y documentos de Ceibo Vidal',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
