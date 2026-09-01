import { requireAuth } from '@/lib/auth/server';
import { db } from '@/lib/db';
import { units } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { response } = await requireAuth();
  if (response) return response;

  const project = req.nextUrl.searchParams.get('project') ?? '';

  try {
    const rows = project
      ? await db.select().from(units).where(eq(units.projectRef, project))
      : await db.select().from(units);
    return NextResponse.json(rows);
  } catch {
    return NextResponse.json([]);
  }
}
