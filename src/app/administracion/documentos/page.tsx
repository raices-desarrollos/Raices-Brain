'use client';

import { LoadingLine } from '@/components/ui';
import { useEffect, useRef, useState } from 'react';

const DOC_CATEGORIES = [
  'contrato',
  'escritura',
  'finanzas',
  'plano',
  'presupuesto',
  'factura',
  'recibo',
  'comprobante',
  'documento-societario',
  'informe-tecnico',
  'otro',
];

interface Doc {
  id: string;
  name: string;
  description: string | null;
  category: string;
  mimeType: string;
  size: number;
  projectRef: string | null;
  createdAt: string;
}

function fmtSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function DocumentosPage() {
  const [items, setItems] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [category, setCategory] = useState('otro');
  const [description, setDescription] = useState('');
  const [projectRef, setProjectRef] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [ingesting, setIngesting] = useState<string | null>(null);
  const [ingestResult, setIngestResult] = useState<{ id: string; msg: string } | null>(null);

  const EXCEL_MIMES = new Set([
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ]);

  async function load() {
    const res = await fetch('/api/documents');
    if (res.ok) setItems(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = items.filter(
    (d) =>
      !search ||
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      (d.description ?? '').toLowerCase().includes(search.toLowerCase()),
  );

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    setUploadError('');
    setUploading(true);

    const fd = new FormData();
    fd.append('file', file);
    fd.append('category', category);
    fd.append('description', description);
    fd.append('projectRef', projectRef);

    const res = await fetch('/api/documents', { method: 'POST', body: fd });
    setUploading(false);
    if (res.ok) {
      setDescription('');
      setProjectRef('');
      setCategory('otro');
      if (fileRef.current) fileRef.current.value = '';
      load();
    } else {
      const data = await res.json();
      setUploadError(data.error ?? 'Error al subir.');
    }
  }

  async function handleIngest(id: string, name: string) {
    setIngestResult(null);
    setIngesting(id);
    const res = await fetch(`/api/documents/${id}/ingest`, { method: 'POST' });
    const data = await res.json();
    setIngesting(null);
    if (res.ok) {
      setIngestResult({
        id,
        msg: `✓ ${data.chunks} hoja${data.chunks !== 1 ? 's' : ''} indexada${data.chunks !== 1 ? 's' : ''} en el Brain`,
      });
    } else {
      setIngestResult({ id, msg: `Error: ${data.error}` });
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`¿Eliminar documento "${name}"? Esta acción no se puede deshacer.`)) return;
    setDeleting(id);
    await fetch(`/api/documents/${id}`, { method: 'DELETE' });
    await load();
    setDeleting(null);
  }

  return (
    <div className="max-w-4xl mx-auto px-8 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Documentos</h1>
        <p className="text-gray-400 text-sm mt-1">
          {items.length} documento{items.length !== 1 ? 's' : ''} almacenado
          {items.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Upload form */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
          Subir documento
        </h2>
        <form onSubmit={handleUpload} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Archivo *</label>
              <input
                ref={fileRef}
                type="file"
                required
                className="w-full text-sm text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-gray-100 file:text-gray-900 hover:file:bg-gray-100 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Categoría *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={inputCls}>
                {DOC_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c.charAt(0).toUpperCase() + c.slice(1).replace('-', ' ')}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Descripción</label>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={inputCls}
                placeholder="Descripción opcional"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Proyecto / Referencia</label>
              <input
                value={projectRef}
                onChange={(e) => setProjectRef(e.target.value)}
                className={inputCls}
                placeholder="Ceibo Vidal, Terreno Palermo…"
              />
            </div>
          </div>
          {uploadError && <p className="text-red-600 text-xs">{uploadError}</p>}
          <button
            type="submit"
            disabled={uploading}
            className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-900 transition disabled:opacity-50">
            {uploading ? 'Subiendo…' : 'Subir documento'}
          </button>
        </form>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre o descripción…"
          className={`${inputCls} max-w-sm`}
        />
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center">
          <LoadingLine label="Abriendo documentos…" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-gray-200 rounded-xl text-gray-400 text-sm">
          {search ? 'Sin resultados para esa búsqueda.' : 'No hay documentos todavía.'}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Nombre', 'Categoría', 'Tamaño', 'Fecha', 'Referencia', ''].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs text-gray-400 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((d) => (
                <tr key={d.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900 truncate max-w-48">{d.name}</div>
                    {d.description && (
                      <div className="text-2xs text-gray-400 mt-0.5 truncate">{d.description}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-2xs bg-gray-100 text-gray-900 px-2 py-0.5 rounded-full capitalize">
                      {d.category.replace('-', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{fmtSize(d.size)}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {new Date(d.createdAt).toLocaleDateString('es-AR')}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs truncate max-w-32">
                    {d.projectRef ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-right space-x-3">
                    {EXCEL_MIMES.has(d.mimeType) && (
                      <>
                        <button
                          onClick={() => handleIngest(d.id, d.name)}
                          disabled={ingesting === d.id}
                          className="text-xs text-blue-600 hover:underline disabled:opacity-50">
                          {ingesting === d.id ? 'Ingeniando…' : 'Ingestar Brain'}
                        </button>
                        {ingestResult?.id === d.id && (
                          <span className="text-2xs text-blue-600">{ingestResult.msg}</span>
                        )}
                      </>
                    )}
                    <a
                      href={`/api/documents/${d.id}/download`}
                      target="_blank"
                      className="text-xs text-blue-600 hover:underline">
                      Descargar
                    </a>
                    <button
                      onClick={() => handleDelete(d.id, d.name)}
                      disabled={deleting === d.id}
                      className="text-xs text-gray-400 hover:text-red-600 transition">
                      {deleting === d.id ? '…' : 'Eliminar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const inputCls =
  'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition';
