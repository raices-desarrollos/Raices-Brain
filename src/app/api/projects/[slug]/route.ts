import { requireAuth } from '@/lib/auth/server';
import { getProjectBySlug, setProjectStage } from '@/lib/domain/projects';
import { getStage } from '@/lib/domain/stages';
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

export async function PATCH(req: Request, { params }: Params) {
  const { response } = await requireAuth();
  if (response) return response;

  const { slug } = await params;
  const body = (await req.json().catch(() => null)) as { stageId?: string } | null;
  const stageId = String(body?.stageId ?? '').trim();

  if (!getStage(stageId)) {
    return NextResponse.json({ error: 'Esa etapa no existe.' }, { status: 400 });
  }

  const project = await setProjectStage(slug, stageId);
  if (!project) return NextResponse.json({ error: 'Proyecto no encontrado' }, { status: 404 });
  return NextResponse.json(project);
}
