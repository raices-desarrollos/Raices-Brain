import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Brain',
  description: 'Preguntale al Brain sobre los proyectos',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
