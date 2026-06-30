#!/usr/bin/env tsx
/**
 * sync-drive.ts
 *
 * Descarga archivos de una carpeta de Google Drive al knowledge base local.
 *
 * - Google Docs → exporta como texto plano → guarda como .md
 * - PDFs         → descarga el archivo → guarda en knowledge/documents/
 * - Otros        → descarga el archivo → guarda en knowledge/documents/
 *
 * Uso:
 *   npx tsx scripts/sync-drive.ts
 *
 * Variables necesarias en .env.local:
 *   GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN, GOOGLE_DRIVE_FOLDER_ID
 */

import * as fs from 'fs';
import { google } from 'googleapis';
import * as path from 'path';

// ─── Configuración ────────────────────────────────────────────────────────────

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;
const FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID;

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

// ─── Autenticación ────────────────────────────────────────────────────────────

function getAuthClient() {
  const auth = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET);
  auth.setCredentials({ refresh_token: REFRESH_TOKEN });
  return auth;
}

// ─── Utilidades ───────────────────────────────────────────────────────────────

function sanitizeFilename(name: string): string {
  return name.replace(/[/\\?%*:|"<>]/g, '-').trim();
}

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// ─── Descarga recursiva ───────────────────────────────────────────────────────

async function syncFolder(
  drive: ReturnType<typeof google.drive>,
  folderId: string,
  localDir: string,
  depth = 0,
) {
  ensureDir(localDir);

  const res = await drive.files.list({
    q: `'${folderId}' in parents and trashed = false`,
    fields: 'files(id, name, mimeType)',
    pageSize: 200,
  });

  const files = res.data.files ?? [];
  console.log(`${'  '.repeat(depth)}📁  ${path.basename(localDir)} (${files.length} archivos)`);

  for (const file of files) {
    const { id, name, mimeType } = file;
    if (!id || !name || !mimeType) continue;

    const safeName = sanitizeFilename(name);

    // Subcarpeta → recursión
    if (mimeType === 'application/vnd.google-apps.folder') {
      await syncFolder(drive, id, path.join(localDir, safeName), depth + 1);
      continue;
    }

    // Google Docs → exportar como texto plano → .md
    if (mimeType === 'application/vnd.google-apps.document') {
      const dest = path.join(localDir, `${safeName}.md`);
      const exportRes = await drive.files.export(
        { fileId: id, mimeType: 'text/plain' },
        { responseType: 'text' },
      );
      fs.writeFileSync(dest, exportRes.data as string, 'utf-8');
      console.log(`${'  '.repeat(depth + 1)}✅  ${safeName}.md`);
      continue;
    }

    // Google Sheets → exportar como CSV
    if (mimeType === 'application/vnd.google-apps.spreadsheet') {
      const dest = path.join(localDir, `${safeName}.csv`);
      const exportRes = await drive.files.export(
        { fileId: id, mimeType: 'text/csv' },
        { responseType: 'text' },
      );
      fs.writeFileSync(dest, exportRes.data as string, 'utf-8');
      console.log(`${'  '.repeat(depth + 1)}✅  ${safeName}.csv`);
      continue;
    }

    // Archivos binarios (PDF, XLSX, imágenes, etc.) → descargar tal cual
    const ext = path.extname(name) || '';
    const dest = path.join(localDir, `${safeName}${ext}`);

    const downloadRes = await drive.files.get(
      { fileId: id, alt: 'media' },
      { responseType: 'arraybuffer' },
    );
    fs.writeFileSync(dest, Buffer.from(downloadRes.data as ArrayBuffer));
    console.log(`${'  '.repeat(depth + 1)}✅  ${safeName}${ext}`);
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

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
