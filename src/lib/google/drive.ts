import { google, type drive_v3 } from 'googleapis';
import { Readable } from 'stream';
import { pdfToText } from '@/lib/pdf';

export type DriveFile = {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime: string | null;
  webViewLink: string | null;
  size: number | null;
  isFolder: boolean;
  parents: string[];
};

const FOLDER_MIME = 'application/vnd.google-apps.folder';

export function isDriveConfigured(): boolean {
  return !!(
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_REFRESH_TOKEN &&
    process.env.GOOGLE_DRIVE_FOLDER_ID
  );
}

export function getDriveClient(): drive_v3.Drive | null {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
  if (!clientId || !clientSecret || !refreshToken) return null;

  const auth = new google.auth.OAuth2(clientId, clientSecret);
  auth.setCredentials({ refresh_token: refreshToken });
  return google.drive({ version: 'v3', auth });
}

function mapFile(f: drive_v3.Schema$File): DriveFile | null {
  if (!f.id || !f.name || !f.mimeType) return null;
  return {
    id: f.id,
    name: f.name,
    mimeType: f.mimeType,
    modifiedTime: f.modifiedTime ?? null,
    webViewLink: f.webViewLink ?? null,
    size: f.size ? Number(f.size) : null,
    isFolder: f.mimeType === FOLDER_MIME,
    parents: f.parents ?? [],
  };
}

