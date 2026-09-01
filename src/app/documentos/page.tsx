'use client';

import { EmptyState, ListSkeleton, PageHeader, PageShell, PrimaryButton, Spinner } from '@/components/ui';
import { formatBytes, formatDate, formatProjectName } from '@/lib/format';
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

type LocalDoc = {
  id: string;
  name: string;
  category: string;
  projectRef: string | null;
  createdAt: string;
};

export default function DocumentosPage() {
  const [q, setQ] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [folderId, setFolderId] = useState<string | undefined>();
  const [crumbs, setCrumbs] = useState<{ id: string | undefined; name: string }[]>([
    { id: undefined, name: 'Drive' },
  ]);
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [driveError, setDriveError] = useState('');
  const [localDocs, setLocalDocs] = useState<LocalDoc[]>([]);
  const [loading, setLoading] = useState(true);

  const [linkMsg, setLinkMsg] = useState('');
  const [linking, setLinking] = useState<string | null>(null);

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
    fetch('/api/documents')
      .then((r) => (r.ok ? r.json() : []))
      .then(setLocalDocs);
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

  async function linkFile(file: DriveFile) {
    setLinkMsg('');
    setLinking(file.id);
    const res = await fetch('/api/documents/link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        driveFileId: file.id,
        projectRef: 'ceibo-vidal',
        category: /plano/i.test(file.name)
          ? 'plano'
          : /factura/i.test(file.name)
            ? 'factura'
            : /presupuesto/i.test(file.name)
              ? 'presupuesto'
              : 'otro',
      }),
    });
    setLinking(null);
    if (res.ok) {
      setLinkMsg(`Vinculado a Ceibo Vidal: ${file.name}`);
      const docs = await fetch('/api/documents');
      if (docs.ok) setLocalDocs(await docs.json());
    } else {
      const data = await res.json().catch(() => ({}));
      setLinkMsg(data.error ?? 'No se pudo vincular.');
    }
  }

  const linkedIds = new Set(localDocs.map((d) => d.name));

  return (
    <PageShell wide>
      <PageHeader
        kicker="Archivo"
        title="Documentos"
        description="Los archivos viven en Google Drive. Acá los abrís y los vinculás a Ceibo Vidal."
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

      <div className="flex gap-2 text-2xs uppercase tracking-wider text-niebla mb-4">
        {crumbs.map((c, i) => (
          <button key={`${c.name}-${i}`} onClick={() => goCrumb(i)} className="hover:text-ink">
            {c.name}
            {i < crumbs.length - 1 ? ' /' : ''}
          </button>
        ))}
      </div>

      {linkMsg && <p className="text-sm text-musgo mb-4">{linkMsg}</p>}

      {configured === false && (
        <div className="mb-8">
          <EmptyState
            title="Drive no está conectado"
            description="Todavía no se puede listar el archivo. Los documentos ya vinculados aparecen más abajo."
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
        <div className="mb-12">
          <ListSkeleton rows={8} />
        </div>
      ) : configured && !driveError && files.length === 0 ? (
        <div className="mb-12">
          <EmptyState
            title={activeQuery ? 'No hay coincidencias' : 'Esta carpeta está vacía'}
            description={
              activeQuery
                ? `No encontramos archivos que coincidan con «${activeQuery}».`
                : 'Drive está conectado, pero no hay archivos en esta carpeta.'
            }
          />
        </div>
      ) : configured && files.length > 0 ? (
        <ul className="divide-y divide-suelo mb-12">
          {files.map((f) => (
            <li key={f.id} className="py-3 flex items-center justify-between gap-4">
              <div className="min-w-0">
                {f.isFolder ? (
                  <button onClick={() => openFolder(f)} className="text-sm text-ink hover:text-musgo text-left">
                    {f.name}
                  </button>
                ) : f.webViewLink ? (
                  <a href={f.webViewLink} target="_blank" rel="noreferrer" className="text-sm text-ink hover:text-musgo">
                    {f.name}
                  </a>
                ) : (
                  <span className="text-sm">{f.name}</span>
                )}
                <p className="text-2xs text-niebla mt-0.5">
                  {f.isFolder ? 'Carpeta' : formatDate(f.modifiedTime)}
                  {f.size ? ` · ${formatBytes(f.size)}` : ''}
                  {!f.isFolder && linkedIds.has(f.name) ? ' · Vinculado a Ceibo Vidal' : ''}
                </p>
              </div>
              {!f.isFolder && (
                <div className="flex items-center gap-3 flex-shrink-0">
                  <button
                    onClick={() => linkFile(f)}
                    disabled={linking === f.id}
                    className="inline-flex items-center gap-1 text-2xs uppercase tracking-wider text-tierra whitespace-nowrap disabled:opacity-50">
                    {linking === f.id && <Spinner className="w-3 h-3" />}
                    {linking === f.id ? 'Vinculando…' : 'Vincular a Ceibo Vidal'}
                  </button>
                  <Link
                    href={`/brain?q=${encodeURIComponent(`Qué información tenemos sobre el documento "${f.name}"?`)}`}
                    className="text-2xs uppercase tracking-wider text-musgo whitespace-nowrap">
                    Preguntar a Brain
                  </Link>
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : null}

      <h2 className="text-xs tracking-[0.18em] uppercase text-niebla mb-4">Relacionados con Ceibo Vidal</h2>
      {!localDocs.length ? (
        <p className="text-sm text-niebla">
          Todavía no hay documentos vinculados. Los archivos siguen en Drive hasta que los vincules.
        </p>
      ) : (
        <ul className="divide-y divide-suelo">
          {localDocs.map((d) => (
            <li key={d.id} className="py-3 flex justify-between gap-4">
              <div>
                <p className="text-sm">{d.name}</p>
                <p className="text-2xs text-niebla">
                  {d.category}
                  {d.projectRef ? ` · ${formatProjectName(d.projectRef)}` : ''}
                </p>
              </div>
              <Link
                href={`/brain?q=${encodeURIComponent(`Preguntame sobre el documento ${d.name}`)}`}
                className="text-2xs uppercase tracking-wider text-musgo">
                Preguntar
              </Link>
            </li>
          ))}
        </ul>
      )}
    </PageShell>
  );
}
