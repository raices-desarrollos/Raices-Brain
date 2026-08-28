import { audit } from '@/lib/audit';
import { getUserId, requireAuth } from '@/lib/auth/server';
import { db } from '@/lib/db';
import { importCandidates, tasks } from '@/lib/db/schema';
import { randomUUID } from 'crypto';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

type Params = { params: Promise<{ id: string }> };

// PUT: confirm, discard, or edit a candidate
export async function PUT(req: NextRequest, { params }: Params) {
  const { session, response } = await requireAuth();
  if (response) return response;
  const userId = getUserId(session);

  const { id } = await params;
  const body = await req.json();
  const { action, title, assignedTo, projectRef, dueDate } = body;

  const [candidate] = await db
    .select()
    .from(importCandidates)
    .where(eq(importCandidates.id, id))
    .limit(1);
  if (!candidate) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });

  if (action === 'discard') {
    await db
      .update(importCandidates)
      .set({ status: 'DISCARDED' })
      .where(eq(importCandidates.id, id));
    return NextResponse.json({ ok: true });
  }

  if (action === 'confirm') {
    const taskTitle = (title ?? candidate.suggestedTitle ?? candidate.originalText).trim();

    // Create the actual task
    const taskId = randomUUID();
    await db.insert(tasks).values({
      id: taskId,
      title: taskTitle,
      status: 'TODO',
      assignedTo: assignedTo ?? candidate.aiAssignee ?? null,
      projectRef: projectRef ?? candidate.aiProjectRef ?? null,
      dueDate: dueDate ?? null,
      origin: 'IMPORTED',
      originalText: candidate.originalText,
      docId: candidate.docId,
      importHash: candidate.importHash,
      createdBy: userId,
    });

    await db
      .update(importCandidates)
      .set({ status: 'CONFIRMED', taskId })
      .where(eq(importCandidates.id, id));

    await audit(userId, 'create', 'task', taskId, taskTitle);
    return NextResponse.json({ ok: true, taskId });
  }

  return NextResponse.json({ error: 'Acción inválida. Usar: confirm | discard' }, { status: 400 });
}
