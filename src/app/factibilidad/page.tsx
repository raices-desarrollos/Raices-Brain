'use client';

import { diagnose } from '@/lib/domain/diagnostics';
import type { FeasibilityInputs } from '@/lib/domain/feasibility';
import { calculateFeasibility } from '@/lib/domain/feasibility';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Feasibility {
  id: string;
  name: string;
  address: string;
  neighborhood: string | null;
  date: string;
  inputs: FeasibilityInputs;
  currency: string;
  updatedAt: string;
}

function fmtCurrency(val: number, currency = 'USD') {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(val);
}

function fmtPct(val: number) {
  return `${val.toFixed(1)}%`;
}

const DIAGNOSIS_CONFIG: Record<string, { cls: string; dot: string }> = {
  atractivo: { cls: 'bg-green-50 text-green-700', dot: 'bg-green-500' },
  factible: { cls: 'bg-blue-50 text-blue-700', dot: 'bg-blue-500' },
  riesgoso: { cls: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500' },
  'no-rentable': { cls: 'bg-red-50 text-red-700', dot: 'bg-red-500' },
  insuficiente: { cls: 'bg-gray-100 text-gray-500', dot: 'bg-gray-400' },
};

export default function FactibilidadPage() {
  const [items, setItems] = useState<Feasibility[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function load() {
    const res = await fetch('/api/feasibility');
    if (res.ok) setItems(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id: string, name: string) {
    if (!confirm(`¿Eliminar el análisis "${name}"? Esta acción no se puede deshacer.`)) return;
    setDeleting(id);
    await fetch(`/api/feasibility/${id}`, { method: 'DELETE' });
    await load();
    setDeleting(null);
  }

  async function handleDuplicate(id: string) {
    await fetch(`/api/feasibility/${id}`, { method: 'POST' });
    await load();
  }

  return (
    <div className="max-w-5xl mx-auto px-8 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-gray-400 text-xs tracking-widest uppercase mb-1">Análisis</p>
          <h1 className="text-2xl font-semibold text-gray-900">Factibilidad</h1>
          <p className="text-gray-400 text-sm mt-0.5">
            {items.length > 0
              ? `${items.length} análisis guardado${items.length !== 1 ? 's' : ''}`
              : 'Análisis económicos de terrenos y proyectos'}
          </p>
        </div>
        <Link
          href="/factibilidad/nuevo"
          className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-900 transition">
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path
              fillRule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
          Nuevo análisis
        </Link>
      </div>

      {/* List */}
      {loading ? (
        <div className="text-gray-400 text-sm py-12 text-center">Cargando…</div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-gray-200 rounded-xl">
          <p className="text-gray-400 text-sm mb-4">No hay análisis guardados todavía.</p>
          <Link href="/factibilidad/nuevo" className="text-blue-600 text-sm hover:underline">
            Crear el primero →
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200">
              <tr className="bg-gray-50">
                {[
                  'Análisis',
                  'Diagnóstico',
                  'Costo total',
                  'Ingresos netos',
                  'ROI',
                  'Margen',
                  '',
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left px-5 py-3 text-2xs text-gray-400 font-semibold uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item) => {
                const results = calculateFeasibility(item.inputs);
                const diagnosis = diagnose(results);
                const dcfg = DIAGNOSIS_CONFIG[diagnosis.level] ?? DIAGNOSIS_CONFIG.insuficiente;
                return (
                  <tr key={item.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-4">
                      <Link
                        href={`/factibilidad/${item.id}`}
                        className="font-semibold text-gray-900 hover:text-blue-600 transition">
                        {item.name}
                      </Link>
                      <p className="text-2xs text-gray-400 mt-0.5">
                        {item.address}
                        {item.neighborhood ? ` · ${item.neighborhood}` : ''}
                      </p>
                      <p className="text-2xs text-gray-400/60 mt-0.5">
                        {new Date(item.updatedAt).toLocaleDateString('es-AR')}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 text-2xs font-medium px-2.5 py-1 rounded-full ${dcfg.cls}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${dcfg.dot}`} />
                        {diagnosis.label}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm font-medium text-gray-900">
                      {fmtCurrency(results.totalProjectCost, item.currency)}
                    </td>
                    <td className="px-5 py-4 text-sm font-medium text-blue-600">
                      {fmtCurrency(results.netIncome, item.currency)}
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold text-gray-900">
                      {fmtPct(results.roi)}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-400">
                      {fmtPct(results.marginOnSalesPct)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/factibilidad/${item.id}`}
                          className="p-1.5 rounded-lg text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition">
                          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </Link>
                        <button
                          onClick={() => handleDuplicate(item.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-amber-700 transition">
                          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                            <path d="M7 9a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9z" />
                            <path d="M5 3a2 2 0 00-2 2v6a2 2 0 002 2V5h8a2 2 0 00-2-2H5z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.name)}
                          disabled={deleting === item.id}
                          className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 transition disabled:opacity-50">
                          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                            <path
                              fillRule="evenodd"
                              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="px-5 py-3 border-t border-gray-200 bg-gray-50/60 text-2xs text-gray-400">
            {items.length} análisis
          </div>
        </div>
      )}
    </div>
  );
}
