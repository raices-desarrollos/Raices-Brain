import { formatProjectName } from '@/lib/domain/catalog';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `Precios · ${formatProjectName(slug)}`,
    description: `Lista de precios de preventa de ${formatProjectName(slug)}`,
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
