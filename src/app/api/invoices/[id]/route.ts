import { audit } from '@/lib/audit';
import { getUserId, requireAuth } from '@/lib/auth/server';
import { db } from '@/lib/db';
import { invoices } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { response } = await requireAuth();
  if (response) return response;
  const { id } = await params;
  const [row] = await db.select().from(invoices).where(eq(invoices.id, id)).limit(1);
  if (!row) return NextResponse.json({ error: 'No encontrada' }, { status: 404 });
  return NextResponse.json(row);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { session, response } = await requireAuth();
  if (response) return response;

  const { id } = await params;
  const body = await req.json();
  const userId = getUserId(session);

  const [row] = await db
    .update(invoices)
    .set({
      notes: body.notes ?? undefined,
      updatedBy: userId,
      updatedAt: new Date(),
    })
    .where(eq(invoices.id, id))
    .returning();

  if (!row) return NextResponse.json({ error: 'No encontrada' }, { status: 404 });
  await audit(userId, 'update', 'invoice', id);
  return NextResponse.json(row);
}
