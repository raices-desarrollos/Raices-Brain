'use client';

import { LoadingLine } from '@/components/ui';
import { useEffect, useState } from 'react';

const CATEGORY_COLORS: Record<string, string> = {
  socio:       'bg-blue-50 text-blue-700',
  inversor:    'bg-blue-50 text-blue-700',
  propietario: 'bg-purple-50 text-purple-700',
  inmobiliaria:'bg-indigo-50 text-indigo-700',
  arquitecto:  'bg-gray-100 text-gray-700',
  constructor: 'bg-gray-100 text-gray-700',
  proveedor:   'bg-gray-100 text-gray-500',
  contador:    'bg-amber-50 text-amber-700',
  abogado:     'bg-amber-50 text-amber-700',
  escribano:   'bg-amber-50 text-amber-700',
  comprador:   'bg-green-50 text-green-700',
  otro:        'bg-gray-100 text-gray-500',
};

function Initials({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0">
      <span className="text-amber-700 text-xs font-semibold">{initials}</span>
    </div>
  );
}

const CATEGORIES = [
  'socio',
  'inversor',
  'propietario',
  'inmobiliaria',
  'arquitecto',
  'constructor',
  'proveedor',
  'contador',
  'abogado',
  'escribano',
  'comprador',
  'otro',
];

interface Contact {
  id: string;
  name: string;
  company: string | null;
  category: string;
  phone: string | null;
  email: string | null;
  notes: string | null;
  createdAt: string;
}

const EMPTY = { name: '', company: '', category: 'otro', phone: '', email: '', notes: '' };

export default function ContactosPage() {
  const [items, setItems] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function load(q = search, cat = filterCat) {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (cat) params.set('category', cat);
    const res = await fetch(`/api/contacts?${params}`);
    if (res.ok) setItems(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSave() {
    setError('');
    setSaving(true);
    const method = editing ? 'PUT' : 'POST';
    const url = editing ? `/api/contacts/${editing}` : '/api/contacts';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) {
      setShowForm(false);
      setEditing(null);
      setForm(EMPTY);
      load();
    } else {
      const data = await res.json();
      setError(data.error ?? 'Error al guardar.');
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`¿Eliminar contacto "${name}"?`)) return;
    await fetch(`/api/contacts/${id}`, { method: 'DELETE' });
    load();
  }

  function openEdit(c: Contact) {
    setForm({
      name: c.name,
      company: c.company ?? '',
      category: c.category,
      phone: c.phone ?? '',
      email: c.email ?? '',
      notes: c.notes ?? '',
    });
    setEditing(c.id);
    setShowForm(true);
  }

  return (
    <div className="max-w-5xl mx-auto px-8 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-gray-400 text-xs tracking-widest uppercase mb-1">Administración</p>
          <h1 className="text-2xl font-semibold text-gray-900">Contactos</h1>
          <p className="text-gray-400 text-sm mt-0.5">
            {items.length} contacto{items.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => {
            setForm(EMPTY);
            setEditing(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-900 transition">
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
          Nuevo contacto
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); load(e.target.value, filterCat); }}
            placeholder="Buscar por nombre, email o empresa…"
            className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition"
          />
        </div>
        <select
          value={filterCat}
          onChange={(e) => { setFilterCat(e.target.value); load(search, e.target.value); }}
          className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition min-w-40">
          <option value="">Todas las categorías</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
          ))}
        </select>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-xl w-full max-w-md p-6">
            <h2 className="font-semibold text-gray-900 mb-4">
              {editing ? 'Editar contacto' : 'Nuevo contacto'}
            </h2>
            <div className="space-y-3">
              <FormField label="Nombre *">
                <input
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  className={inputCls}
                />
              </FormField>
              <FormField label="Empresa">
                <input
                  value={form.company}
                  onChange={(e) => setForm((p) => ({ ...p, company: e.target.value }))}
                  className={inputCls}
                />
              </FormField>
              <FormField label="Categoría *">
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
              </FormField>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Teléfono">
                  <input
                    value={form.phone}
                    onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                    className={inputCls}
                  />
                </FormField>
                <FormField label="Email">
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                    className={inputCls}
                  />
                </FormField>
              </div>
              <FormField label="Notas">
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                  rows={2}
                  className={`${inputCls} resize-none`}
                />
              </FormField>
            </div>
            {error && <p className="text-red-600 text-xs mt-3">{error}</p>}
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-900 transition disabled:opacity-50">
                {saving ? 'Guardando…' : 'Guardar'}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="text-sm text-gray-400 hover:text-gray-900 transition">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex justify-center">
          <LoadingLine label="Abriendo contactos…" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-gray-200 rounded-xl text-gray-400 text-sm">
          No hay contactos que coincidan.
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200">
              <tr className="bg-gray-50">
                {['Contacto', 'Categoría', 'Teléfono', 'Email', ''].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-2xs text-gray-400 font-semibold uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <Initials name={c.name} />
                      <div>
                        <p className="font-medium text-gray-900">{c.name}</p>
                        {c.company && <p className="text-2xs text-gray-400 mt-0.5">{c.company}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-2xs font-medium px-2.5 py-1 rounded-full capitalize ${CATEGORY_COLORS[c.category] ?? 'bg-gray-100 text-gray-400'}`}>
                      {c.category}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-400">{c.phone ?? '—'}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-400">{c.email ?? '—'}</td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(c)}
                        className="p-1.5 rounded-lg text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition">
                        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                      </button>
                      <button
                        onClick={() => handleDelete(c.id, c.name)}
                        className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 transition">
                        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-5 py-3 border-t border-gray-200 bg-gray-50/60 text-2xs text-gray-400">
            {items.length} resultado{items.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-600 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

const inputCls =
  'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition';
