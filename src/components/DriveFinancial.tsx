'use client';

import { EmptyState, LoadingLine, Spinner } from '@/components/ui';
import { useEffect, useState } from 'react';

interface KPIs {
  gastosTotal: number | null;
  ingresosTotal: number | null;
  gananciaEsperada: number | null;
  presupuestoTotal: number | null;
  porcentajeEjecutado: number | null;
  roi: number | null;
  currency: string;
  resumen: string;
  detalles: Record<string, number | string>;
}

interface Snapshot {
  id: string;
  source: string;
  kpis: KPIs;
  syncedAt: string;
}

interface DriveStatus {
  configured: boolean;
  snapshots: Snapshot[];
}

function fmt(value: number | null, currency: string): string {
  if (value === null) return '—';
  const abs = Math.abs(value);
  const formatted =
    abs >= 1_000_000
      ? `${currency === 'ARS' ? '$' : 'U$D'} ${(value / 1_000_000).toFixed(1)}M`
      : abs >= 1_000
        ? `${currency === 'ARS' ? '$' : 'U$D'} ${(value / 1_000).toFixed(0)}K`
        : `${currency === 'ARS' ? '$' : 'U$D'} ${value.toLocaleString('es-AR')}`;
  return formatted;
}

function fmtPct(value: number | null): string {
  if (value === null) return '—';
  return `${value.toFixed(1)}%`;
}

