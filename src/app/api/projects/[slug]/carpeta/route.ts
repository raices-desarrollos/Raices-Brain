import { requireAuth } from '@/lib/auth/server';
import { getDeckInfo } from '@/lib/commercial/deck';
import { NextResponse } from 'next/server';

/** Metadatos de la carpeta de venta del proyecto. */
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { response } = await requireAuth();
  if (response) return response;

  const { slug } = await params;
  const info = await getDeckInfo(slug);
  if (!info) {
    return NextResponse.json(
      { error: 'Este proyecto todavía no tiene carpeta de venta.' },
      { status: 404 },
    );
  }
  return NextResponse.json(info);
}