export async function listDriveFiles(options: {
  folderId?: string;
  query?: string;
  pageSize?: number;
}): Promise<{
  configured: boolean;
  folderId: string | null;
  files: DriveFile[];
  searched: boolean;
}> {
  const rootId = process.env.GOOGLE_DRIVE_FOLDER_ID ?? null;
  const drive = getDriveClient();
  if (!drive || !rootId) {
    return { configured: false, folderId: rootId, files: [], searched: false };
  }

  const folderId = options.folderId || rootId;
  const query = options.query?.trim();
  const escaped = query ? query.replace(/'/g, "\\'") : '';

  const q = query
    ? `trashed = false and (name contains '${escaped}')`
    : `'${folderId}' in parents and trashed = false`;

  const res = await drive.files.list({
    q,
    fields: 'files(id, name, mimeType, modifiedTime, webViewLink, size, parents)',
    pageSize: options.pageSize ?? 100,
    orderBy: query ? 'modifiedTime desc' : 'folder,name',
  });

  const files = (res.data.files ?? []).map(mapFile).filter((f): f is DriveFile => f !== null);
  if (!query) {
    files.sort((a, b) => Number(b.isFolder) - Number(a.isFolder) || a.name.localeCompare(b.name, 'es'));
  }

  return { configured: true, folderId, files, searched: Boolean(query) };
}

export async function searchDriveByName(query: string): Promise<DriveFile[]> {
  const drive = getDriveClient();
  if (!drive || !query.trim()) return [];
  const q = query.trim().replace(/'/g, "\\'");
  const res = await drive.files.list({
    q: `name contains '${q}' and trashed = false`,
    fields: 'files(id, name, mimeType, modifiedTime, webViewLink, size, parents)',
    pageSize: 30,
    orderBy: 'modifiedTime desc',
  });
  return (res.data.files ?? []).map(mapFile).filter((f): f is DriveFile => f !== null && !f.isFolder);
}

export async function getDriveFileMeta(fileId: string): Promise<DriveFile | null> {
  const drive = getDriveClient();
  if (!drive) return null;
  const res = await drive.files.get({
    fileId,
    fields: 'id, name, mimeType, modifiedTime, webViewLink, size, parents',
  });
  return mapFile(res.data);
}

export async function findOrCreateFolder(parentId: string, name: string): Promise<string | null> {
  const drive = getDriveClient();
  if (!drive) return null;

  const existing = await drive.files.list({
    q: `'${parentId}' in parents and name = '${name.replace(/'/g, "\\'")}' and mimeType = '${FOLDER_MIME}' and trashed = false`,
    fields: 'files(id)',
    pageSize: 1,
  });
  const found = existing.data.files?.[0]?.id;
  if (found) return found;

  const created = await drive.files.create({
    requestBody: {
      name,
      mimeType: FOLDER_MIME,
      parents: [parentId],
    },
    fields: 'id',
  });
  return created.data.id ?? null;
}

export async function resolveProjectFolder(projectSlug: string): Promise<string | null> {
  const rootId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  const drive = getDriveClient();
  if (!drive || !rootId) return null;

  const listed = await listDriveFiles({ folderId: rootId, pageSize: 100 });
  const needle = projectSlug.replace(/-/g, ' ');
  const match = listed.files.find(
    (f) => f.isFolder && f.name.toLowerCase().includes(needle.split(' ')[0] ?? 'ceibo'),
  );
  if (match) return match.id;

  const meta = await getDriveFileMeta(rootId);
  if (meta && /ceibo/i.test(meta.name) && projectSlug.includes('ceibo')) return rootId;

  const label = projectSlug === 'ceibo-vidal' ? 'Ceibo Vidal' : projectSlug;
  return (await findOrCreateFolder(rootId, label)) ?? rootId;
}

export async function uploadInvoiceToDrive(options: {
  name: string;
  mimeType: string;
  body: Buffer;
  projectSlug: string;
}): Promise<{ id: string; webViewLink: string | null; folderPath: string } | null> {
  const projectFolder = await resolveProjectFolder(options.projectSlug);
  const invoicesFolder =
    process.env.GOOGLE_DRIVE_INVOICES_FOLDER_ID ||
    (projectFolder ? await findOrCreateFolder(projectFolder, 'Facturas') : null);
  const uploaded = await uploadToDrive({
    name: options.name,
    mimeType: options.mimeType,
    body: options.body,
    parentId: invoicesFolder ?? undefined,
  });
  if (!uploaded) return null;
  return { ...uploaded, folderPath: 'Ceibo Vidal / Facturas' };
}

export async function getDriveFileText(fileId: string): Promise<{
  name: string;
  mimeType: string;
  webViewLink: string | null;
  text: string | null;
  note: string;
}> {
  const drive = getDriveClient();
  const meta = await getDriveFileMeta(fileId);
  if (!drive || !meta) {
    return { name: '', mimeType: '', webViewLink: null, text: null, note: 'Drive no disponible.' };
  }

  try {
    if (meta.mimeType === 'application/vnd.google-apps.document') {
      const exportRes = await drive.files.export(
        { fileId, mimeType: 'text/plain' },
        { responseType: 'text' },
      );
      const text = String(exportRes.data ?? '');
      return {
        name: meta.name,
        mimeType: meta.mimeType,
        webViewLink: meta.webViewLink,
        text: text.slice(0, 12000),
        note: 'Texto exportado de Google Doc.',
      };
    }

    if (meta.mimeType === 'application/pdf' || meta.name.toLowerCase().endsWith('.pdf')) {
      const downloadRes = await drive.files.get(
        { fileId, alt: 'media' },
        { responseType: 'arraybuffer' },
      );
      const text = await pdfToText(Buffer.from(downloadRes.data as ArrayBuffer));
      return {
        name: meta.name,
        mimeType: meta.mimeType,
        webViewLink: meta.webViewLink,
        text: text.slice(0, 12000),
        note: text
          ? 'Texto extraído del PDF.'
          : 'PDF sin texto extraíble (puede ser un escaneo).',
      };
    }

    return {
      name: meta.name,
      mimeType: meta.mimeType,
      webViewLink: meta.webViewLink,
      text: null,
      note: 'Este tipo de archivo no se lee en Brain todavía. Abrilo en Drive.',
    };
  } catch (err) {
    return {
      name: meta.name,
      mimeType: meta.mimeType,
      webViewLink: meta.webViewLink,
      text: null,
      note: err instanceof Error ? err.message : 'No se pudo leer el archivo.',
    };
  }
}

export async function uploadToDrive(options: {
  name: string;
  mimeType: string;
  body: Buffer;
  parentId?: string;
}): Promise<{ id: string; webViewLink: string | null } | null> {
  const drive = getDriveClient();
  const rootId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  if (!drive || !rootId) return null;

  const parentId = options.parentId || rootId;

  const created = await drive.files.create({
    requestBody: {
      name: options.name,
      parents: [parentId],
    },
    media: {
      mimeType: options.mimeType,
      body: Readable.from(options.body),
    },
    fields: 'id, webViewLink',
  });

  if (!created.data.id) return null;
  return { id: created.data.id, webViewLink: created.data.webViewLink ?? null };
}
