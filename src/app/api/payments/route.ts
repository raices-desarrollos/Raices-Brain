import { audit } from '@/lib/audit';
import { getUserId, requireAuth } from '@/lib/auth/server';
import { db } from '@/lib/db';
import { payments } from '@/lib/db/schema';
import { randomUUID } from 'crypto';
import { desc, eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { response } = await requireAuth();
  if (response) return response;

  const status = req.nextUrl.searchParams.get('status') ?? '';
  const type = req.nextUrl.searchParams.get('type') ?? '';

  let query = db.select().from(payments).orderBy(desc(payments.createdAt)).$dynamic();
  if (status) query = query.where(eq(payments.status, status));
  if (type) query = query.where(eq(payments.type, type));

  return NextResponse.json(await query);
}

export async function POST(req: NextRequest) {
  const { session, response } = await requireAuth();
  if (response) return response;

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
  if (!amount || isNaN(Number(amount)))
    return NextResponse.json({ error: 'Monto inválido.' }, { status: 400 });
  if (!['ingreso', 'egreso'].includes(type))
    return NextResponse.json({ error: 'Tipo debe ser ingreso o egreso.' }, { status: 400 });

  const userId = getUserId(session);
  const id = randomUUID();

  const [row] = await db
    .insert(payments)
    .values({
      id,
      concept: concept.trim(),
      amount: Number(amount),
      currency: currency ?? 'USD',
      type,
      category: category ?? 'otro',
      dueDate: dueDate || null,
      paidDate: paidDate || null,
      status: status ?? 'pendiente',
      contactId: contactId || null,
      projectRef: projectRef?.trim() || null,
      observations: observations?.trim() || null,
      createdBy: userId,
      updatedBy: userId,
    })
    .returning();

  await audit(userId, 'create', 'payment', id, concept);
  return NextResponse.json(row, { status: 201 });
}
