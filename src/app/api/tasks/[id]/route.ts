import { audit } from '@/lib/audit';
import { getUserId, requireAuth } from '@/lib/auth/server';
import { db } from '@/lib/db';
import { tasks } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { response } = await requireAuth();
  if (response) return response;

  const { id } = await params;
  const [task] = await db.select().from(tasks).where(eq(tasks.id, id)).limit(1);
  if (!task) return NextResponse.json({ error: 'No encontrada' }, { status: 404 });
  return NextResponse.json(task);
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { session, response } = await requireAuth();
  if (response) return response;
  const userId = getUserId(session);

  const { id } = await params;
  const body = await req.json();

  const allowed = [
    'title',
    'description',
    'status',
    'assignedTo',
    'projectRef',
    'dueDate',
    'blockedByTaskId',
    'blockedReason',
  ] as const;
  const update: Record<string, unknown> = { updatedAt: new Date() };
  for (const key of allowed) {
    if (key in body) update[key] = body[key];
  }

  await db.update(tasks).set(update).where(eq(tasks.id, id));
  await audit(userId, 'update', 'task', id, body.title ?? id);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { session, response } = await requireAuth();
  if (response) return response;
  const userId = getUserId(session);

  const { id } = await params;
  await db.delete(tasks).where(eq(tasks.id, id));
  await audit(userId, 'delete', 'task', id);
  return NextResponse.json({ ok: true });
}
