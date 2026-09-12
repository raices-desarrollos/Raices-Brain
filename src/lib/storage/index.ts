// Storage abstraction: local filesystem (dev) or cloud (prod via STORAGE_PROVIDER env).
// Extensión: implementar 's3' | 'supabase' sin cambiar los contratos de esta API.
import { randomUUID } from 'crypto';
import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { readFile, unlink } from 'fs/promises';
import { join, resolve, sep } from 'path';
import type { Readable } from 'stream';
import { pipeline } from 'stream/promises';

const PROVIDER = process.env.STORAGE_PROVIDER ?? 'local';
const LOCAL_DIR = process.env.STORAGE_LOCAL_DIR ?? join(process.cwd(), 'uploads');
// Max file size: 25 MB
export const MAX_FILE_SIZE = 25 * 1024 * 1024;
export const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
]);

/**
 * Resuelve una clave de storage a una ruta dentro del directorio de uploads.
 * La clave viene de la base, así que la validamos igual: un valor corrupto o
 * manipulado no tiene que poder leer ni borrar archivos de otro lugar.
 */
function localPath(storageKey: string): string {
  const dest = resolve(LOCAL_DIR, storageKey);
  const root = resolve(LOCAL_DIR);
  if (dest !== root && !dest.startsWith(root + sep)) {
    throw new Error('Clave de archivo inválida.');
  }
  return dest;
}

export async function storeFile(
  stream: Readable,
  originalName: string,
  mimeType: string,
): Promise<string> {
  if (PROVIDER === 'local') {
    if (!existsSync(LOCAL_DIR)) mkdirSync(LOCAL_DIR, { recursive: true });
    // La extensión sale del nombre que subió el usuario: nos quedamos solo con
    // letras y números para que no arrastre separadores de ruta.
    const ext = (originalName.split('.').pop() ?? 'bin').replace(/[^a-zA-Z0-9]/g, '').slice(0, 8);
    const key = `${randomUUID()}.${ext || 'bin'}`;
    await pipeline(stream, createWriteStream(localPath(key)));
    return key;
  }
  throw new Error(`Storage provider "${PROVIDER}" not implemented. Set STORAGE_PROVIDER=local.`);
}

// Returns file bytes and mime; caller wraps in HTTP response or signed redirect.
export async function retrieveFile(storageKey: string): Promise<Buffer> {
  if (PROVIDER === 'local') {
    return readFile(localPath(storageKey));
  }
  throw new Error(`Storage provider "${PROVIDER}" not implemented.`);
}

export async function deleteFile(storageKey: string): Promise<void> {
  if (PROVIDER === 'local') {
    const dest = localPath(storageKey);
    if (existsSync(dest)) await unlink(dest);
    return;
  }
  throw new Error(`Storage provider "${PROVIDER}" not implemented.`);
}
