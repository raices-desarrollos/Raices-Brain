'use client';

import { EmptyState, ListSkeleton, PageHeader, PageShell, PrimaryButton } from '@/components/ui';
import { formatBytes, formatDate } from '@/lib/format';
import Link from 'next/link';
import { useEffect, useState } from 'react';

type DriveFile = {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime: string | null;
  webViewLink: string | null;
  size: number | null;
  isFolder: boolean;
};

function fileKind(file: DriveFile): 'folder' | 'pdf' | 'sheet' | 'image' | 'doc' | 'file' {
  if (file.isFolder) return 'folder';
  const mime = file.mimeType;
  const name = file.name.toLowerCase();
  if (mime.includes('pdf') || name.endsWith('.pdf')) return 'pdf';
  if (mime.includes('spreadsheet') || mime.includes('excel') || name.endsWith('.xlsx') || name.endsWith('.xls')) {
    return 'sheet';
  }
  if (mime.startsWith('image/') || /\.(png|jpe?g|gif|webp|heic)$/.test(name)) return 'image';
  if (mime.includes('document') || name.endsWith('.docx') || name.endsWith('.doc')) return 'doc';
  return 'file';
}

function FileGlyph({ kind }: { kind: ReturnType<typeof fileKind> }) {
  const common = 'w-5 h-5 shrink-0';
  if (kind === 'folder') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className={`${common} text-tierra`}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h6l2 2h10v10H3V7z" />
      </svg>
    );
  }
  if (kind === 'pdf') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className={`${common} text-ceibo`}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 3h7l5 5v13H7V3z" />
        <path strokeLinecap="round" d="M14 3v5h5" />
      </svg>
    );
  }
  if (kind === 'sheet') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className={`${common} text-musgo`}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 3h12v18H6V3zM6 9h12M6 15h12M10 3v18" />
      </svg>
    );
  }
  if (kind === 'image') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className={`${common} text-arena`}>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <circle cx="9" cy="10" r="1.5" />
        <path strokeLinecap="round" d="M21 16l-5-5-7 7" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className={`${common} text-niebla`}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 3h7l5 5v13H7V3z" />
    </svg>
  );
}

