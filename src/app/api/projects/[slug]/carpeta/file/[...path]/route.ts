import { audit } from '@/lib/audit';
import { getUserId, requireAuth } from '@/lib/auth/server';
import { commercialDir, contentTypeFor, getDeckInfo, resolveInside } from '@/lib/commercial/deck';
import { readFile } from 'fs/promises';
import { NextResponse } from 'next/server';

/**
 * Sirve los archivos de la carpeta de venta:
 *   /carpeta/file/index    → el HTML para ver en pantalla
 *   /carpeta/file/pdf      → el PDF, como descarga (?edicion=completa)
 *   /carpeta/file/assets/… → imágenes y planos
 *
 * El HTML referencia sus imágenes con rutas relativas ("assets/foo.png"), que
 * resuelven contra /carpeta/file/ porque lo servimos desde /carpeta/file/index.
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string; path: string[] }> },
) {
  const { session, response } = await requireAuth();
  if (response) return response;

  const { slug, path: segments } = await params;

  const dir = commercialDir(slug);
  if (!dir || !segments?.length) {
    return NextResponse.json({ error: 'Ruta inválida.' }, { status: 400 });
  }

  const info = await getDeckInfo(slug);
  if (!info) {
    return NextResponse.json(
      { error: 'Este proyecto todavía no tiene carpeta de venta.' },
      { status: 404 },
    );
  }

  const complete = new URL(req.url).searchParams.get('edicion') === 'completa';
  let relative = segments;
  let download = false;

  if (segments.length === 1 && segments[0] === 'index') {
    if (!info.htmlName) {
      return NextResponse.json({ error: 'No hay versión web de la carpeta.' }, { status: 404 });
    }
    relative = [info.htmlName];
  } else if (segments.length === 1 && segments[0] === 'pdf') {
    const pdfName = complete ? info.pdfCompleteName ?? info.pdfName : info.pdfName;
    if (!pdfName) {
      return NextResponse.json({ error: 'No hay PDF de la carpeta.' }, { status: 404 });
    }
    relative = [pdfName];
    download = true;
  }

  const target = resolveInside(dir, relative);
  if (!target) return NextResponse.json({ error: 'Ruta inválida.' }, { status: 400 });

  let body: Buffer;
  try {
    body = await readFile(target);
  } catch {
    return NextResponse.json({ error: 'Archivo no encontrado.' }, { status: 404 });
  }

  const headers: Record<string, string> = {
    'Content-Type': contentTypeFor(target),
    'Content-Length': String(body.length),
    'Cache-Control': 'private, max-age=300',
  };

  if (download) {
    await audit(getUserId(session), 'download', 'document', slug, relative[0]);
    headers['Content-Disposition'] = `attachment; filename="${relative[0]}"`;
  }

  return new NextResponse(new Uint8Array(body), { headers });
}
