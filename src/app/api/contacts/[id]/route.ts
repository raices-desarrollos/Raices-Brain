import { audit } from '@/lib/audit';
import { getUserId, requireAuth } from '@/lib/auth/server';
import { db } from '@/lib/db';
import { contacts } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { response } = await requireAuth();
  if (response) return response;

  const { id } = await params;
  const [row] = await db.select().from(contacts).where(eq(contacts.id, id)).limit(1);
  if (!row) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
  return NextResponse.json(row);
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { session, response } = await requireAuth();
  if (response) return response;

  const { id } = await params;
  const body = await req.json();
  const { name, company, category, phone, email, notes } = body;

  if (!name?.trim()) return NextResponse.json({ error: 'Nombre es obligatorio.' }, { status: 400 });

  const userId = getUserId(session);
  const [row] = await db
    .update(contacts)
    .set({
      name: name.trim(),
      company: company?.trim() ?? null,
      category,
      phone: phone?.trim() ?? null,
      email: email?.trim()?.toLowerCase() ?? null,
      notes: notes?.trim() ?? null,
      updatedAt: new Date(),
    })
    .where(eq(contacts.id, id))
    .returning();

  if (!row) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
  await audit(userId, 'update', 'contact', id, name);
  return NextResponse.json(row);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { session, response } = await requireAuth();
  if (response) return response;

  const { id } = await params;
  const userId = getUserId(session);

  const [deleted] = await db.delete(contacts).where(eq(contacts.id, id)).returning();
  if (!deleted) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });

  await audit(userId, 'delete', 'contact', id);
  return NextResponse.json({ ok: true });
}
