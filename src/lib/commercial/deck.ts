import { stat } from 'fs/promises';
import path from 'path';

/**
 * La carpeta de venta de cada proyecto vive en el repo, en
 * knowledge/projects/<slug>/commercial: un HTML autocontenido para ver en
 * pantalla, el PDF para mandar, y la carpeta assets con imágenes y planos.
 */

const HTML_CANDIDATES = ['carpeta-de-venta.html'];

export type DeckInfo = {
  slug: string;
  /** Nombre del PDF descargable. */
  pdfName: string | null;
  pdfSize: number | null;
  hasHtml: boolean;
  modifiedTime: string | null;
};

export function commercialDir(slug: string): string | null {
  // El slug viene de la URL: nos aseguramos de que no escape del directorio.
  if (!/^[a-z0-9-]+$/i.test(slug)) return null;
  return path.join(process.cwd(), 'knowledge', 'projects', slug, 'commercial');
}

async function firstExisting(dir: string, names: string[]): Promise<string | null> {
  for (const name of names) {
    try {
      const info = await stat(path.join(dir, name));
      if (info.isFile()) return name;
    } catch {
      // seguimos probando
    }
  }
  return null;
}

/** El PDF de la carpeta de venta, prefiriendo el que lleva el nombre del proyecto. */
async function findPdf(dir: string, slug: string): Promise<string | null> {
  const { readdir } = await import('fs/promises');
  let entries: string[];
  try {
    entries = await readdir(dir);
  } catch {
    return null;
  }

  const pdfs = entries.filter((f) => f.toLowerCase().endsWith('.pdf'));
  if (!pdfs.length) return null;

  const preferred = pdfs.find((f) => /carpeta[-_ ]?de[-_ ]?venta/i.test(f));
  if (preferred) return preferred;

  const bySlug = pdfs.find((f) => f.toLowerCase().includes(slug.toLowerCase()));
  return bySlug ?? pdfs[0];
}

export async function getDeckInfo(slug: string): Promise<DeckInfo | null> {
  const dir = commercialDir(slug);
  if (!dir) return null;

  const html = await firstExisting(dir, HTML_CANDIDATES);
  const pdfName = await findPdf(dir, slug);
  if (!html && !pdfName) return null;

  let pdfSize: number | null = null;
  let modifiedTime: string | null = null;

  const reference = html ?? pdfName;
  if (reference) {
    try {
      const info = await stat(path.join(dir, reference));
      modifiedTime = info.mtime.toISOString();
    } catch {
      // sin fecha
    }
  }
  if (pdfName) {
    try {
      pdfSize = (await stat(path.join(dir, pdfName))).size;
    } catch {
      // sin tamaño
    }
  }

  return { slug, pdfName, pdfSize, hasHtml: !!html, modifiedTime };
}

export function htmlFileName(): string {
  return HTML_CANDIDATES[0];
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
