import { audit } from '@/lib/audit';
import { getUserId, requireAuth } from '@/lib/auth/server';
import { db } from '@/lib/db';
import { feasibilities } from '@/lib/db/schema';
import { validateInputs } from '@/lib/domain/feasibility';
import { randomUUID } from 'crypto';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { response } = await requireAuth();
  if (response) return response;

  const { id } = await params;
  const [row] = await db.select().from(feasibilities).where(eq(feasibilities.id, id)).limit(1);
  if (!row) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
  return NextResponse.json(row);
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { session, response } = await requireAuth();
  if (response) return response;

  const { id } = await params;
  const body = await req.json();
  const { name, address, neighborhood, date, observations, inputs, currency } = body;

  if (!name?.trim() || !address?.trim() || !date?.trim()) {
    return NextResponse.json(
      { error: 'Nombre, dirección y fecha son obligatorios.' },
      { status: 400 },
    );
  }

  const errors = validateInputs(inputs ?? {});
  if (errors.length) {
    return NextResponse.json({ error: errors.join(' ') }, { status: 400 });
  }

  const userId = getUserId(session);

  const [row] = await db
    .update(feasibilities)
    .set({
      name: name.trim(),
      address: address.trim(),
      neighborhood: neighborhood?.trim() ?? null,
      date,
      observations: observations?.trim() ?? null,
      inputs,
      currency: currency ?? 'USD',
      updatedBy: userId,
      updatedAt: new Date(),
    })
    .where(eq(feasibilities.id, id))
    .returning();

  if (!row) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });

  await audit(userId, 'update', 'feasibility', id, name);
  return NextResponse.json(row);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { session, response } = await requireAuth();
  if (response) return response;

  const { id } = await params;
  const userId = getUserId(session);

  const [deleted] = await db.delete(feasibilities).where(eq(feasibilities.id, id)).returning();

  if (!deleted) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });

  await audit(userId, 'delete', 'feasibility', id);
  return NextResponse.json({ ok: true });
}

// POST /api/feasibility/[id] with action=duplicate
export async function POST(req: NextRequest, { params }: Params) {
  const { session, response } = await requireAuth();
  if (response) return response;

  const { id } = await params;
  const userId = getUserId(session);

  const [original] = await db.select().from(feasibilities).where(eq(feasibilities.id, id)).limit(1);
  if (!original) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });

  const newId = randomUUID();
  const [copy] = await db
    .insert(feasibilities)
    .values({
      ...original,
      id: newId,
      name: `${original.name} (copia)`,
      createdBy: userId,
      updatedBy: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  await audit(userId, 'create', 'feasibility', newId, `Duplicado de ${original.name}`);
  return NextResponse.json(copy, { status: 201 });
}
