import { requireAuth } from '@/lib/auth/server';
import { db } from '@/lib/db';
import { importCandidates } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { response } = await requireAuth();
  if (response) return response;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') ?? 'PENDING';

  const rows = await db
    .select()
    .from(importCandidates)
    .where(eq(importCandidates.status, status))
    .orderBy(desc(importCandidates.syncedAt));

  return NextResponse.json(rows);
}
