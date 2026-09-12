import { google, type drive_v3 } from 'googleapis';
import { Readable } from 'stream';

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

/**
 * Todas las carpetas que cuelgan de la carpeta raíz del proyecto.
 *
 * El token de OAuth ve todo el Drive de la cuenta, así que sin esto alcanza con
 * pasar el id de cualquier carpeta (o buscar por nombre) para leer archivos que
 * no son del proyecto. Cacheado porque el árbol cambia poco.
 */
const FOLDER_TREE_TTL_MS = 10 * 60 * 1000;
let folderTreeCache: { ids: Set<string>; at: number } | null = null;

async function projectFolderIds(): Promise<Set<string>> {
  const rootId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  const drive = getDriveClient();
  if (!rootId || !drive) return new Set();

  if (folderTreeCache && Date.now() - folderTreeCache.at < FOLDER_TREE_TTL_MS) {
    return folderTreeCache.ids;
  }

  const ids = new Set<string>([rootId]);
  let frontier = [rootId];

  for (let depth = 0; depth < 8 && frontier.length; depth++) {
    const next: string[] = [];
    for (const batch of chunk(frontier, 20)) {
      const q =
        batch.map((id) => `'${id}' in parents`).join(' or ') +
        ` and mimeType = '${FOLDER_MIME}' and trashed = false`;
      const res = await drive.files.list({ q, fields: 'files(id)', pageSize: 200 });
      for (const folder of res.data.files ?? []) {
        if (folder.id && !ids.has(folder.id)) {
          ids.add(folder.id);
          next.push(folder.id);
        }
      }
    }
    frontier = next;
  }

  folderTreeCache = { ids, at: Date.now() };
  return ids;
}

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

/** Si el archivo cuelga de la carpeta del proyecto. */
export async function isInsideProjectFolder(file: {
  id: string;
  parents: string[];
}): Promise<boolean> {
  const allowed = await projectFolderIds();
  if (!allowed.size) return false;
  if (allowed.has(file.id)) return true;
  return file.parents.some((parent) => allowed.has(parent));
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

  const allowed = await projectFolderIds();

  // El folderId llega desde la URL: si no es una carpeta del proyecto, volvemos
  // a la raíz en vez de listar algo ajeno.
  const requested = options.folderId || rootId;
  const folderId = allowed.has(requested) ? requested : rootId;

  const query = options.query?.trim();
  const escaped = query ? query.replace(/'/g, "\\'") : '';

  const q = query
    ? `trashed = false and (name contains '${escaped}')`
    : `'${folderId}' in parents and trashed = false`;

  const res = await drive.files.list({
    q,
    // Pedimos más de lo necesario porque después descartamos lo que no cuelga
    // del proyecto.
    fields: 'files(id, name, mimeType, modifiedTime, webViewLink, size, parents)',
    pageSize: query ? 300 : (options.pageSize ?? 100),
    orderBy: query ? 'modifiedTime desc' : 'folder,name',
  });

  let files = (res.data.files ?? []).map(mapFile).filter((f): f is DriveFile => f !== null);

  // La búsqueda de Drive es global: no acepta restringir por subárbol, así que
  // filtramos acá para no mostrar archivos de fuera del proyecto.
  if (query) {
    files = files
      .filter((f) => allowed.has(f.id) || f.parents.some((p) => allowed.has(p)))
      .slice(0, options.pageSize ?? 100);
  }

  if (!query) {
    files.sort((a, b) => Number(b.isFolder) - Number(a.isFolder) || a.name.localeCompare(b.name, 'es'));
  }

  return { configured: true, folderId, files, searched: Boolean(query) };
}

export async function listRecentDriveFiles(limit = 8): Promise<DriveFile[]> {
  const drive = getDriveClient();
  const rootId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  if (!drive || !rootId) return [];

  const res = await drive.files.list({
    q: `'${rootId}' in parents and trashed = false`,
    fields: 'files(id, name, mimeType, modifiedTime, webViewLink, size, parents)',
    pageSize: 40,
    orderBy: 'modifiedTime desc',
  });
  const files = (res.data.files ?? []).map(mapFile).filter((f): f is DriveFile => f !== null);
  const nested = files.filter((f) => f.isFolder).slice(0, 4);
  const recentFiles = files.filter((f) => !f.isFolder);
  if (recentFiles.length >= limit) return recentFiles.slice(0, limit);

  for (const folder of nested) {
    if (recentFiles.length >= limit) break;
    const inner = await drive.files.list({
      q: `'${folder.id}' in parents and trashed = false and mimeType != 'application/vnd.google-apps.folder'`,
      fields: 'files(id, name, mimeType, modifiedTime, webViewLink, size, parents)',
      pageSize: 8,
      orderBy: 'modifiedTime desc',
    });
    for (const f of inner.data.files ?? []) {
      const mapped = mapFile(f);
      if (mapped && !mapped.isFolder) recentFiles.push(mapped);
      if (recentFiles.length >= limit) break;
    }
  }

  return recentFiles
    .sort((a, b) => (b.modifiedTime ?? '').localeCompare(a.modifiedTime ?? ''))
    .slice(0, limit);
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

/** Carpeta "Finanzas" del proyecto. Es donde viven las planillas y las facturas. */
export async function resolveFinanzasFolder(): Promise<string | null> {
  const override = process.env.GOOGLE_DRIVE_FINANZAS_FOLDER_ID;
  if (override) return override;

  const rootId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  if (!rootId || !getDriveClient()) return null;

  const { files } = await listDriveFiles({ folderId: rootId, pageSize: 200 });
  const match = files.find((f) => f.isFolder && /finanz/i.test(f.name));
  if (match) return match.id;

  return findOrCreateFolder(rootId, 'Finanzas');
}

/** Las facturas se guardan en Finanzas / Facturas. */
export async function resolveInvoicesFolder(): Promise<{ id: string; path: string } | null> {
  const override = process.env.GOOGLE_DRIVE_INVOICES_FOLDER_ID;
  if (override) return { id: override, path: 'Finanzas / Facturas' };

  const finanzas = await resolveFinanzasFolder();
  if (!finanzas) return null;

  const facturas = await findOrCreateFolder(finanzas, 'Facturas');
  return facturas ? { id: facturas, path: 'Finanzas / Facturas' } : null;
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
  const invoicesFolder = await resolveInvoicesFolder();
  const uploaded = await uploadToDrive({
    name: options.name,
    mimeType: options.mimeType,
    body: options.body,
    parentId: invoicesFolder?.id,
  });
  if (!uploaded) return null;
  return { ...uploaded, folderPath: invoicesFolder?.path ?? 'Finanzas / Facturas' };
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
      const { pdfToText } = await import('@/lib/pdf');
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
