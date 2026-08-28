import { audit } from '@/lib/audit';
import { getUserId, requireAuth } from '@/lib/auth/server';
import { db } from '@/lib/db';
import { documents } from '@/lib/db/schema';
import { deleteFile } from '@/lib/storage';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { session, response } = await requireAuth();
  if (response) return response;

  const { id } = await params;
  const userId = getUserId(session);

  const [doc] = await db.select().from(documents).where(eq(documents.id, id)).limit(1);
  if (!doc) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });

  await deleteFile(doc.storageKey);
  await db.delete(documents).where(eq(documents.id, id));
  await audit(userId, 'delete', 'document', id, doc.name);

  return NextResponse.json({ ok: true });
}
