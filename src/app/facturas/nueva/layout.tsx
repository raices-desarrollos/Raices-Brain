import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Subir factura',
  description: 'Cargar una factura nueva',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