export default function DocumentosPage() {
  const [q, setQ] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [folderId, setFolderId] = useState<string | undefined>();
  const [crumbs, setCrumbs] = useState<{ id: string | undefined; name: string }[]>([
    { id: undefined, name: 'Ceibo Vidal' },
  ]);
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [driveError, setDriveError] = useState('');
  const [loading, setLoading] = useState(true);

  async function loadDrive(nextFolder?: string, query = q) {
    setLoading(true);
    setDriveError('');
    const params = new URLSearchParams();
    if (nextFolder && !query.trim()) params.set('folderId', nextFolder);
    if (query.trim()) params.set('q', query.trim());
    try {
      const res = await fetch(`/api/drive/files?${params}`);
      const data = await res.json().catch(() => null);
      if (!data) {
        setDriveError('No se pudieron leer los documentos. Reintentá.');
        setConfigured(null);
        setFiles([]);
        return;
      }
      setConfigured(data.configured);
      setFiles(data.files ?? []);
      setActiveQuery(query.trim());
      if (data.error) setDriveError(data.error);
    } catch {
      setDriveError('No se pudieron leer los documentos. Reintentá.');
      setFiles([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDrive();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openFolder(file: DriveFile) {
    setFolderId(file.id);
    setCrumbs((c) => [...c, { id: file.id, name: file.name }]);
    setQ('');
    setActiveQuery('');
    loadDrive(file.id, '');
  }

  function goCrumb(index: number) {
    const next = crumbs.slice(0, index + 1);
    setCrumbs(next);
    const id = next[next.length - 1]?.id;
    setFolderId(id);
    setQ('');
    setActiveQuery('');
    loadDrive(id, '');
  }

  return (
    <PageShell wide>
      <PageHeader
        kicker="Ceibo Vidal"
        title="Documentos"
        description="El archivo del proyecto. Todo lo que está acá es de Ceibo Vidal (Vidal 3849)."
        action={<PrimaryButton href="/brain">Preguntar a Brain</PrimaryButton>}
      />

      <form
        className="flex gap-2 mb-8"
        onSubmit={(e) => {
          e.preventDefault();
          loadDrive(folderId, q);
        }}>
        <label className="flex-1">
          <span className="block text-2xs uppercase tracking-wider text-niebla mb-1">Buscar</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Nombre del archivo…"
            className="w-full bg-transparent border-b border-suelo px-0 py-2 text-sm outline-none focus:border-ink"
          />
        </label>
        <button type="submit" className="self-end text-sm text-musgo px-2 py-2">
          Buscar
        </button>
      </form>

      <nav className="flex flex-wrap gap-1 text-sm text-niebla mb-6" aria-label="Ubicación">
        {crumbs.map((c, i) => (
          <span key={`${c.name}-${i}`} className="flex items-center gap-1">
            <button type="button" onClick={() => goCrumb(i)} className="hover:text-ink">
              {c.name}
            </button>
            {i < crumbs.length - 1 ? <span>/</span> : null}
          </span>
        ))}
      </nav>

      {configured === false && (
        <div className="mb-8">
          <EmptyState
            title="Drive no está conectado"
            description="Todavía no se puede listar el archivo de Ceibo Vidal."
          />
        </div>
      )}

      {driveError && (
        <div className="mb-8">
          <EmptyState title="No se pudo conectar con Drive" description={driveError} />
          <button type="button" onClick={() => loadDrive(folderId, q)} className="mt-3 text-sm text-musgo">
            Reintentar
          </button>
        </div>
      )}

      {loading ? (
        <ListSkeleton rows={8} />
      ) : configured && !driveError && files.length === 0 ? (
        <EmptyState
          title={activeQuery ? 'No hay coincidencias' : 'Esta carpeta está vacía'}
          description={
            activeQuery
              ? `No encontramos archivos que coincidan con «${activeQuery}».`
              : 'No hay archivos en esta carpeta.'
          }
        />
      ) : configured && files.length > 0 ? (
        <ul className="divide-y divide-suelo">
          {files.map((f) => {
            const kind = fileKind(f);
            return (
              <li key={f.id} className="py-3 grid grid-cols-[auto_1fr_auto] sm:grid-cols-[auto_1fr_auto_auto] items-center gap-3">
                <FileGlyph kind={kind} />
                <div className="min-w-0">
                  {f.isFolder ? (
                    <button
                      type="button"
                      onClick={() => openFolder(f)}
                      className="text-sm text-ink hover:text-musgo text-left font-medium">
                      {f.name}
                    </button>
                  ) : f.webViewLink ? (
                    <a
                      href={f.webViewLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-ink hover:text-musgo">
                      {f.name}
                    </a>
                  ) : (
                    <span className="text-sm">{f.name}</span>
                  )}
                  <p className="text-2xs text-niebla mt-0.5 sm:hidden">
                    {f.isFolder ? 'Carpeta' : formatDate(f.modifiedTime)}
                    {f.size ? ` · ${formatBytes(f.size)}` : ''}
                  </p>
                </div>
                <p className="hidden sm:block text-2xs text-niebla whitespace-nowrap">
                  {f.isFolder ? 'Carpeta' : formatDate(f.modifiedTime)}
                </p>
                <div className="text-right whitespace-nowrap">
                  {!f.isFolder && f.size ? (
                    <span className="hidden sm:inline text-2xs text-niebla mr-3">{formatBytes(f.size)}</span>
                  ) : null}
                  {!f.isFolder && (
                    <Link
                      href={`/brain?q=${encodeURIComponent(`Qué información tenemos sobre el documento "${f.name}"?`)}`}
                      className="text-2xs text-musgo">
                      Preguntar
                    </Link>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}
    </PageShell>
  );
}
