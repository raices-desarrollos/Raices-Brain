import { audit } from '@/lib/audit';
import { getUserId, requireAuth } from '@/lib/auth/server';
import { db } from '@/lib/db';
import { documents } from '@/lib/db/schema';
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE, storeFile } from '@/lib/storage';
import { randomUUID } from 'crypto';
import { desc } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { Readable } from 'stream';

export async function GET(req: NextRequest) {
  const { response } = await requireAuth();
  if (response) return response;

  const rows = await db.select().from(documents).orderBy(desc(documents.createdAt));
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const { session, response } = await requireAuth();
  if (response) return response;

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  const category = formData.get('category') as string | null;
  const description = formData.get('description') as string | null;
  const contactId = formData.get('contactId') as string | null;
  const paymentId = formData.get('paymentId') as string | null;
  const feasibilityId = formData.get('feasibilityId') as string | null;
  const projectRef = formData.get('projectRef') as string | null;

  if (!file) return NextResponse.json({ error: 'Archivo requerido.' }, { status: 400 });
  if (!category) return NextResponse.json({ error: 'Categoría requerida.' }, { status: 400 });

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: 'El archivo supera el límite de 25 MB.' }, { status: 400 });
  }
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return NextResponse.json({ error: 'Tipo de archivo no permitido.' }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const readable = Readable.from(Buffer.from(bytes));
  const storageKey = await storeFile(readable, file.name, file.type);

  const userId = getUserId(session);
  const id = randomUUID();

  const [row] = await db
    .insert(documents)
    .values({
      id,
      name: file.name,
      description: description?.trim() || null,
      category,
      mimeType: file.type,
      size: file.size,
      storageKey,
      contactId: contactId || null,
      paymentId: paymentId || null,
      feasibilityId: feasibilityId || null,
      projectRef: projectRef?.trim() || null,
      createdBy: userId,
    })
    .returning();

  await audit(userId, 'upload', 'document', id, file.name);
  return NextResponse.json(row, { status: 201 });
}
