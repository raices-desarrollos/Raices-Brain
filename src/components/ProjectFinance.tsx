'use client';

import { EmptyState, LoadingLine, Spinner } from '@/components/ui';
import { formatShare, formatUsd } from '@/lib/format';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

type Partner = {
  name: string;
  firstName: string;
  usd: number;
  usdDirect: number;
  arsConverted: number;
  arsNominal: number;
  movements: number;
  share: number;
  committed: number | null;
  ledgerBalance: number | null;
};

type Line = { category: string; usd: number; movements: number };

type Finance = {
  currency: string;
  periodLabel: string | null;
  lastMovementDate: string | null;
  partners: Partner[];
  contributions: {
    total: number;
    usdDirect: number;
    arsConverted: number;
    arsNominal: number;
    movements: number;
  };
  expenses: { total: number; land: number; other: number; landLines: Line[]; otherLines: Line[] };
  income: { total: number; lines: Line[] };
  capital: {
    committed: number | null;
    contributed: number;
    pending: number | null;
    progress: number | null;
  };
  sources: { name: string; fileId: string; webViewLink: string | null; modifiedTime: string | null }[];
  warnings: string[];
  syncedAt: string;
};

function useFinance(slug: string) {
  const [data, setData] = useState<Finance | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(
    async (refresh = false) => {
      if (refresh) setRefreshing(true);
      try {
        const res = await fetch(`/api/projects/${slug}/finance${refresh ? '?refresh=1' : ''}`);
        const body = await res.json().catch(() => null);
        if (!res.ok) {
          setError(body?.error ?? 'No se pudieron leer las planillas.');
          setData(null);
        } else {
          setData(body);
          setError('');
        }
      } catch {
        setError('No se pudieron leer las planillas.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [slug],
  );

  useEffect(() => {
    load();
  }, [load]);

  return { data, error, loading, refreshing, refresh: () => load(true) };
}

// ─── Piezas de UI ────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: ReactNode }) {
  return <p className="text-2xs tracking-[0.18em] uppercase text-niebla">{children}</p>;
}

function Stat({
  label,
  value,
  accent,
  muted,
  children,
}: {
  label: string;
  value: string;
  accent: string;
  muted?: boolean;
  children?: ReactNode;
}) {
  return (
    <div className="bg-blanco px-5 py-6 flex flex-col">
      <div className="flex items-center gap-2">
        <span className={`w-1.5 h-1.5 rounded-full ${accent}`} aria-hidden />
        <SectionLabel>{label}</SectionLabel>
      </div>
      <p
        className={`mt-3 font-normal text-[2rem] leading-none tracking-tight tabular-nums ${
          muted ? 'text-niebla' : 'text-ink'
        }`}>
        {value}
      </p>
      {children}
    </div>
  );
}

/** Barra de una sola serie, con el ancho como proporción del total. */
function Bar({ share, className }: { share: number; className: string }) {
  return (
    <span className="block h-1 rounded-full bg-suelo overflow-hidden" aria-hidden>
      <span
        className={`block h-full rounded-full ${className}`}
        style={{ width: `${Math.max(Math.min(share, 1), 0) * 100}%` }}
      />
    </span>
  );
}

function LineRow({ line, max, accent }: { line: Line; max: number; accent: string }) {
  return (
    <li className="py-2.5 flex items-center gap-3 sm:gap-5">
      <span className="text-sm text-ink flex-1 min-w-0 truncate">{line.category}</span>
      <span className="hidden sm:block w-28 shrink-0">
        <Bar share={max > 0 ? line.usd / max : 0} className={accent} />
      </span>
      <span className="text-sm text-ink tabular-nums w-28 text-right shrink-0">
        {formatUsd(line.usd, { decimals: false })}
      </span>
    </li>
  );
}

function Initials({ name }: { name: string }) {
  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <span className="w-9 h-9 rounded-full bg-lino flex items-center justify-center shrink-0">
      <span className="text-2xs font-medium text-tierra tracking-wide">{initials}</span>
    </span>
  );
}

// ─── Tablero completo ────────────────────────────────────────────────────────

export function ProjectFinance({ slug }: { slug: string }) {
  const { data, error, loading, refreshing, refresh } = useFinance(slug);

  if (loading) return <LoadingLine label="Leyendo las planillas de Finanzas…" />;

  if (error || !data) {
    return (
      <div>
        <SectionLabel>Informe económico</SectionLabel>
        <div className="mt-4">
          <EmptyState
            compact
            title="No se pudo armar el informe"
            description={
              error ||
              'Las planillas de administración viven en Drive, en la carpeta Finanzas del proyecto.'
            }
          />
        </div>
      </div>
    );
  }

  const { contributions, expenses, income, capital, partners } = data;
  const expenseMax = Math.max(expenses.land, ...expenses.otherLines.map((l) => l.usd), 1);
  const landShare = expenses.total > 0 ? expenses.land / expenses.total : 0;
  const primarySource = data.sources[0];

  return (
    <section>
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-6">
        <div>
          <SectionLabel>Informe económico</SectionLabel>
          <h2 className="font-serif text-2xl font-normal text-ink mt-1.5">Administración de fondos</h2>
          <p className="text-xs text-niebla mt-1">
            {data.periodLabel
              ? data.periodLabel.charAt(0) + data.periodLabel.slice(1).toLowerCase()
              : 'Según las planillas de Finanzas'}
          </p>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <button
            onClick={refresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 text-xs text-niebla hover:text-ink transition-colors disabled:opacity-50">
            {refreshing && <Spinner className="w-3 h-3" />}
            {refreshing ? 'Actualizando…' : 'Actualizar'}
          </button>
          {primarySource?.webViewLink && (
            <a
              href={primarySource.webViewLink}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-musgo hover:text-ink transition-colors">
              Abrir planilla
            </a>
          )}
        </div>
      </header>

      {/* KPIs principales */}
      <div className="grid gap-px bg-suelo rounded-xl border border-suelo overflow-hidden sm:grid-cols-3">
        <Stat
          label="Aportes de socios"
          value={formatUsd(contributions.total, { decimals: false })}
          accent="bg-musgo">
          <p className="text-xs text-niebla mt-2">
            {partners.length} socios · {contributions.movements} movimientos
          </p>
          <div className="mt-auto pt-4 space-y-1.5">
            {partners.map((p) => (
              <div key={p.name} className="flex items-center gap-2">
                <span className="text-xs text-niebla w-16 shrink-0 truncate">{p.firstName}</span>
                <span className="flex-1">
                  <Bar share={p.share} className="bg-musgo" />
                </span>
                <span className="text-xs text-ink tabular-nums">{formatShare(p.share, 1)}</span>
              </div>
            ))}
          </div>
        </Stat>

        <Stat
          label="Egresos"
          value={formatUsd(expenses.total, { decimals: false })}
          accent="bg-tierra">
          <p className="text-xs text-niebla mt-2">Todo lo pagado hasta hoy</p>
          <div className="mt-auto pt-4">
            <span className="flex h-1 rounded-full overflow-hidden bg-suelo" aria-hidden>
              <span className="bg-ink" style={{ width: `${landShare * 100}%` }} />
              <span className="bg-arena" style={{ width: `${(1 - landShare) * 100}%` }} />
            </span>
            <dl className="mt-2.5 space-y-1">
              <div className="flex items-baseline justify-between gap-2">
                <dt className="text-xs text-niebla flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-ink" aria-hidden />
                  Terreno
                </dt>
                <dd className="text-xs text-ink tabular-nums">
                  {formatUsd(expenses.land, { decimals: false })}
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-2">
                <dt className="text-xs text-niebla flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-arena" aria-hidden />
                  Resto
                </dt>
                <dd className="text-xs text-ink tabular-nums">
                  {formatUsd(expenses.other, { decimals: false })}
                </dd>
              </div>
            </dl>
          </div>
        </Stat>

        <Stat
          label="Ingresos"
          value={formatUsd(income.total, { decimals: false })}
          accent={income.total > 0 ? 'bg-liquen' : 'bg-niebla'}
          muted={income.total === 0}>
          <p className="text-xs text-niebla mt-2">
            {income.total > 0
              ? `${income.lines.length} rubro${income.lines.length === 1 ? '' : 's'} con ventas`
              : 'La preventa todavía no arrancó'}
          </p>
          {income.total === 0 && (
            <p className="mt-auto pt-4 text-xs text-niebla leading-relaxed">
              Cuando se carguen ventas en la planilla de fondos, el ingreso aparece acá
              automáticamente.
            </p>
          )}
        </Stat>
      </div>

      {/* Aportes por socio */}
      <div className="mt-12">
        <div className="flex items-baseline justify-between gap-4 mb-3">
          <SectionLabel>Aportes por socio</SectionLabel>
          <p className="text-xs text-niebla">USD equivalente</p>
        </div>
        <ul className="divide-y divide-suelo border-y border-suelo">
          {partners.map((p) => (
            <li key={p.name} className="py-4 flex items-center gap-4">
              <Initials name={p.name} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-ink truncate">{p.name}</p>
                <p className="text-xs text-niebla mt-0.5">
                  {formatShare(p.share, 1)} del total · {p.movements} movimientos
                  {p.arsConverted > 0 &&
                    ` · ${formatUsd(p.arsConverted, { decimals: false })} en pesos`}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-base font-normal text-ink tabular-nums">
                  {formatUsd(p.usd, { decimals: false })}
                </p>
                {p.ledgerBalance != null && (
                  <p className="text-xs text-niebla mt-0.5">
                    resta {formatUsd(p.ledgerBalance, { decimals: false })}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>

        {capital.committed != null && capital.progress != null && (
          <div className="mt-5 rounded-xl border border-suelo px-5 py-4">
            <div className="flex items-baseline justify-between gap-4">
              <p className="text-xs text-ink">Capital comprometido</p>
              <p className="text-sm text-ink tabular-nums">
                {formatUsd(capital.committed, { decimals: false })}
              </p>
            </div>
            <div className="mt-3">
              <Bar share={capital.progress} className="bg-ink" />
            </div>
            <div className="mt-2 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <p className="text-xs text-niebla">
                Integrado {formatUsd(capital.contributed, { decimals: false })} ·{' '}
                {formatShare(capital.progress, 0)}
              </p>
              {capital.pending != null && (
                <p className="text-xs text-tierra">
                  Pendiente {formatUsd(capital.pending, { decimals: false })}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Composición de egresos */}
      <div className="mt-12">
        <div className="flex items-baseline justify-between gap-4 mb-3">
          <SectionLabel>Composición de egresos</SectionLabel>
          <p className="text-xs text-niebla">
            {formatShare(landShare, 0)} es el terreno
          </p>
        </div>
        <ul className="divide-y divide-suelo border-y border-suelo">
          {expenses.landLines.map((line) => (
            <LineRow key={line.category} line={line} max={expenseMax} accent="bg-ink" />
          ))}
          {expenses.otherLines.map((line) => (
            <LineRow key={line.category} line={line} max={expenseMax} accent="bg-arena" />
          ))}
        </ul>
        <div className="flex items-center justify-between gap-4 pt-3">
          <span className="text-xs text-niebla">Total</span>
          <span className="text-sm text-ink tabular-nums">
            {formatUsd(expenses.total, { decimals: false })}
          </span>
        </div>
      </div>

      {/* Notas al pie */}
      {data.warnings.length > 0 && (
        <div className="mt-10 rounded-xl border border-arena/50 bg-lino/40 px-4 py-3.5">
          <p className="text-2xs tracking-[0.16em] uppercase text-tierra mb-2">A revisar</p>
          <ul className="space-y-1.5">
            {data.warnings.map((w) => (
              <li key={w} className="text-xs text-ink leading-relaxed">
                {w}
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="mt-6 text-xs text-niebla leading-relaxed">
        Calculado sobre {data.sources.map((s) => s.name).join(' y ')} en Drive · Finanzas.
        {data.lastMovementDate &&
          ` Último movimiento registrado: ${new Date(data.lastMovementDate).toLocaleDateString(
            'es-AR',
            { day: 'numeric', month: 'long', year: 'numeric' },
          )}.`}
      </p>
    </section>
  );
}

// ─── Resumen compacto (Inicio) ───────────────────────────────────────────────

export function FinanceSummary({ slug }: { slug: string }) {
  const { data, error, loading } = useFinance(slug);

  if (loading) return <LoadingLine label="Leyendo las planillas de Finanzas…" />;
  if (error || !data) return null;

  const items = [
    {
      label: 'Aportes de socios',
      value: formatUsd(data.contributions.total, { decimals: false }),
      sub: `${data.partners.length} socios`,
      accent: 'bg-musgo',
    },
    {
      label: 'Egresos',
      value: formatUsd(data.expenses.total, { decimals: false }),
      sub: `Terreno ${formatUsd(data.expenses.land, { decimals: false })}`,
      accent: 'bg-tierra',
    },
    {
      label: 'Ingresos',
      value: formatUsd(data.income.total, { decimals: false }),
      sub: data.income.total > 0 ? 'Ventas registradas' : 'Sin ventas todavía',
      accent: data.income.total > 0 ? 'bg-liquen' : 'bg-niebla',
    },
  ];

  return (
    <section>
      <div className="flex items-baseline justify-between gap-4 mb-4">
        <SectionLabel>Informe económico</SectionLabel>
        <Link href={`/projects/${slug}`} className="text-xs text-musgo hover:text-ink transition-colors">
          Ver el detalle
        </Link>
      </div>
      <div className="grid gap-px bg-suelo rounded-xl border border-suelo overflow-hidden sm:grid-cols-3">
        {items.map((item) => (
          <div key={item.label} className="bg-blanco px-5 py-5">
            <div className="flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full ${item.accent}`} aria-hidden />
              <SectionLabel>{item.label}</SectionLabel>
            </div>
            <p className="mt-2.5 font-normal text-2xl leading-none tracking-tight tabular-nums text-ink">
              {item.value}
            </p>
            <p className="text-xs text-niebla mt-1.5">{item.sub}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default ProjectFinance;
