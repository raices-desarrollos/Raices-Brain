import { requireAuth } from '@/lib/auth/server';
import { listDriveFiles } from '@/lib/google/drive';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { response } = await requireAuth();
  if (response) return response;

  const folderId = req.nextUrl.searchParams.get('folderId') ?? undefined;
  const query = req.nextUrl.searchParams.get('q') ?? '';

  try {
    const result = await listDriveFiles({ folderId, query });
    return NextResponse.json(result);
  } catch (err) {
    console.error('Drive list error:', err);
    return NextResponse.json(
      {
        configured: false,
        folderId: process.env.GOOGLE_DRIVE_FOLDER_ID ?? null,
        files: [],
        error: 'No se pudo listar Drive. Revisá las credenciales de Google.',
      },
      { status: 200 },
    );
  }
}
