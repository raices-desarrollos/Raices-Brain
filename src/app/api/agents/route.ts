import { requireAdmin } from '@/lib/auth/server';
import { NextResponse } from 'next/server';

export async function POST() {
  const { response } = await requireAdmin();
  if (response) return response;
  return NextResponse.json({ error: 'No disponible todavía.' }, { status: 501 });
}

export async function GET() {
  const { response } = await requireAdmin();
  if (response) return response;
  return NextResponse.json({ error: 'No disponible todavía.' }, { status: 501 });
}
