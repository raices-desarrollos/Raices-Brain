import { authOptions } from '@/lib/auth/options';
import type { Session } from 'next-auth';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

export async function requireAuth() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return {
      session: null,
      response: NextResponse.json({ error: 'No autorizado' }, { status: 401 }),
    };
  }
  return { session, response: null };
}

export function getUserId(session: Session | null): string | null {
  return session?.user?.id ?? null;
}
