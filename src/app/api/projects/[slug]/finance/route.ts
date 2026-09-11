import { requireAuth } from '@/lib/auth/server';
import { getVidalFinance } from '@/lib/finance/vidal';
import { NextResponse, type NextRequest } from 'next/server';

export const maxDuration = 60;

type Params = { params: Promise<{ slug: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { response } = await requireAuth();
  if (response) return response;

  const { slug } = await params;
  // Las planillas de administración son del desarrollo de Vidal.
  if (slug !== 'ceibo-vidal') {
    return NextResponse.json(
      { error: 'Este proyecto todavía no tiene planillas de administración.' },
      { status: 404 },
    );
  }

  const force = req.nextUrl.searchParams.get('refresh') === '1';
  const result = await getVidalFinance({ force });

  if (!result.ok) {
    return NextResponse.json(
      { error: result.message, reason: result.reason },
      { status: result.reason === 'error' ? 502 : 409 },
    );
  }

  return NextResponse.json({ ...result.data, cached: result.cached });
}
