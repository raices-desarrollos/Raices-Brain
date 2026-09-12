import { requireAuth } from '@/lib/auth/server';
import { getCatalogProject } from '@/lib/domain/catalog';
import { buildPriceListPdf, priceListFileName } from '@/lib/finance/price-pdf';
import { getVidalPrices } from '@/lib/finance/prices';
import { NextResponse } from 'next/server';

export const maxDuration = 60;

type Params = { params: Promise<{ slug: string }> };

export async function GET(req: Request, { params }: Params) {
  const { response } = await requireAuth();
  if (response) return response;

  const { slug } = await params;
  const project = getCatalogProject(slug);
  if (slug !== 'ceibo-vidal' || !project) {
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

  const bytes = await buildPriceListPdf(result.data, {
    projectName: project.name,
    address: project.address,
    city: project.city,
  });

  return new NextResponse(Buffer.from(bytes), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${priceListFileName(project.name)}"`,
      'Cache-Control': 'private, no-store',
    },
  });
}
