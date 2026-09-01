'use client';

import { diagnose } from '@/lib/domain/diagnostics';
import {
  calculateFeasibility,
  calculateScenario,
  SCENARIOS,
  validateInputs,
  type FeasibilityInputs,
} from '@/lib/domain/feasibility';
import { PageLoader } from '@/components/ui';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const EMPTY_INPUTS: FeasibilityInputs = {
  landPrice: 0,
  purchaseCosts: 0,
  landArea: 0,
  buildableArea: 0,
  sellableArea: 0,
  constructionCostPerSqm: 0,
  constructionSqm: 0,
  additionalConstructionCosts: 0,
  professionalFees: 0,
  developerFees: 0,
  adminAndLegalCosts: 0,
  commercializationCosts: 0,
  taxes: 0,
  contingencyPct: 5,
  salePricePerSqm: 0,
  otherIncome: 0,
  saleCommissionPct: 3,
};

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

interface SavedRow {
  id: string;
  name: string;
  address: string;
  neighborhood: string | null;
  date: string;
  observations: string | null;
  inputs: FeasibilityInputs;
  currency: string;
}

export default function FeasibilityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const isNew = id === 'nuevo';

  const [meta, setMeta] = useState({
    name: '',
    address: '',
    neighborhood: '',
    date: '',
    observations: '',
  });
  const [inputs, setInputs] = useState<FeasibilityInputs>(EMPTY_INPUTS);
  const [currency] = useState('USD');
  const [errors, setErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!isNew);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isNew) return;
    fetch(`/api/feasibility/${id}`)
      .then((r) => r.json())
      .then((row: SavedRow) => {
        setMeta({
          name: row.name,
          address: row.address,
          neighborhood: row.neighborhood ?? '',
          date: row.date,
          observations: row.observations ?? '',
        });
        setInputs(row.inputs);
        setLoading(false);
      });
  }, [id, isNew]);

  const results = calculateFeasibility(inputs);
  const diagnosis = diagnose(results);
  const scenarios = {
    conservador: calculateScenario(inputs, SCENARIOS.conservador),
    base: calculateScenario(inputs, SCENARIOS.base),
    optimista: calculateScenario(inputs, SCENARIOS.optimista),
  };

  function updateInput(key: keyof FeasibilityInputs, val: string) {
    const num = parseFloat(val) || 0;
    setInputs((prev) => ({ ...prev, [key]: num }));
  }

  async function handleSave() {
    const valErrors = validateInputs(inputs);
    if (!meta.name.trim() || !meta.address.trim() || !meta.date) {
      valErrors.unshift('Nombre, dirección y fecha son obligatorios.');
    }
    if (valErrors.length) {
      setErrors(valErrors);
      return;
    }
    setErrors([]);
    setSaving(true);

    const body = { ...meta, inputs, currency };
    const method = isNew ? 'POST' : 'PUT';
    const url = isNew ? '/api/feasibility' : `/api/feasibility/${id}`;

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    setSaving(false);
    if (res.ok) {
      setSaved(true);
      if (isNew) {
        const row: SavedRow = await res.json();
        router.push(`/factibilidad/${row.id}`);
      }
    } else {
      const data = await res.json();
      setErrors([data.error ?? 'Error al guardar.']);
    }
  }

  if (loading) {
    return (
      <PageLoader
        kicker="Factibilidad"
        title="Abriendo el análisis"
        hint="Cifras y escenarios del terreno."
      />
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-8 py-10">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.push('/factibilidad')}
          className="flex items-center gap-1 text-niebla hover:text-ink text-sm transition">
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path
              fillRule="evenodd"
              d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
          Factibilidades
        </button>
        <h1 className="font-serif text-2xl font-light text-ink flex-1">
          {isNew ? 'Nuevo análisis' : meta.name || 'Análisis'}
        </h1>
        {!isNew && (
          <span className={`text-xs px-3 py-1 rounded-full border font-medium ${diagnosis.color}`}>
            {diagnosis.label}
          </span>
        )}
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-ink text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-musgo transition disabled:opacity-50">
          {saving ? 'Guardando…' : saved ? '✓ Guardado' : 'Guardar'}
        </button>
      </div>

      {saved && !isNew && (
        <div className="mb-4 flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 flex-shrink-0">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          Cambios guardados correctamente.
        </div>
      )}

      {errors.length > 0 && (
        <div className="mb-4 flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 flex-shrink-0 mt-0.5">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <div className="space-y-1">
            {errors.map((e, i) => (
              <p key={i}>{e}</p>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-8">
        {/* LEFT: Inputs */}
        <div className="space-y-6">
          {/* Datos generales */}
          <Section title="Datos generales">
            <Field label="Nombre del análisis *">
              <Input
                value={meta.name}
                onChange={(v) => setMeta((p) => ({ ...p, name: v }))}
                placeholder="Terreno Palermo Norte"
              />
            </Field>
            <Field label="Dirección *">
              <Input
                value={meta.address}
                onChange={(v) => setMeta((p) => ({ ...p, address: v }))}
                placeholder="Av. Santa Fe 4500"
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Barrio / Zona">
                <Input
                  value={meta.neighborhood}
                  onChange={(v) => setMeta((p) => ({ ...p, neighborhood: v }))}
                  placeholder="Palermo"
                />
              </Field>
              <Field label="Fecha *">
                <Input
                  type="date"
                  value={meta.date}
                  onChange={(v) => setMeta((p) => ({ ...p, date: v }))}
                />
                <p className="text-2xs text-niebla mt-1">Día / mes / año</p>
              </Field>
            </div>
            <Field label="Observaciones">
              <textarea
                value={meta.observations}
                onChange={(e) => setMeta((p) => ({ ...p, observations: e.target.value }))}
                rows={2}
                className="w-full px-3 py-2 border border-suelo rounded-lg text-sm text-ink bg-blanco focus:outline-none focus:ring-2 focus:ring-musgo/20 focus:border-ink resize-none transition"
              />
            </Field>
          </Section>

          {/* Terreno */}
          <Section title="Terreno">
            <div className="grid grid-cols-2 gap-3">
              <NumField
                label="Precio del terreno (USD)"
                value={inputs.landPrice}
                onChange={(v) => updateInput('landPrice', v)}
              />
              <NumField
                label="Gastos de compra (USD)"
                value={inputs.purchaseCosts}
                onChange={(v) => updateInput('purchaseCosts', v)}
              />
              <NumField
                label="Superficie terreno (m²)"
                value={inputs.landArea}
                onChange={(v) => updateInput('landArea', v)}
              />
              <NumField
                label="M² construibles"
                value={inputs.buildableArea}
                onChange={(v) => updateInput('buildableArea', v)}
              />
              <NumField
                label="M² vendibles"
                value={inputs.sellableArea}
                onChange={(v) => updateInput('sellableArea', v)}
              />
            </div>
          </Section>

          {/* Construcción */}
          <Section title="Construcción">
            <div className="grid grid-cols-2 gap-3">
              <NumField
                label="Costo construcción (USD/m²)"
                value={inputs.constructionCostPerSqm}
                onChange={(v) => updateInput('constructionCostPerSqm', v)}
              />
              <NumField
                label="M² a construir"
                value={inputs.constructionSqm}
                onChange={(v) => updateInput('constructionSqm', v)}
              />
              <NumField
                label="Costos adicionales obra (USD)"
                value={inputs.additionalConstructionCosts}
                onChange={(v) => updateInput('additionalConstructionCosts', v)}
              />
              <NumField
                label="Honorarios profesionales (USD)"
                value={inputs.professionalFees}
                onChange={(v) => updateInput('professionalFees', v)}
              />
              <NumField
                label="Honorarios desarrollador (USD)"
                value={inputs.developerFees}
                onChange={(v) => updateInput('developerFees', v)}
              />
              <NumField
                label="Admin y legales (USD)"
                value={inputs.adminAndLegalCosts}
                onChange={(v) => updateInput('adminAndLegalCosts', v)}
              />
              <NumField
                label="Comercialización (USD)"
                value={inputs.commercializationCosts}
                onChange={(v) => updateInput('commercializationCosts', v)}
              />
              <NumField
                label="Impuestos (USD)"
                value={inputs.taxes}
                onChange={(v) => updateInput('taxes', v)}
              />
              <NumField
                label="Contingencia (%)"
                value={inputs.contingencyPct}
                onChange={(v) => updateInput('contingencyPct', v)}
                step="0.5"
              />
            </div>
          </Section>

          {/* Ventas */}
          <Section title="Ventas">
            <div className="grid grid-cols-2 gap-3">
              <NumField
                label="Precio venta (USD/m²)"
                value={inputs.salePricePerSqm}
                onChange={(v) => updateInput('salePricePerSqm', v)}
              />
              <NumField
                label="Otros ingresos (USD)"
                value={inputs.otherIncome}
                onChange={(v) => updateInput('otherIncome', v)}
              />
              <NumField
                label="Comisión venta (%)"
                value={inputs.saleCommissionPct}
                onChange={(v) => updateInput('saleCommissionPct', v)}
                step="0.5"
              />
            </div>
          </Section>
        </div>

        {/* RIGHT: Results */}
        <div className="space-y-6">
          {/* Diagnóstico */}
          <div className={`rounded-xl border p-4 ${diagnosis.color}`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-semibold text-sm">{diagnosis.label}</span>
            </div>
            <p className="text-xs mb-1">
              <span className="font-medium">Fortaleza:</span> {diagnosis.mainStrength}
            </p>
            <p className="text-xs">
              <span className="font-medium">Riesgo:</span> {diagnosis.mainRisk}
            </p>
          </div>

          {/* Resumen financiero */}
          <Section title="Resumen financiero">
            <ResultRow
              label="Costo de adquisición"
              value={fmtCurrency(results.totalAcquisitionCost, currency)}
            />
            <ResultRow
              label="Costo directo de construcción"
              value={fmtCurrency(results.directConstructionCost, currency)}
            />
            <ResultRow label="Contingencia" value={fmtCurrency(results.contingency, currency)} />
            <ResultRow
              label="Costos indirectos totales"
              value={fmtCurrency(results.indirectCosts, currency)}
            />
            <ResultRow
              label="Costo total del proyecto"
              value={fmtCurrency(results.totalProjectCost, currency)}
              highlight
            />
            <div className="border-t border-suelo my-2" />
            <ResultRow label="Ingresos brutos" value={fmtCurrency(results.grossIncome, currency)} />
            <ResultRow
              label="Comisión de venta"
              value={`— ${fmtCurrency(results.saleCommission, currency)}`}
            />
            <ResultRow
              label="Ingresos netos"
              value={fmtCurrency(results.netIncome, currency)}
              highlight
            />
            <div className="border-t border-suelo my-2" />
            <ResultRow
              label="Ganancia estimada"
              value={fmtCurrency(results.netProfit, currency)}
              accent={results.netProfit >= 0 ? 'positive' : 'negative'}
            />
            <ResultRow label="Margen sobre ventas" value={fmtPct(results.marginOnSalesPct)} />
            <ResultRow label="Rentabilidad sobre costos" value={fmtPct(results.returnOnCostPct)} />
            <ResultRow label="ROI" value={fmtPct(results.roi)} />
          </Section>

          {/* Indicadores */}
          <Section title="Indicadores por m²">
            <ResultRow
              label="Costo por m² vendible"
              value={fmtCurrency(results.costPerSellableSqm, currency)}
            />
            <ResultRow
              label="Incidencia del terreno/m²"
              value={fmtCurrency(results.landIncidencePerSellableSqm, currency)}
            />
            <ResultRow
              label="Precio mínimo de venta/m²"
              value={fmtCurrency(results.minSalePriceToBreakEven, currency)}
              highlight
            />
            <div className="border-t border-suelo my-2" />
            <ResultRow
              label="M² para punto de equilibrio"
              value={`${results.breakEvenSqm.toFixed(0)} m²`}
            />
            <ResultRow
              label="% m² para cubrir costos"
              value={fmtPct(results.breakEvenPct)}
              highlight
            />
            <ResultRow
              label="Precio máx. terreno (15% ret.)"
              value={fmtCurrency(results.maxLandPriceForMinReturn, currency)}
            />
          </Section>

          {/* Escenarios */}
          <Section title="Comparación de escenarios">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-niebla">
                    <th className="text-left py-1 font-medium">Indicador</th>
                    <th className="text-right py-1 font-medium">Conservador</th>
                    <th className="text-right py-1 font-medium text-musgo">Base</th>
                    <th className="text-right py-1 font-medium">Optimista</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-suelo">
                  {[
                    {
                      label: 'Ganancia',
                      fmt: (r: typeof results) => fmtCurrency(r.netProfit, currency),
                    },
                    { label: 'ROI', fmt: (r: typeof results) => fmtPct(r.roi) },
                    {
                      label: 'Margen ventas',
                      fmt: (r: typeof results) => fmtPct(r.marginOnSalesPct),
                    },
                    {
                      label: 'P. equilibrio',
                      fmt: (r: typeof results) => `${r.breakEvenPct.toFixed(0)}%`,
                    },
                    {
                      label: 'Costo total',
                      fmt: (r: typeof results) => fmtCurrency(r.totalProjectCost, currency),
                    },
                  ].map(({ label, fmt }) => (
                    <tr key={label}>
                      <td className="py-1.5 text-niebla">{label}</td>
                      <td className="py-1.5 text-right text-ink">
                        {fmt(scenarios.conservador)}
                      </td>
                      <td className="py-1.5 text-right text-musgo font-medium">
                        {fmt(scenarios.base)}
                      </td>
                      <td className="py-1.5 text-right text-ink">
                        {fmt(scenarios.optimista)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-2xs text-niebla mt-2">
              Conservador: precio −10%, costo +10%, contingencia 10% · Base: valores ingresados ·
              Optimista: precio +10%, costo −5%, contingencia 3%
            </p>
          </Section>
        </div>
      </div>
    </div>
  );
}

// ─── Micro-components ────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-blanco border border-suelo rounded-xl p-5 ">
      <h2 className="text-sm font-medium text-ink mb-4 pb-3 border-b border-suelo">
        {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-ink mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      lang={type === 'date' ? 'es-AR' : undefined}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2.5 border border-suelo rounded-lg text-sm text-ink bg-blanco focus:outline-none focus:ring-2 focus:ring-musgo/20 focus:border-ink transition placeholder:text-niebla"
    />
  );
}

function NumField({
  label,
  value,
  onChange,
  step = '1',
}: {
  label: string;
  value: number;
  onChange: (v: string) => void;
  step?: string;
}) {
  return (
    <Field label={label}>
      <input
        type="number"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        step={step}
        min="0"
        className="w-full px-3 py-2 border border-suelo rounded-lg text-sm text-ink bg-blanco focus:outline-none focus:ring-2 focus:ring-musgo/20 focus:border-ink transition"
      />
    </Field>
  );
}

function ResultRow({
  label,
  value,
  highlight,
  accent,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  accent?: 'positive' | 'negative';
}) {
  return (
    <div className={`flex justify-between items-center py-1 ${highlight ? 'font-semibold' : ''}`}>
      <span className={`text-sm ${highlight ? 'text-ink' : 'text-niebla'}`}>{label}</span>
      <span
        className={`text-sm font-medium ${
          accent === 'positive'
            ? 'text-musgo'
            : accent === 'negative'
              ? 'text-red-600'
              : highlight
                ? 'text-ink'
                : 'text-ink'
        }`}>
        {value}
      </span>
    </div>
  );
}
