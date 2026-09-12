'use client';

import { Alert, PageHeader, PageShell, PrimaryButton, Spinner } from '@/components/ui';
import { useState } from 'react';

type SyncResult = { file: string; chunksIngested: number };

export default function SourcesPage() {
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<{ synced: number; results: SyncResult[] } | null>(null);
  const [error, setError] = useState('');

  async function handleSync() {
    setSyncing(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch('/api/drive/sync', { method: 'POST' });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) setError(body.error ?? 'No se pudo sincronizar.');
      else setResult(body);
    } catch {
      setError('No se pudo sincronizar.');
    } finally {
      setSyncing(false);
    }
  }

  return (
    <PageShell>
      <PageHeader
        kicker="Administración"
        title="Fuentes de conocimiento"
        description="Releer los archivos de Drive para que Brain pueda responder sobre ellos."
      />

      <div className="rounded-xl border border-suelo px-5 py-5">
        <p className="text-sm text-ink">Google Drive</p>
        <p className="text-sm text-niebla mt-1 max-w-lg">
          Recorre la carpeta del proyecto, indexa las planillas y los documentos, y guarda el
          texto para las respuestas de Brain. Puede tardar un minuto.
        </p>
        <div className="mt-4">
          <PrimaryButton onClick={handleSync} disabled={syncing}>
            {syncing && <Spinner className="w-3.5 h-3.5" />}
            {syncing ? 'Sincronizando…' : 'Sincronizar Drive'}
          </PrimaryButton>
        </div>
      </div>

      {error && (
        <div className="mt-6">
          <Alert>{error}</Alert>
        </div>
      )}

      {result && (
        <div className="mt-6">
          <Alert tone="ok">
            {result.synced} archivo{result.synced === 1 ? '' : 's'} procesado
            {result.synced === 1 ? '' : 's'}.
          </Alert>
          {result.results?.length > 0 && (
            <ul className="divide-y divide-suelo border-y border-suelo mt-4">
              {result.results.map((r) => (
                <li key={r.file} className="py-3 flex items-center justify-between gap-4">
                  <span className="text-sm text-ink truncate">{r.file}</span>
                  <span className="text-xs text-niebla shrink-0">
                    {r.chunksIngested} fragmento{r.chunksIngested === 1 ? '' : 's'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </PageShell>
  );
}
