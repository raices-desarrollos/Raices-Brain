import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Entrar',
  description: 'Acceso al sistema interno de Raíces',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
