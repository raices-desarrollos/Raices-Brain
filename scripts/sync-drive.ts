#!/usr/bin/env tsx
/**
 * sync-drive.ts
 *
 * Descarga archivos de una carpeta de Google Drive al knowledge base local.
 *
 * - Google Docs → exporta como texto plano → guarda como .md
 * - Google Sheets → exporta como CSV
 * - Atajos (shortcuts) → sigue el destino
 * - PDFs y demás → descarga el archivo con su extensión original (sin duplicarla)
 *
 * Uso:
 *   npm run sync:drive
 *   npx tsx scripts/sync-drive.ts
 *
 * Variables necesarias en .env.local:
 *   GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN, GOOGLE_DRIVE_FOLDER_ID
 */

import * as fs from 'fs';
import { google } from 'googleapis';
import * as path from 'path';

function loadEnvLocal() {
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf-8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (key && process.env[key] === undefined) process.env[key] = val;
  }
}

loadEnvLocal();

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;
const FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID;

const MIME = {
  folder: 'application/vnd.google-apps.folder',
  document: 'application/vnd.google-apps.document',
  spreadsheet: 'application/vnd.google-apps.spreadsheet',
  shortcut: 'application/vnd.google-apps.shortcut',
} as const;

/** Nombres de carpetas de Drive que no se sincronizan (minúsculas). */
const SKIP_FOLDER_NAMES = new Set(['estudio de oferta']);

function shouldSkipFolder(name: string): boolean {
  return SKIP_FOLDER_NAMES.has(name.trim().toLowerCase());
}

function assertEnv() {
  const missing = [
    ['GOOGLE_CLIENT_ID', CLIENT_ID],
    ['GOOGLE_CLIENT_SECRET', CLIENT_SECRET],
    ['GOOGLE_REFRESH_TOKEN', REFRESH_TOKEN],
    ['GOOGLE_DRIVE_FOLDER_ID', FOLDER_ID],
  ]
    .filter(([, v]) => !v)
    .map(([k]) => k);

  if (missing.length > 0) {
    console.error('\n❌  Faltan variables en .env.local:');
    missing.forEach((k) => console.error(`    ${k}=...`));
    console.error('\nSeguí la Guía de conexión en el README.\n');
    process.exit(1);
  }
}

function getAuthClient() {
  const auth = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET);
  auth.setCredentials({ refresh_token: REFRESH_TOKEN });
  return auth;
}

function sanitizeFilename(name: string): string {
  return name.replace(/[/\\?%*:|"<>]/g, '-').trim();
}

/** Agrega extensión solo si el nombre todavía no la tiene. */
function withExt(name: string, ext: string): string {
  const safe = sanitizeFilename(name);
  if (!ext) return safe;
  const dotted = ext.startsWith('.') ? ext : `.${ext}`;
  if (safe.toLowerCase().endsWith(dotted.toLowerCase())) return safe;
  return `${safe}${dotted}`;
}

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

type DriveClient = ReturnType<typeof google.drive>;

async function resolveShortcut(
  drive: DriveClient,
  fileId: string,
): Promise<{ id: string; mimeType: string } | null> {
  const meta = await drive.files.get({
    fileId,
    fields: 'shortcutDetails(targetId, targetMimeType)',
    supportsAllDrives: true,
  });
  const targetId = meta.data.shortcutDetails?.targetId;
  const targetMime = meta.data.shortcutDetails?.targetMimeType;
  if (!targetId || !targetMime) return null;
  return { id: targetId, mimeType: targetMime };
}

async function downloadFile(
  drive: DriveClient,
  fileId: string,
  mimeType: string,
  name: string,
  localDir: string,
  depth: number,
) {
  if (mimeType === MIME.document) {
    const filename = withExt(name, '.md');
    const dest = path.join(localDir, filename);
    const exportRes = await drive.files.export(
      { fileId, mimeType: 'text/plain' },
      { responseType: 'text' },
    );
    fs.writeFileSync(dest, exportRes.data as string, 'utf-8');
    console.log(`${'  '.repeat(depth)}✅  ${filename}`);
    return;
  }

  if (mimeType === MIME.spreadsheet) {
    const filename = withExt(name, '.csv');
    const dest = path.join(localDir, filename);
    const exportRes = await drive.files.export(
      { fileId, mimeType: 'text/csv' },
      { responseType: 'text' },
    );
    fs.writeFileSync(dest, exportRes.data as string, 'utf-8');
    console.log(`${'  '.repeat(depth)}✅  ${filename}`);
    return;
  }

  if (mimeType.startsWith('application/vnd.google-apps.')) {
    console.log(`${'  '.repeat(depth)}⏭  ${sanitizeFilename(name)} (tipo Google no soportado)`);
    return;
  }

  const filename = withExt(name, path.extname(name));
  const dest = path.join(localDir, filename);
  const downloadRes = await drive.files.get(
    { fileId, alt: 'media', supportsAllDrives: true },
    { responseType: 'arraybuffer' },
  );
  fs.writeFileSync(dest, Buffer.from(downloadRes.data as ArrayBuffer));
  console.log(`${'  '.repeat(depth)}✅  ${filename}`);
}

async function syncFolder(
  drive: DriveClient,
  folderId: string,
  localDir: string,
  depth = 0,
) {
  ensureDir(localDir);

  const files: Array<{ id?: string | null; name?: string | null; mimeType?: string | null }> = [];
  let pageToken: string | undefined;

  do {
    const res = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: 'nextPageToken, files(id, name, mimeType)',
      pageSize: 200,
      pageToken,
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });
    files.push(...(res.data.files ?? []));
    pageToken = res.data.nextPageToken ?? undefined;
  } while (pageToken);

  console.log(`${'  '.repeat(depth)}📁  ${path.basename(localDir)} (${files.length} archivos)`);

  for (const file of files) {
    let { id, name, mimeType } = file;
    if (!id || !name || !mimeType) continue;

    const safeName = sanitizeFilename(name);

    try {
      if (shouldSkipFolder(name)) {
        console.log(`${'  '.repeat(depth + 1)}⏭  ${safeName} (carpeta excluida)`);
        continue;
      }

      if (mimeType === MIME.shortcut) {
        const target = await resolveShortcut(drive, id);
        if (!target) {
          console.log(`${'  '.repeat(depth + 1)}⏭  ${safeName} (atajo sin destino)`);
          continue;
        }
        id = target.id;
        mimeType = target.mimeType;
        console.log(`${'  '.repeat(depth + 1)}↪  ${safeName} → atajo`);
      }

      if (mimeType === MIME.folder) {
        await syncFolder(drive, id, path.join(localDir, safeName), depth + 1);
        continue;
      }

      await downloadFile(drive, id, mimeType, name, localDir, depth + 1);
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: string }).message)
          : String(err);
      console.log(`${'  '.repeat(depth + 1)}❌  ${safeName} — ${msg}`);
    }
  }
}

async function main() {
  assertEnv();

  const auth = getAuthClient();
  const drive = google.drive({ version: 'v3', auth });
  const dest = path.join(process.cwd(), 'knowledge', 'sync-drive');

  console.log('\n─────────────────────────────────────────────────────────');
  console.log('  Sincronizando Google Drive → knowledge/sync-drive/');
  console.log('─────────────────────────────────────────────────────────\n');

  await syncFolder(drive, FOLDER_ID!, dest);

  console.log('\n✅  Sincronización completa.');
  console.log(`    Archivos en: knowledge/sync-drive/\n`);
}

main().catch((err) => {
  console.error('❌  Error:', err.message ?? err);
  process.exit(1);
});
