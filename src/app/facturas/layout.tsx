import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Facturas',
  description: 'Facturas y pagos a proveedores',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
