import { requireAuth } from '@/lib/auth/server';
import { db } from '@/lib/db';
import { financialSnapshots } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET() {
  const { response } = await requireAuth();
  if (response) return response;

  const configured = !!(
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_REFRESH_TOKEN &&
    process.env.GOOGLE_DRIVE_FOLDER_ID
  );

  const snapshots = await db
    .select()
    .from(financialSnapshots)
    .orderBy(desc(financialSnapshots.syncedAt))
    .limit(20);

  return NextResponse.json({ configured, snapshots });
}
