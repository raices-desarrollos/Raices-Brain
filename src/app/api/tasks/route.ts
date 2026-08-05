import { audit } from '@/lib/audit';
import { getUserId, requireAuth } from '@/lib/auth/server';
import { db } from '@/lib/db';
import { meetings, tasks } from '@/lib/db/schema';
import { randomUUID } from 'crypto';
import { desc, eq, or } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { session, response } = await requireAuth();
  if (response) return response;

  const { searchParams } = new URL(req.url);
  const mine = searchParams.get('mine') === 'true';
  const status = searchParams.get('status');

  const userId = getUserId(session);
  const userEmail = session!.user?.email ?? '';

  let rows = await db.select().from(tasks).orderBy(desc(tasks.createdAt));

  if (mine) {
    rows = rows.filter(
      (t) =>
        t.assignedTo === userEmail ||
        t.assignedTo === session!.user?.name ||
        t.createdBy === userId,
    );
  }
  if (status) {
    rows = rows.filter((t) => t.status === status);
  }

  // Enrich with meeting info
  const meetingIds = [...new Set(rows.map((t) => t.meetingId).filter(Boolean))] as string[];
  const meetingRows =
    meetingIds.length > 0
      ? await db
          .select()
          .from(meetings)
          .where(or(...meetingIds.map((id) => eq(meetings.id, id))))
      : [];
  const meetingMap = Object.fromEntries(meetingRows.map((m) => [m.id, m]));

  return NextResponse.json(
    rows.map((t) => ({
      ...t,
      meeting: t.meetingId ? (meetingMap[t.meetingId] ?? null) : null,
    })),
  );
}

export async function POST(req: NextRequest) {
  const { session, response } = await requireAuth();
  if (response) return response;
  const userId = getUserId(session);

  const body = await req.json();
  const {
    title,
    description,
    assignedTo,
    projectRef,
    dueDate,
    origin,
    meetingId,
    originalText,
    docId,
  } = body;

  if (!title?.trim()) {
    return NextResponse.json({ error: 'El título es obligatorio.' }, { status: 400 });
  }

  const id = randomUUID();
  await db.insert(tasks).values({
    id,
    title: title.trim(),
    description: description?.trim() || null,
    status: 'TODO',
    assignedTo: assignedTo?.trim() || null,
    projectRef: projectRef?.trim() || null,
    dueDate: dueDate || null,
    origin: origin ?? 'MANUAL',
    meetingId: meetingId || null,
    originalText: originalText || null,
    docId: docId || null,
    createdBy: userId,
  });

  await audit(userId, 'create', 'task', id, title);
  return NextResponse.json({ id });
}
