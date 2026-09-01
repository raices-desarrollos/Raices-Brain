'use client';

import { EmptyState, PageHeader } from '@/components/ui';
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

type LocalDoc = {
  id: string;
  name: string;
  category: string;
  projectRef: string | null;
  createdAt: string;
};

export default function DocumentosPage() {
  const [q, setQ] = useState('');
  const [folderId, setFolderId] = useState<string | undefined>();
  const [crumbs, setCrumbs] = useState<{ id: string | undefined; name: string }[]>([
    { id: undefined, name: 'Drive' },
  ]);
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [localDocs, setLocalDocs] = useState<LocalDoc[]>([]);
  const [loading, setLoading] = useState(true);

  const [linkMsg, setLinkMsg] = useState('');

  async function loadDrive(nextFolder?: string, query = q) {
    setLoading(true);
    const params = new URLSearchParams();
    if (nextFolder) params.set('folderId', nextFolder);
    if (query) params.set('q', query);
    const res = await fetch(`/api/drive/files?${params}`);
    if (res.ok) {
      const data = await res.json();
      setConfigured(data.configured);
      setFiles(data.files ?? []);
    }
    setLoading(false);
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
    loadDrive(file.id, '');
    setQ('');
  }

  function goCrumb(index: number) {
    const next = crumbs.slice(0, index + 1);
    setCrumbs(next);
    const id = next[next.length - 1]?.id;
    setFolderId(id);
    loadDrive(id, '');
  }

  async function linkFile(file: DriveFile) {
    setLinkMsg('');
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
    if (res.ok) {
      setLinkMsg(`Vinculado: ${file.name}`);
      const docs = await fetch('/api/documents');
      if (docs.ok) setLocalDocs(await docs.json());
    } else {
      const data = await res.json();
      setLinkMsg(data.error ?? 'No se pudo vincular.');
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-8 py-10">
      <PageHeader
        kicker="Archivo"
        title="Documentos"
        description="Google Drive es el archivo. Podés abrir, vincular a Ceibo Vidal y preguntarle a Brain."
        action={
          <Link href="/brain" className="text-sm bg-ink text-blanco px-4 py-2">
            Preguntar a Brain
          </Link>
        }
      />

      <form
        className="flex gap-2 mb-8"
        onSubmit={(e) => {
          e.preventDefault();
          loadDrive(folderId, q);
        }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar documento…"
          className="flex-1 bg-transparent border-b border-suelo px-0 py-2 text-sm outline-none focus:border-ink"
        />
        <button type="submit" className="text-sm text-musgo px-2">
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
            title="Google Drive no está conectado"
            description="Faltan las credenciales de Google. El listado de Drive queda listo; mientras tanto ves documentos ya vinculados."
          />
        </div>
      )}

      {loading ? (
        <p className="text-sm text-niebla mb-8">Cargando…</p>
      ) : configured && files.length === 0 ? (
        <p className="text-sm text-niebla mb-8">Esta carpeta está vacía.</p>
      ) : (
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
                </p>
              </div>
              {!f.isFolder && (
                <div className="flex items-center gap-3 flex-shrink-0">
                  <button
                    onClick={() => linkFile(f)}
                    className="text-2xs uppercase tracking-wider text-tierra whitespace-nowrap">
                    Vincular a Ceibo Vidal
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
      )}

      <h2 className="text-xs tracking-[0.18em] uppercase text-niebla mb-4">
        Relacionados con proyectos
      </h2>
      {!localDocs.length ? (
        <p className="text-sm text-niebla">
          Todavía no hay archivos en la base. Las facturas subidas desde la app aparecen acá.
        </p>
      ) : (
        <ul className="divide-y divide-suelo">
          {localDocs.map((d) => (
            <li key={d.id} className="py-3 flex justify-between gap-4">
              <div>
                <p className="text-sm">{d.name}</p>
                <p className="text-2xs text-niebla">
                  {d.category}
                  {d.projectRef ? ` · ${d.projectRef}` : ''}
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
    </div>
  );
}
