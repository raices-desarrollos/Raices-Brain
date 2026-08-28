// Storage abstraction: local filesystem (dev) or cloud (prod via STORAGE_PROVIDER env).
// Extensión: implementar 's3' | 'supabase' sin cambiar los contratos de esta API.
import { randomUUID } from 'crypto';
import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { readFile, unlink } from 'fs/promises';
import { join } from 'path';
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

export async function storeFile(
  stream: Readable,
  originalName: string,
  mimeType: string,
): Promise<string> {
  if (PROVIDER === 'local') {
    if (!existsSync(LOCAL_DIR)) mkdirSync(LOCAL_DIR, { recursive: true });
    const ext = originalName.split('.').pop() ?? 'bin';
    const key = `${randomUUID()}.${ext}`;
    const dest = join(LOCAL_DIR, key);
    await pipeline(stream, createWriteStream(dest));
    return key;
  }
  throw new Error(`Storage provider "${PROVIDER}" not implemented. Set STORAGE_PROVIDER=local.`);
}

// Returns file bytes and mime; caller wraps in HTTP response or signed redirect.
export async function retrieveFile(storageKey: string): Promise<Buffer> {
  if (PROVIDER === 'local') {
    const dest = join(LOCAL_DIR, storageKey);
    return readFile(dest);
  }
  throw new Error(`Storage provider "${PROVIDER}" not implemented.`);
}

export async function deleteFile(storageKey: string): Promise<void> {
  if (PROVIDER === 'local') {
    const dest = join(LOCAL_DIR, storageKey);
    if (existsSync(dest)) await unlink(dest);
    return;
  }
  throw new Error(`Storage provider "${PROVIDER}" not implemented.`);
}
