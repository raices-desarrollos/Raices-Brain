import { audit } from '@/lib/audit';
import { getUserId, requireAuth } from '@/lib/auth/server';
import { db } from '@/lib/db';
import { feasibilities } from '@/lib/db/schema';
import { validateInputs } from '@/lib/domain/feasibility';
import { randomUUID } from 'crypto';
import { desc } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  const { session, response } = await requireAuth();
  if (response) return response;

  const rows = await db.select().from(feasibilities).orderBy(desc(feasibilities.updatedAt));

  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const { session, response } = await requireAuth();
  if (response) return response;

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
  const id = randomUUID();

  const [row] = await db
    .insert(feasibilities)
    .values({
      id,
      name: name.trim(),
      address: address.trim(),
      neighborhood: neighborhood?.trim() ?? null,
      date,
      observations: observations?.trim() ?? null,
      inputs,
      currency: currency ?? 'USD',
      createdBy: userId,
      updatedBy: userId,
    })
    .returning();

  await audit(userId, 'create', 'feasibility', id, name);

  return NextResponse.json(row, { status: 201 });
}
