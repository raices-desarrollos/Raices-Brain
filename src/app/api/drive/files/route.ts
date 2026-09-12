import { requireAuth } from '@/lib/auth/server';
import { isDriveConfigured, listDriveFiles } from '@/lib/google/drive';
import { NextRequest, NextResponse } from 'next/server';

// Recorre el arbol de carpetas de Drive.
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const { response } = await requireAuth();
  if (response) return response;

  const folderId = req.nextUrl.searchParams.get('folderId') ?? undefined;
  const query = req.nextUrl.searchParams.get('q') ?? '';
  const configured = isDriveConfigured();

  if (!configured) {
    return NextResponse.json({
      configured: false,
      folderId: process.env.GOOGLE_DRIVE_FOLDER_ID ?? null,
      files: [],
      searched: Boolean(query.trim()),
      error: null,
    });
  }

  try {
    const result = await listDriveFiles({ folderId, query });
    return NextResponse.json({ ...result, error: null });
  } catch (err) {
    console.error('[drive/files]', err instanceof Error ? err.message : err);
    return NextResponse.json(
      {
        configured: true,
        folderId: process.env.GOOGLE_DRIVE_FOLDER_ID ?? null,
        files: [],
        searched: Boolean(query.trim()),
        error: 'No se pudieron leer los documentos de Drive. Reintentá en un momento.',
      },
      { status: 200 },
    );
  }
}
