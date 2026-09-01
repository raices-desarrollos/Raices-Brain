import { audit } from '@/lib/audit';
import { getUserId, requireAuth } from '@/lib/auth/server';
import { db } from '@/lib/db';
import { documents } from '@/lib/db/schema';
import { getDriveFileMeta } from '@/lib/google/drive';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';

export async function POST(req: NextRequest) {
  const { session, response } = await requireAuth();
  if (response) return response;

  const body = await req.json();
  const driveFileId = String(body.driveFileId ?? '').trim();
  const projectRef = String(body.projectRef ?? 'ceibo-vidal').trim() || 'ceibo-vidal';
  const category = String(body.category ?? 'otro').trim() || 'otro';

  if (!driveFileId) {
    return NextResponse.json({ error: 'Elegí un archivo de Drive.' }, { status: 400 });
  }

  const existing = await db.select().from(documents).where(eq(documents.driveFileId, driveFileId)).limit(1);
  if (existing[0]) {
    const [updated] = await db
      .update(documents)
      .set({ projectRef, category, updatedAt: new Date() })
      .where(eq(documents.id, existing[0].id))
      .returning();
    return NextResponse.json(updated);
  }

  const meta = await getDriveFileMeta(driveFileId);
  if (!meta) {
    return NextResponse.json({ error: 'No se encontró el archivo en Drive.' }, { status: 404 });
  }

  const userId = getUserId(session);
  const [row] = await db
    .insert(documents)
    .values({
      id: randomUUID(),
      name: meta.name,
      description: null,
      category,
      mimeType: meta.mimeType,
      size: meta.size ?? 0,
      storageKey: `drive:${driveFileId}`,
      projectRef,
      driveFileId,
      driveWebViewLink: meta.webViewLink,
      folderPath: null,
      createdBy: userId,
    })
    .returning();

  await audit(userId, 'create', 'document', row.id, `Vinculado ${meta.name}`);
  return NextResponse.json(row, { status: 201 });
}