export default function DriveFinancial() {
  const [status, setStatus] = useState<DriveStatus | null>(null);
  const [error, setError] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState('');

  async function load() {
    const res = await fetch('/api/drive/status');
    if (res.ok) {
      setStatus(await res.json());
      setError('');
    } else {
      setError('No se pudo consultar Drive.');
    }
  }

  useEffect(() => {
    load().catch(() => setError('No se pudo consultar Drive.'));
  }, []);

  async function handleSync() {
    setSyncing(true);
    setSyncMsg('');
    const res = await fetch('/api/drive/sync', { method: 'POST' });
    const data = await res.json().catch(() => ({}));
    setSyncing(false);
    if (res.ok) {
      setSyncMsg(
        `${data.synced} archivo${data.synced !== 1 ? 's' : ''} sincronizado${data.synced !== 1 ? 's' : ''}`,
      );
      await load();
    } else {
      setSyncMsg(data.error ?? 'No se pudo sincronizar.');
    }
  }

  if (!status && !error) {
    return (
      <div className="mb-10">
        <LoadingLine label="Consultando Drive…" />
      </div>
    );
  }

  if (!status?.configured) {
    return (
      <div className="mb-10">
        <h2 className="text-xs tracking-[0.18em] uppercase text-niebla mb-4">Finanzas · Google Drive</h2>
        <EmptyState
          title="Google Drive no está conectado"
          description="Cuando Drive esté vinculado, acá van a aparecer presupuesto y planillas. Mientras tanto, las facturas de la app ya se ven arriba."
        />
      </div>
    );
  }

  const bySource = new Map<string, Snapshot>();
  for (const s of status.snapshots) {
    if (!bySource.has(s.source)) bySource.set(s.source, s);
  }
  const latest = [...bySource.values()];
  const lastSync = status.snapshots[0]?.syncedAt;

  let gastosTotal = 0;
  let ingresosTotal = 0;
  let presupuestoTotal = 0;
  let currency = 'USD';
  let hasGastos = false;
  let hasIngresos = false;
  let hasPresupuesto = false;

  for (const s of latest) {
    const k = s.kpis;
    if (k.gastosTotal != null) {
      gastosTotal += k.gastosTotal;
      hasGastos = true;
    }
    if (k.ingresosTotal != null) {
      ingresosTotal += k.ingresosTotal;
      hasIngresos = true;
    }
    if (k.presupuestoTotal != null) {
      presupuestoTotal += k.presupuestoTotal;
      hasPresupuesto = true;
    }
    if (k.currency === 'ARS') currency = 'ARS';
  }

  const gananciaEsperada = hasIngresos && hasGastos ? ingresosTotal - gastosTotal : null;
  const roi =
    gananciaEsperada != null && gastosTotal > 0 ? (gananciaEsperada / gastosTotal) * 100 : null;
  const pctEjecutado =
    hasPresupuesto && hasGastos && presupuestoTotal > 0
      ? (gastosTotal / presupuestoTotal) * 100
      : null;

  const hasAny = hasGastos || hasIngresos || hasPresupuesto;

  const kpiCards = hasAny
    ? [
        hasGastos && {
          label: 'Gastos ejecutados',
          value: fmt(gastosTotal, currency),
          sub: `${latest.filter((s) => s.kpis.gastosTotal != null).length} fuente(s)`,
        },
        hasIngresos && {
          label: 'Ingresos / Ventas',
          value: fmt(ingresosTotal, currency),
          sub: `${latest.filter((s) => s.kpis.ingresosTotal != null).length} fuente(s)`,
        },
        gananciaEsperada != null && {
          label: 'Ganancia esperada',
          value: fmt(gananciaEsperada, currency),
          sub: 'Ingresos − Gastos',
        },
        hasPresupuesto && {
          label: 'Presupuesto total',
          value: fmt(presupuestoTotal, currency),
          sub: 'Presupuesto del proyecto',
        },
        pctEjecutado != null && {
          label: 'Presupuesto ejecutado',
          value: fmtPct(pctEjecutado),
          sub: 'Gastos / Presupuesto',
        },
        roi != null && {
          label: 'ROI esperado',
          value: fmtPct(roi),
          sub: 'Ganancia / Gastos',
        },
      ].filter(Boolean) as { label: string; value: string; sub: string }[]
    : [];

  return (
    <div className="mb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h2 className="text-xs tracking-[0.18em] uppercase text-niebla">Finanzas · Google Drive</h2>
        <div className="flex items-center gap-3">
          {lastSync && (
            <span className="text-2xs text-niebla">
              Última sync:{' '}
              {new Date(lastSync).toLocaleString('es-AR', {
                dateStyle: 'short',
                timeStyle: 'short',
              })}
            </span>
          )}
          <button
            onClick={handleSync}
            disabled={syncing}
            className="inline-flex items-center gap-2 text-xs bg-ink text-blanco px-3 py-1.5 hover:bg-musgo transition disabled:opacity-50">
            {syncing && <Spinner className="w-3 h-3 text-blanco" />}
            {syncing ? 'Sincronizando…' : 'Sincronizar Drive'}
          </button>
        </div>
      </div>
      {syncMsg && <p className="text-2xs text-musgo mb-3">{syncMsg}</p>}

      {!hasAny ? (
        <EmptyState
          title="Todavía no hay presupuesto en Drive"
          description="Las facturas de la app se ven arriba. El presupuesto y las planillas aparecen acá cuando estén en la carpeta de Drive y se sincronice."
        />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-6">
          {kpiCards.map((k) => (
            <div key={k.label} className="py-2">
              <p className="text-lg font-light text-ink">{k.value}</p>
              <p className="text-xs font-medium text-ink mt-1">{k.label}</p>
              <p className="text-2xs text-niebla mt-0.5">{k.sub}</p>
            </div>
          ))}
        </div>
      )}

      {latest.length > 0 && (
        <div className="overflow-x-auto border-t border-suelo">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-2xs uppercase tracking-wider text-niebla">
                {['Archivo', 'Resumen', 'Gastos', 'Ingresos', 'ROI'].map((h) => (
                  <th key={h} className="py-2 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {latest.map((s) => (
                <tr key={s.id} className="border-t border-suelo">
                  <td className="py-2.5 text-xs font-medium text-ink truncate max-w-36">{s.source}</td>
                  <td className="py-2.5 text-2xs text-niebla max-w-48 truncate">{s.kpis.resumen || '—'}</td>
                  <td className="py-2.5 text-xs">{fmt(s.kpis.gastosTotal, s.kpis.currency)}</td>
                  <td className="py-2.5 text-xs">{fmt(s.kpis.ingresosTotal, s.kpis.currency)}</td>
                  <td className="py-2.5 text-xs">{fmtPct(s.kpis.roi)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
