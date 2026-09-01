'use client';

import { INVOICE_CATEGORIES } from '@/lib/domain/catalog';
import { validateInvoiceFile } from '@/lib/uploads';
import { Overlay } from '@/components/ui';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';

type Extracted = {
  supplierName: string;
  cuit: string;
  number: string;
  issueDate: string;
  dueDate: string;
  subtotal: string;
  taxAmount: string;
  amount: string;
  currency: string;
  concept: string;
  category: string;
  projectRef: string;
  notes: string;
  extractionAvailable: boolean;
  extractionNote: string;
};

const EMPTY: Extracted = {
  supplierName: '',
  cuit: '',
  number: '',
  issueDate: '',
  dueDate: '',
  subtotal: '',
  taxAmount: '',
  amount: '',
  currency: 'ARS',
  concept: '',
  category: 'otro',
  projectRef: 'ceibo-vidal',
  notes: '',
  extractionAvailable: false,
  extractionNote: '',
};

const inputClass =
  'w-full bg-transparent border-b border-suelo py-1.5 text-sm outline-none focus:border-ink';

export default function NuevaFacturaPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [form, setField] = useState<Extracted>(EMPTY);
  const [step, setStep] = useState<'upload' | 'review'>('upload');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [drag, setDrag] = useState(false);

  function set<K extends keyof Extracted>(key: K, value: Extracted[K]) {
    setField((f) => ({ ...f, [key]: value }));
  }

  async function analyze(selected: File) {
    const invalid = validateInvoiceFile(selected);
    if (invalid) {
      setError(invalid);
      return;
    }
    setError('');
    setBusy(true);
    setFile(selected);
    const fd = new FormData();
    fd.append('file', selected);
    try {
      const res = await fetch('/api/invoices/extract', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'No se pudo leer el archivo.');
        setBusy(false);
        return;
      }
      setField({ ...EMPTY, ...data });
      setStep('review');
    } catch {
      setError('No se pudo leer el archivo. Reintentá.');
    } finally {
      setBusy(false);
    }
  }

  async function confirm() {
    if (!form.supplierName.trim() || !form.amount) {
      setError('Proveedor y total son obligatorios.');
      return;
    }
    setBusy(true);
    setError('');
    const fd = new FormData();
    if (file) fd.append('file', file);
    Object.entries(form).forEach(([k, v]) => {
      if (k === 'extractionAvailable' || k === 'extractionNote') return;
      fd.append(k, String(v ?? ''));
    });
    const res = await fetch('/api/invoices', { method: 'POST', body: fd });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? 'No se pudo guardar.');
      return;
    }
    router.push('/facturas');
    router.refresh();
  }

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-8 py-8 sm:py-10">
      <p className="text-2xs tracking-[0.2em] uppercase text-niebla mb-2">Facturas</p>
      <h1 className="font-serif text-3xl font-light text-ink mb-2">Subir factura</h1>
      <p className="text-sm text-niebla mb-8">
        PDF, JPG o PNG. Brain propone los datos. Siempre revisás antes de guardar. El archivo queda
        en Drive, en Ceibo Vidal / Facturas.
      </p>

      {step === 'upload' && (
        <div className="relative min-h-[12rem]">
          {busy && (
            <Overlay
              title="Leyendo factura…"
              description="Esto puede tardar unos segundos. Revisá los datos antes de guardar."
            />
          )}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            const f = e.dataTransfer.files[0];
            if (f) analyze(f);
          }}
          className={`border border-dashed rounded-xl px-6 py-14 text-center ${drag ? 'border-ink bg-suelo/40' : 'border-arena'}`}>
          <p className="text-sm text-ink mb-3">PDF, JPG o PNG · hasta 12 MB</p>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={busy}
            className="text-sm border border-ink rounded-lg px-4 py-2 disabled:opacity-50">
            Elegir archivo
          </button>
          <input
            ref={fileRef}
            type="file"
            className="hidden"
            accept="application/pdf,image/jpeg,image/png,image/webp"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) analyze(f);
            }}
          />
        </div>
        {error && <p className="text-sm text-ceibo mt-4">{error}</p>}
        </div>
      )}

      {step === 'review' && (
        <div className="space-y-4">
          {file && <p className="text-xs text-niebla">Archivo: {file.name}</p>}
          {form.extractionNote && <p className="text-xs text-tierra">{form.extractionNote}</p>}

          <Field label="Proveedor">
            <input value={form.supplierName} onChange={(e) => set('supplierName', e.target.value)} className={inputClass} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="CUIT">
              <input value={form.cuit} onChange={(e) => set('cuit', e.target.value)} className={inputClass} />
            </Field>
            <Field label="Nº factura">
              <input value={form.number} onChange={(e) => set('number', e.target.value)} className={inputClass} />
            </Field>
          </div>
          <Field label="Concepto">
            <input value={form.concept} onChange={(e) => set('concept', e.target.value)} className={inputClass} />
          </Field>
          <div className="grid grid-cols-3 gap-4">
            <Field label="Subtotal">
              <input value={form.subtotal} onChange={(e) => set('subtotal', e.target.value)} type="number" className={inputClass} />
            </Field>
            <Field label="Impuestos">
              <input value={form.taxAmount} onChange={(e) => set('taxAmount', e.target.value)} type="number" className={inputClass} />
            </Field>
            <Field label="Total">
              <input value={form.amount} onChange={(e) => set('amount', e.target.value)} type="number" className={inputClass} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Moneda">
              <select value={form.currency} onChange={(e) => set('currency', e.target.value)} className={inputClass}>
                <option>ARS</option>
                <option>USD</option>
              </select>
            </Field>
            <Field label="Categoría">
              <select value={form.category} onChange={(e) => set('category', e.target.value)} className={inputClass}>
                {INVOICE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Fecha">
              <input type="date" value={form.issueDate} onChange={(e) => set('issueDate', e.target.value)} className={inputClass} />
            </Field>
            <Field label="Vencimiento">
              <input type="date" value={form.dueDate} onChange={(e) => set('dueDate', e.target.value)} className={inputClass} />
            </Field>
          </div>
          <Field label="Proyecto">
            <input value={form.projectRef} onChange={(e) => set('projectRef', e.target.value)} className={inputClass} />
          </Field>
          <Field label="Notas">
            <textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} className={inputClass} rows={2} />
          </Field>

          {error && <p className="text-sm text-ceibo">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setStep('upload');
                setFile(null);
                setError('');
              }}
              className="text-sm text-niebla">
              Volver
            </button>
            <button
              type="button"
              onClick={confirm}
              disabled={busy}
              className="text-sm bg-ink text-blanco px-5 py-2 rounded-lg disabled:opacity-50">
              {busy ? 'Guardando en Drive…' : 'Confirmar'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-2xs uppercase tracking-wider text-niebla">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
