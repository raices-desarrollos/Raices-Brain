import { audit } from '@/lib/audit';
import { getUserId, requireAuth } from '@/lib/auth/server';
import { db } from '@/lib/db';
import { payments } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { response } = await requireAuth();
  if (response) return response;

  const { id } = await params;
  const [row] = await db.select().from(payments).where(eq(payments.id, id)).limit(1);
  if (!row) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
  return NextResponse.json(row);
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { session, response } = await requireAuth();
  if (response) return response;

  const { id } = await params;
  const body = await req.json();
  const {
    concept,
    amount,
    currency,
    type,
    category,
    dueDate,
    paidDate,
    status,
    contactId,
    projectRef,
    observations,
  } = body;

  if (!concept?.trim())
    return NextResponse.json({ error: 'Concepto es obligatorio.' }, { status: 400 });

  const userId = getUserId(session);
  const [row] = await db
    .update(payments)
    .set({
      concept: concept.trim(),
      amount: Number(amount),
      currency: currency ?? 'USD',
      type,
      category,
      dueDate: dueDate || null,
      paidDate: paidDate || null,
      status,
      contactId: contactId || null,
      projectRef: projectRef?.trim() || null,
      observations: observations?.trim() || null,
      updatedBy: userId,
      updatedAt: new Date(),
    })
    .where(eq(payments.id, id))
    .returning();

  if (!row) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
  await audit(userId, 'update', 'payment', id, concept);
  return NextResponse.json(row);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { session, response } = await requireAuth();
  if (response) return response;

  const { id } = await params;
  const userId = getUserId(session);

  const [deleted] = await db.delete(payments).where(eq(payments.id, id)).returning();
  if (!deleted) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });

  await audit(userId, 'delete', 'payment', id);
  return NextResponse.json({ ok: true });
}
