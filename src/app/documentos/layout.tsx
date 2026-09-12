import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Documentos',
  description: 'Documentación de los proyectos',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
