import { requireAuth } from '@/lib/auth/server';
import { getProjectBySlug } from '@/lib/domain/projects';
import { NextResponse } from 'next/server';

type Params = { params: Promise<{ slug: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { response } = await requireAuth();
  if (response) return response;

  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return NextResponse.json({ error: 'Proyecto no encontrado' }, { status: 404 });
  return NextResponse.json(project);
}
