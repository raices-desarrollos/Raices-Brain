import { formatProjectName } from '@/lib/domain/catalog';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const name = formatProjectName(slug);
  return { title: name, description: `Estado, facturas y documentos de ${name}` };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
