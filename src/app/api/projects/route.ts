import { requireAuth } from '@/lib/auth/server';
import { listProjects } from '@/lib/domain/projects';
import { NextResponse } from 'next/server';

export async function GET() {
  const { response } = await requireAuth();
  if (response) return response;
  return NextResponse.json(await listProjects());
}
