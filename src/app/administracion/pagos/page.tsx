'use client';

import { LoadingLine } from '@/components/ui';
import { useCallback, useEffect, useState } from 'react';

const STATUS_OPTIONS = ['pendiente', 'pagado', 'vencido', 'cancelado'];
const STATUS_CONFIG: Record<string, { cls: string; dot: string; label: string }> = {
  pendiente: { cls: 'bg-arena/10 text-tierra', dot: 'bg-arena', label: 'Pendiente' },
  pagado: { cls: 'bg-musgo/5 text-musgo', dot: 'bg-musgo', label: 'Pagado' },
  vencido: { cls: 'bg-ceibo/5 text-ceibo', dot: 'bg-ceibo', label: 'Vencido' },
  cancelado: { cls: 'bg-suelo text-niebla', dot: 'bg-niebla', label: 'Cancelado' },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.cancelado;
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${cfg.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}
const CATEGORIES = [
  'alquiler',
  'honorarios',
  'materiales',
  'servicios',
  'impuestos',
  'escribanía',
  'otro',
];

interface Payment {
  id: string;
  concept: string;
  amount: number;
  currency: string;
  type: string;
  category: string;
  dueDate: string | null;
  paidDate: string | null;
  status: string;
  contactId: string | null;
  projectRef: string | null;
  observations: string | null;
  createdAt: string;
}

const EMPTY = {
  concept: '',
  amount: '',
  currency: 'USD',
  type: 'egreso',
  category: 'otro',
  dueDate: '',
  paidDate: '',
  status: 'pendiente',
  contactId: '',
  projectRef: '',
  observations: '',
};

function fmtCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

export default function PagosPage() {
  const [items, setItems] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Recibe los filtros por parámetro en vez de leerlos del estado: así la
  // función es estable y no arrastra valores viejos entre renders.
  const load = useCallback(async (st: string, tp: string) => {
    const params = new URLSearchParams();
    if (st) params.set('status', st);
    if (tp) params.set('type', tp);
    const res = await fetch(`/api/payments?${params}`);
    if (res.ok) setItems(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    load('', '');
  }, [load]);

  const totalIngresos = items.filter((p) => p.type === 'ingreso').reduce((a, p) => a + p.amount, 0);
  const totalEgresos = items.filter((p) => p.type === 'egreso').reduce((a, p) => a + p.amount, 0);
  const pendientes = items.filter((p) => p.status === 'pendiente').length;
  const vencidos = items.filter((p) => p.status === 'vencido').length;

  async function handleSave() {
    setError('');
    setSaving(true);
    const method = editing ? 'PUT' : 'POST';
    const url = editing ? `/api/payments/${editing}` : '/api/payments';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, amount: parseFloat(form.amount) || 0 }),
    });
    setSaving(false);
    if (res.ok) {
      setShowForm(false);
      setEditing(null);
      setForm(EMPTY);
      load(filterStatus, filterType);
    } else {
      const data = await res.json();
      setError(data.error ?? 'Error al guardar.');
    }
  }

  async function handleDelete(id: string, concept: string) {
    if (!confirm(`¿Eliminar pago "${concept}"?`)) return;
    await fetch(`/api/payments/${id}`, { method: 'DELETE' });
    load(filterStatus, filterType);
  }

  function openEdit(p: Payment) {
    setForm({
      concept: p.concept,
      amount: String(p.amount),
      currency: p.currency,
      type: p.type,
      category: p.category,
      dueDate: p.dueDate ?? '',
      paidDate: p.paidDate ?? '',
      status: p.status,
      contactId: p.contactId ?? '',
      projectRef: p.projectRef ?? '',
      observations: p.observations ?? '',
    });
    setEditing(p.id);
    setShowForm(true);
  }

  return (
    <div className="max-w-5xl mx-auto px-8 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-niebla text-xs tracking-widest uppercase mb-1">Administración</p>
          <h1 className="text-2xl font-semibold text-ink">Pagos</h1>
          <p className="text-niebla text-sm mt-0.5">
            {items.length} registro{items.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => {
            setForm(EMPTY);
            setEditing(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 bg-ink text-blanco px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-ink transition">
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path
              fillRule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
          Nuevo pago
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-blanco border border-suelo rounded-xl p-5 shadow-sm">
          <div className="w-8 h-8 rounded-lg bg-suelo/50 flex items-center justify-center mb-3">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-musgo">
              <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
              <path
                fillRule="evenodd"
                d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <p className="text-xl font-semibold text-musgo">{fmtCurrency(totalIngresos, 'USD')}</p>
          <p className="text-xs text-niebla mt-1">Total ingresos</p>
        </div>
        <div className="bg-blanco border border-suelo rounded-xl p-5 shadow-sm">
          <div className="w-8 h-8 rounded-lg bg-ceibo/5 flex items-center justify-center mb-3">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-ceibo">
              <path
                fillRule="evenodd"
                d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <p className="text-xl font-semibold text-ceibo">{fmtCurrency(totalEgresos, 'USD')}</p>
          <p className="text-xs text-niebla mt-1">Total egresos</p>
        </div>
        <div className="bg-blanco border border-suelo rounded-xl p-5 shadow-sm">
          <div className="w-8 h-8 rounded-lg bg-suelo flex items-center justify-center mb-3">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-tierra">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <p className="text-xl font-semibold text-tierra">{pendientes}</p>
          <p className="text-xs text-niebla mt-1">Pendientes</p>
        </div>
        <div className="bg-blanco border border-suelo rounded-xl p-5 shadow-sm">
          <div className="w-8 h-8 rounded-lg bg-ceibo/5 flex items-center justify-center mb-3">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-ceibo">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <p className="text-xl font-semibold text-ceibo">{vencidos}</p>
          <p className="text-xs text-niebla mt-1">Vencidos</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <select
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value);
            load(e.target.value, filterType);
          }}
          className={selectCls}>
          <option value="">Todos los estados</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
        <select
          value={filterType}
          onChange={(e) => {
            setFilterType(e.target.value);
            load(filterStatus, e.target.value);
          }}
          className={selectCls}>
          <option value="">Ingresos y egresos</option>
          <option value="ingreso">Ingresos</option>
          <option value="egreso">Egresos</option>
        </select>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-ink/40 flex items-center justify-center z-50 p-4">
          <div className="bg-blanco rounded-xl border border-suelo shadow-xl w-full max-w-lg p-6 overflow-y-auto max-h-screen">
            <h2 className="font-semibold text-ink mb-4">
              {editing ? 'Editar pago' : 'Nuevo pago'}
            </h2>
            <div className="space-y-3">
              <FF label="Concepto *">
                <input
                  value={form.concept}
                  onChange={(e) => setForm((p) => ({ ...p, concept: e.target.value }))}
                  className={inputCls}
                />
              </FF>
              <div className="grid grid-cols-2 gap-3">
                <FF label="Monto *">
                  <input
                    type="number"
                    value={form.amount}
                    onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
                    className={inputCls}
                  />
                </FF>
                <FF label="Moneda">
                  <select
                    value={form.currency}
                    onChange={(e) => setForm((p) => ({ ...p, currency: e.target.value }))}
                    className={inputCls}>
                    <option value="USD">USD</option>
                    <option value="ARS">ARS</option>
                  </select>
                </FF>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FF label="Tipo *">
                  <select
                    value={form.type}
                    onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
                    className={inputCls}>
                    <option value="ingreso">Ingreso</option>
                    <option value="egreso">Egreso</option>
                  </select>
                </FF>
                <FF label="Categoría">
                  <select
                    value={form.category}
                    onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                    className={inputCls}>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c.charAt(0).toUpperCase() + c.slice(1)}
                      </option>
                    ))}
                  </select>
                </FF>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FF label="Vencimiento">
                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))}
                    className={inputCls}
                  />
                </FF>
                <FF label="Fecha de pago">
                  <input
                    type="date"
                    value={form.paidDate}
                    onChange={(e) => setForm((p) => ({ ...p, paidDate: e.target.value }))}
                    className={inputCls}
                  />
                </FF>
              </div>
              <FF label="Estado">
                <select
                  value={form.status}
                  onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
                  className={inputCls}>
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </option>
                  ))}
                </select>
              </FF>
              <FF label="Proyecto / Terreno">
                <input
                  value={form.projectRef}
                  onChange={(e) => setForm((p) => ({ ...p, projectRef: e.target.value }))}
                  className={inputCls}
                />
              </FF>
              <FF label="Observaciones">
                <textarea
                  value={form.observations}
                  onChange={(e) => setForm((p) => ({ ...p, observations: e.target.value }))}
                  rows={2}
                  className={`${inputCls} resize-none`}
                />
              </FF>
            </div>
            {error && <p className="text-ceibo text-xs mt-3">{error}</p>}
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-ink text-blanco px-4 py-2 rounded-lg text-sm font-medium hover:bg-ink transition disabled:opacity-50">
                {saving ? 'Guardando…' : 'Guardar'}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="text-sm text-niebla hover:text-ink transition">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex justify-center">
          <LoadingLine label="Abriendo pagos…" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-suelo rounded-xl text-niebla text-sm">
          No hay registros.
        </div>
      ) : (
        <div className="bg-blanco border border-suelo rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b border-suelo">
              <tr className="bg-lino">
                {['Concepto', 'Tipo', 'Monto', 'Vencimiento', 'Estado', ''].map((h) => (
                  <th
                    key={h}
                    className="text-left px-5 py-3 text-2xs text-niebla font-semibold uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-suelo">
              {items.map((p) => (
                <tr key={p.id} className="hover:bg-lino/60 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-ink">{p.concept}</p>
                    {p.projectRef && (
                      <p className="text-xs text-niebla mt-0.5">{p.projectRef}</p>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        p.type === 'ingreso' ? 'bg-suelo/50 text-musgo' : 'bg-ceibo/5 text-ceibo'
                      }`}>
                      {p.type}
                    </span>
                  </td>
                  <td
                    className={`px-5 py-3.5 font-semibold ${
                      p.type === 'ingreso' ? 'text-musgo' : 'text-ceibo'
                    }`}>
                    {p.type === 'egreso' ? '− ' : '+ '}
                    {fmtCurrency(p.amount, p.currency)}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-niebla">{p.dueDate ?? '—'}</td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(p)}
                        className="p-1.5 rounded-lg text-niebla hover:bg-suelo/50 hover:text-musgo transition">
                        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(p.id, p.concept)}
                        className="p-1.5 rounded-lg text-niebla hover:bg-ceibo/5 hover:text-ceibo transition">
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
              ))}
            </tbody>
          </table>
          <div className="px-5 py-3 border-t border-suelo bg-lino/60 text-xs text-niebla">
            {items.length} resultado{items.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}
    </div>
  );
}

function FF({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-niebla mb-1.5">{label}</label>
      {children}
    </div>
  );
}

const inputCls =
  'w-full px-3 py-2 border border-suelo rounded-lg text-sm text-ink bg-blanco focus:outline-none focus:ring-2 focus:ring-arena/30 focus:border-musgo transition';
const selectCls =
  'px-3 py-2.5 border border-suelo rounded-xl text-sm text-ink bg-blanco focus:outline-none focus:ring-2 focus:ring-arena/30 transition';
