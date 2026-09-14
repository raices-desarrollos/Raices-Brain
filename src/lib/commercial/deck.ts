import { readdir, stat } from 'fs/promises';
import path from 'path';

/**
 * La carpeta de venta de cada proyecto vive en el repo, en
 * knowledge/projects/<slug>/commercial: un HTML autocontenido para ver en
 * pantalla, el PDF para mandar, y la carpeta assets con imágenes y planos.
 *
 * Hay dos ediciones del mismo HTML: comercial (clientes) y completa
 * (?edicion=completa). Los PDF se eligen por nombre, sin mezclar la versión
 * completa con la que se manda afuera.
 */

export type DeckInfo = {
  slug: string;
  htmlName: string | null;
  /** PDF para clientes (sin precios ni mercado). */
  pdfName: string | null;
  pdfSize: number | null;
  /** PDF interno, con lista de precios. */
  pdfCompleteName: string | null;
  pdfCompleteSize: number | null;
  hasHtml: boolean;
  modifiedTime: string | null;
};

export function commercialDir(slug: string): string | null {
  if (!/^[a-z0-9-]+$/i.test(slug)) return null;
  return path.join(process.cwd(), 'knowledge', 'projects', slug, 'commercial');
}

/** HTML de la carpeta de venta. No usa la de inversores. */
export function pickCarpetaHtml(files: string[]): string | null {
  const htmls = files.filter((f) => f.toLowerCase().endsWith('.html') && !/inversor/i.test(f));
  const exact = htmls.find((f) => /^carpeta-de-venta\.html$/i.test(f));
  if (exact) return exact;
  return htmls.find((f) => /carpeta[-_ ]?de[-_ ]?venta/i.test(f)) ?? null;
}

/** Separa el PDF de clientes del PDF completo. */
export function pickCarpetaPdfs(files: string[]): { commercial: string | null; complete: string | null } {
  const carpeta = files.filter(
    (f) => f.toLowerCase().endsWith('.pdf') && /carpeta[-_ ]?de[-_ ]?venta/i.test(f),
  );
  return {
    complete: carpeta.find((f) => /completa/i.test(f)) ?? null,
    commercial: carpeta.find((f) => !/completa/i.test(f)) ?? null,
  };
}

async function fileSize(dir: string, name: string | null): Promise<number | null> {
  if (!name) return null;
  try {
    return (await stat(path.join(dir, name))).size;
  } catch {
    return null;
  }
}

export async function getDeckInfo(slug: string): Promise<DeckInfo | null> {
  const dir = commercialDir(slug);
  if (!dir) return null;

  let entries: string[];
  try {
    entries = await readdir(dir);
  } catch {
    return null;
  }

  const htmlName = pickCarpetaHtml(entries);
  const pdfs = pickCarpetaPdfs(entries);
  if (!htmlName && !pdfs.commercial && !pdfs.complete) return null;

  let modifiedTime: string | null = null;
  const reference = htmlName ?? pdfs.commercial ?? pdfs.complete;
  if (reference) {
    try {
      modifiedTime = (await stat(path.join(dir, reference))).mtime.toISOString();
    } catch {
      // sin fecha
    }
  }

  const [pdfSize, pdfCompleteSize] = await Promise.all([
    fileSize(dir, pdfs.commercial),
    fileSize(dir, pdfs.complete),
  ]);

  return {
    slug,
    htmlName,
    pdfName: pdfs.commercial,
    pdfSize,
    pdfCompleteName: pdfs.complete,
    pdfCompleteSize,
    hasHtml: !!htmlName,
    modifiedTime,
  };
}

const CONTENT_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.gif': 'image/gif',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.woff2': 'font/woff2',
};

export function contentTypeFor(file: string): string {
  return CONTENT_TYPES[path.extname(file).toLowerCase()] ?? 'application/octet-stream';
}

/**
 * Resuelve una ruta relativa dentro de la carpeta comercial del proyecto.
 * Devuelve null si intenta salirse del directorio.
 */
export function resolveInside(dir: string, segments: string[]): string | null {
  const target = path.resolve(dir, ...segments);
  const root = path.resolve(dir);
  if (target !== root && !target.startsWith(root + path.sep)) return null;
  return target;
}
