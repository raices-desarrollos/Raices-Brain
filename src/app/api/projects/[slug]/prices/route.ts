import { requireAuth } from '@/lib/auth/server';
import { getVidalPrices } from '@/lib/finance/prices';
import { NextResponse } from 'next/server';

export const maxDuration = 60;

type Params = { params: Promise<{ slug: string }> };

export async function GET(req: Request, { params }: Params) {
  const { response } = await requireAuth();
  if (response) return response;

  const { slug } = await params;
  if (slug !== 'ceibo-vidal') {
    return NextResponse.json({ error: 'Este proyecto no tiene lista de precios.' }, { status: 404 });
  }

  const force = new URL(req.url).searchParams.get('refresh') === '1';
  const result = await getVidalPrices({ force });
  if (!result.ok) {
    return NextResponse.json(
      { error: result.message },
      { status: result.reason === 'error' ? 502 : 409 },
    );
  }
  return NextResponse.json(result.data);
}
