import { audit } from '@/lib/audit';
import { getUserId, requireAuth } from '@/lib/auth/server';
import { db } from '@/lib/db';
import { contacts } from '@/lib/db/schema';
import { randomUUID } from 'crypto';
import { desc, eq, ilike, or } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { response } = await requireAuth();
  if (response) return response;

  const search = req.nextUrl.searchParams.get('q') ?? '';
  const category = req.nextUrl.searchParams.get('category') ?? '';

  let query = db.select().from(contacts).orderBy(desc(contacts.createdAt)).$dynamic();

  if (search) {
    query = query.where(
      or(
        ilike(contacts.name, `%${search}%`),
        ilike(contacts.email, `%${search}%`),
        ilike(contacts.company, `%${search}%`),
      ),
    );
  }
  if (category) {
    query = query.where(eq(contacts.category, category));
  }

  return NextResponse.json(await query);
}

export async function POST(req: NextRequest) {
  const { session, response } = await requireAuth();
  if (response) return response;

  const body = await req.json();
  const { name, company, category, phone, email, notes } = body;

  if (!name?.trim()) return NextResponse.json({ error: 'Nombre es obligatorio.' }, { status: 400 });
  if (!category?.trim())
    return NextResponse.json({ error: 'Categoría es obligatoria.' }, { status: 400 });

  const userId = getUserId(session);
  const id = randomUUID();

  const [row] = await db
    .insert(contacts)
    .values({
      id,
      name: name.trim(),
      company: company?.trim() ?? null,
      category,
      phone: phone?.trim() ?? null,
      email: email?.trim()?.toLowerCase() ?? null,
      notes: notes?.trim() ?? null,
      createdBy: userId,
    })
    .returning();

  await audit(userId, 'create', 'contact', id, name);
  return NextResponse.json(row, { status: 201 });
}
