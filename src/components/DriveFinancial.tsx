'use client';

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
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState('');

  async function load() {
    const res = await fetch('/api/drive/status');
    if (res.ok) setStatus(await res.json());
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSync() {
    setSyncing(true);
    setSyncMsg('');
    const res = await fetch('/api/drive/sync', { method: 'POST' });
    const data = await res.json();
    setSyncing(false);
    if (res.ok) {
      setSyncMsg(
        `✓ ${data.synced} archivo${data.synced !== 1 ? 's' : ''} sincronizado${data.synced !== 1 ? 's' : ''}`,
      );
      await load();
    } else {
      setSyncMsg(`Error: ${data.error}`);
    }
  }

  if (!status) return null;

  if (!status.configured) {
    return (
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-medium text-gray-500 tracking-widest uppercase">
            Finanzas · Google Drive
          </h2>
        </div>
        <div className="border border-dashed border-gray-200 rounded-xl p-6 text-center">
          <p className="text-sm text-gray-900 font-medium mb-1">Google Drive no conectado</p>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            Configurá <code className="bg-gray-100 px-1 rounded text-2xs">GOOGLE_CLIENT_ID</code>,{' '}
            <code className="bg-gray-100 px-1 rounded text-2xs">GOOGLE_CLIENT_SECRET</code>,{' '}
            <code className="bg-gray-100 px-1 rounded text-2xs">GOOGLE_REFRESH_TOKEN</code> y{' '}
            <code className="bg-gray-100 px-1 rounded text-2xs">GOOGLE_DRIVE_FOLDER_ID</code> en{' '}
            <code className="bg-gray-100 px-1 rounded text-2xs">.env.local</code> para ver los KPIs
            financieros acá.
          </p>
        </div>
      </div>
    );
  }

  // Agregar KPIs de todos los snapshots: tomar el más reciente por fuente
  const bySource = new Map<string, Snapshot>();
  for (const s of status.snapshots) {
    if (!bySource.has(s.source)) bySource.set(s.source, s);
  }
  const latest = [...bySource.values()];
  const lastSync = status.snapshots[0]?.syncedAt;

  // Consolidar KPIs sumando valores de todos los archivos financieros
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

  const kpiCards = [
    {
      label: 'Gastos ejecutados',
      value: fmt(hasGastos ? gastosTotal : null, currency),
      color: 'text-red-600',
      sub: hasGastos
        ? `${latest.filter((s) => s.kpis.gastosTotal != null).length} fuente(s)`
        : 'Sin datos',
    },
    {
      label: 'Ingresos / Ventas',
      value: fmt(hasIngresos ? ingresosTotal : null, currency),
      color: 'text-blue-600',
      sub: hasIngresos
        ? `${latest.filter((s) => s.kpis.ingresosTotal != null).length} fuente(s)`
        : 'Sin datos',
    },
    {
      label: 'Ganancia esperada',
      value: fmt(gananciaEsperada, currency),
      color: gananciaEsperada != null && gananciaEsperada >= 0 ? 'text-blue-600' : 'text-red-600',
      sub: 'Ingresos − Gastos',
    },
    {
      label: 'Presupuesto total',
      value: fmt(hasPresupuesto ? presupuestoTotal : null, currency),
      color: 'text-gray-900',
      sub: 'Presupuesto del proyecto',
    },
    {
      label: 'Presupuesto ejecutado',
      value: fmtPct(pctEjecutado),
      color: pctEjecutado != null && pctEjecutado > 90 ? 'text-red-600' : 'text-amber-700',
      sub: 'Gastos / Presupuesto',
    },
    {
      label: 'ROI esperado',
      value: fmtPct(roi),
      color: roi != null && roi >= 15 ? 'text-blue-600' : roi != null ? 'text-amber-700' : 'text-gray-500',
      sub: 'Ganancia / Gastos',
    },
  ];

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-medium text-gray-500 tracking-widest uppercase">
          Finanzas · Google Drive
        </h2>
        <div className="flex items-center gap-3">
          {lastSync && (
            <span className="text-2xs text-gray-500">
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
            className="text-xs bg-gray-900 text-white px-3 py-1.5 rounded-lg hover:bg-gray-900 transition disabled:opacity-50">
            {syncing ? 'Sincronizando…' : '↻ Sincronizar Drive'}
          </button>
          {syncMsg && <span className="text-2xs text-blue-600">{syncMsg}</span>}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
        {kpiCards.map((k) => (
          <div key={k.label} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className={`text-lg font-light ${k.color}`}>{k.value}</p>
            <p className="text-xs font-medium text-gray-900 mt-1">{k.label}</p>
            <p className="text-2xs text-gray-500 mt-0.5">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Detalle por archivo */}
      {latest.length > 0 && (
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Archivo', 'Resumen', 'Gastos', 'Ingresos', 'ROI', 'Moneda'].map((h) => (
                  <th key={h} className="text-left px-4 py-2.5 text-2xs text-gray-500 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {latest.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2.5 text-xs font-medium text-gray-900 truncate max-w-36">
                    {s.source}
                  </td>
                  <td className="px-4 py-2.5 text-2xs text-gray-500 max-w-48 truncate">
                    {s.kpis.resumen || '—'}
                  </td>
                  <td className="px-4 py-2.5 text-xs text-red-600">
                    {fmt(s.kpis.gastosTotal, s.kpis.currency)}
                  </td>
                  <td className="px-4 py-2.5 text-xs text-blue-600">
                    {fmt(s.kpis.ingresosTotal, s.kpis.currency)}
                  </td>
                  <td className="px-4 py-2.5 text-xs">{fmtPct(s.kpis.roi)}</td>
                  <td className="px-4 py-2.5 text-2xs text-gray-500">{s.kpis.currency}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
