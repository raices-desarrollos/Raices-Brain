'use client';

import { EmptyState, ListSkeleton, PageHeader, PageShell, PrimaryButton, StatusBadge } from '@/components/ui';
import { formatMoney, formatProjectName } from '@/lib/format';
import { useEffect, useState } from 'react';

type Invoice = {
  id: string;
  number: string | null;
  supplierName: string;
  projectRef: string | null;
  issueDate: string | null;
  amount: number;
  currency: string;
  category: string;
  status: string;
  driveWebViewLink: string | null;
};

const STATUS: Record<string, string> = {
  pendiente: 'Pendiente',
  pagada: 'Pagada',
  parcial: 'Parcial',
  anulada: 'Anulada',
};

const METHODS = [
  { id: 'transferencia', label: 'Transferencia' },
  { id: 'efectivo', label: 'Efectivo' },
  { id: 'cheque', label: 'Cheque' },
  { id: 'otro', label: 'Otro' },
];

export default function FacturasPage() {
  const [items, setItems] = useState<Invoice[]>([]);
  const [error, setError] = useState('');
  const [project, setProject] = useState('ceibo-vidal');
  const [supplier, setSupplier] = useState('');
  const [status, setStatus] = useState('');
  const [payReceipt, setPayReceipt] = useState('');
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState<Invoice | null>(null);
  const [payDate, setPayDate] = useState('');
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('transferencia');
  const [payNote, setPayNote] = useState('');
  const [payBusy, setPayBusy] = useState(false);
  const [payError, setPayError] = useState('');

  async function load() {
    setLoading(true);
    const params = new URLSearchParams();
    if (project) params.set('project', project);
    if (supplier) params.set('supplier', supplier);
    if (status) params.set('status', status);
    const res = await fetch(`/api/invoices?${params}`);
    setLoading(false);
    if (res.status === 503) {
      const data = await res.json();
      setError(data.error);
      setItems([]);
      return;
    }
    if (res.ok) {
      setError('');
      setItems(await res.json());
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openPay(i: Invoice) {
    setPaying(i);
    setPayDate(new Date().toISOString().slice(0, 10));
    setPayAmount(String(i.amount));
    setPayMethod('transferencia');
    setPayNote('');
    setPayReceipt('');
    setPayError('');
  }

  async function confirmPay() {
    if (!paying) return;
    setPayBusy(true);
    setPayError('');
    const res = await fetch(`/api/invoices/${paying.id}/pay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paidDate: payDate,
        amount: parseFloat(payAmount) || paying.amount,
        method: payMethod,
        observations: [payNote, payReceipt ? `Comprobante: ${payReceipt}` : '']
          .filter(Boolean)
          .join('\n'),
      }),
    });
    setPayBusy(false);
    if (!res.ok) {
      const data = await res.json();
      setPayError(data.error ?? 'No se pudo registrar el pago.');
      return;
    }
    setPaying(null);
    load();
  }

  return (
    <PageShell wide>
      <PageHeader
        kicker="Operación"
        title="Facturas"
        description="Subí, revisá y marcá como pagada. El archivo vive en Drive."
        action={<PrimaryButton href="/facturas/nueva">Subir factura</PrimaryButton>}
      />

      <div className="flex flex-wrap gap-6 mb-8">
        <label className="block">
          <span className="block text-2xs uppercase tracking-wider text-niebla mb-1">Proyecto</span>
          <select
            value={project}
            onChange={(e) => setProject(e.target.value)}
            className="text-sm bg-transparent border-b border-suelo py-1 outline-none">
            <option value="ceibo-vidal">Ceibo Vidal</option>
            <option value="">Todos</option>
          </select>
        </label>
        <label className="block">
          <span className="block text-2xs uppercase tracking-wider text-niebla mb-1">Proveedor</span>
          <input
            value={supplier}
            onChange={(e) => setSupplier(e.target.value)}
            placeholder="Todos"
            className="text-sm border-b border-suelo bg-transparent py-1 outline-none w-40"
          />
        </label>
        <label className="block">
          <span className="block text-2xs uppercase tracking-wider text-niebla mb-1">Estado</span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="text-sm bg-transparent border-b border-suelo py-1 outline-none">
            <option value="">Todos</option>
            {Object.entries(STATUS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </label>
        <button onClick={load} className="self-end text-sm text-musgo py-1">
          Filtrar
        </button>
      </div>

      {error && <p className="text-sm text-ceibo mb-6">{error}</p>}

      {loading ? (
        <ListSkeleton rows={7} />
      ) : !items.length && !error ? (
        <EmptyState
          title="Todavía no hay facturas"
          description="Arrastrá un PDF o una foto. Revisás los datos y confirmás."
          actionLabel="Subir factura"
          actionHref="/facturas/nueva"
        />
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-2xs uppercase tracking-wider text-niebla">
              {['Fecha', 'Proveedor', 'Proyecto', 'Categoría', 'Total', 'Estado', ''].map((h) => (
                <th key={h} className="py-2 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((i) => (
              <tr key={i.id} className="border-t border-suelo">
                <td className="py-3 text-niebla">{i.issueDate ?? '—'}</td>
                <td>
                  {i.supplierName}
                  {i.number && <span className="text-niebla text-2xs block">{i.number}</span>}
                </td>
                <td className="text-niebla">{formatProjectName(i.projectRef)}</td>
                <td className="text-niebla">{i.category}</td>
                <td>{formatMoney(i.amount, i.currency)}</td>
                <td><StatusBadge status={i.status} /></td>
                <td className="text-right whitespace-nowrap">
                  {i.status === 'pendiente' && (
                    <button onClick={() => openPay(i)} className="text-2xs text-musgo mr-3">
                      Marcar pagada
                    </button>
                  )}
                  {i.driveWebViewLink && (
                    <a href={i.driveWebViewLink} target="_blank" rel="noreferrer" className="text-2xs text-niebla">
                      Ver archivo
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {paying && (
        <div className="fixed inset-0 bg-ink/40 flex items-center justify-center z-50 px-4">
          <div className="bg-blanco max-w-md w-full p-6 rounded-2xl">
            <h2 className="font-serif text-xl font-light text-ink mb-1">Marcar como pagada</h2>
            <p className="text-sm text-niebla mb-6">
              {paying.supplierName}
              {paying.number ? ` · ${paying.number}` : ''}
              {' · '}
              {formatMoney(paying.amount, paying.currency)}
            </p>
            <label className="block mb-4">
              <span className="text-2xs uppercase tracking-wider text-niebla">Fecha de pago</span>
              <input
                type="date"
                lang="es-AR"
                value={payDate}
                onChange={(e) => setPayDate(e.target.value)}
                className="w-full border-b border-suelo py-1.5 text-sm outline-none"
              />
              <span className="text-2xs text-niebla">Día / mes / año</span>
            </label>
            <label className="block mb-4">
              <span className="text-2xs uppercase tracking-wider text-niebla">Monto</span>
              <input
                type="number"
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                className="w-full border-b border-suelo py-1.5 text-sm outline-none"
              />
            </label>
            <label className="block mb-4">
              <span className="text-2xs uppercase tracking-wider text-niebla">Medio de pago</span>
              <select
                value={payMethod}
                onChange={(e) => setPayMethod(e.target.value)}
                className="w-full border-b border-suelo py-1.5 text-sm outline-none bg-transparent">
                {METHODS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block mb-4">
              <span className="text-2xs uppercase tracking-wider text-niebla">Comprobante (opcional)</span>
              <input
                value={payReceipt}
                onChange={(e) => setPayReceipt(e.target.value)}
                placeholder="Número o enlace"
                className="w-full border-b border-suelo py-1.5 text-sm outline-none"
              />
            </label>
            <label className="block mb-4">
              <span className="text-2xs uppercase tracking-wider text-niebla">Observación</span>
              <textarea
                value={payNote}
                onChange={(e) => setPayNote(e.target.value)}
                className="w-full border-b border-suelo py-1.5 text-sm outline-none"
                rows={2}
              />
            </label>
            {payError && <p className="text-sm text-ceibo mb-3">{payError}</p>}
            <div className="flex gap-3 justify-end">
              <button type="button" onClick={() => setPaying(null)} className="text-sm text-niebla">
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmPay}
                disabled={payBusy}
                className="text-sm bg-ink text-blanco px-4 py-2 rounded-lg disabled:opacity-50">
                {payBusy ? 'Guardando…' : 'Confirmar pago'}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}
