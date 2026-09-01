import { requireAuth } from '@/lib/auth/server';
import { NextResponse } from 'next/server';

export async function POST() {
  const { response } = await requireAuth();
  if (response) return response;
  return NextResponse.json({ error: 'No disponible todavía.' }, { status: 501 });
}
