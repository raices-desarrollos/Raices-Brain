'use client';

import DriveFinancial from '@/components/DriveFinancial';
import { EmptyState, GhostButton, MetricCard, PageHeader, PageShell, PrimaryButton, Skeleton } from '@/components/ui';
import { formatMoney } from '@/lib/format';
import Link from 'next/link';
import { useEffect, useState } from 'react';

type Dashboard = {
  project: {
    name: string;
    address: string;
    slug: string;
    statusLabel: string;
    floorsDescription: string;
  } | null;
  invoiced: { count: number; amount: number; currency: string };
  invoicesPending: { count: number; amount: number; currency: string };
  paid: { count: number; amount: number; currency: string };
  recentDocuments: {
    id: string;
    name: string;
    category: string;
    driveWebViewLink?: string | null;
  }[];
};

export default function DashboardPage() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/dashboard')
      .then(async (r) => {
        if (!r.ok) throw new Error('dashboard');
        return r.json();
      })
      .then(setData)
      .catch(() => setError('No se pudo cargar el inicio. Reintentá.'));
  }, []);

  const p = data?.project;

  return (
    <PageShell wide>
      <PageHeader
        kicker="Raíces Desarrollos"
        title="Inicio"
        description={new Date().toLocaleDateString('es-AR', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
        action={
          <>
            <GhostButton href="/facturas/nueva">Subir factura</GhostButton>
            <PrimaryButton href="/brain">Preguntar a Brain</PrimaryButton>
          </>
        }
      />

      {error && <p className="text-sm text-ceibo mb-8">{error}</p>}

      {!data && !error && (
        <div className="mb-10">
          <Skeleton className="h-6 w-40 mb-3" />
          <Skeleton className="h-8 w-64 mb-8" />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-12">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
        </div>
      )}

      {p && (
        <div className="mb-10 pb-8 border-b border-suelo">
          <p className="text-2xs tracking-[0.2em] uppercase text-niebla mb-1">Proyecto activo</p>
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3">
            <div>
              <h2 className="font-serif text-2xl font-light text-ink">{p.name}</h2>
              <p className="text-sm text-niebla mt-1">
                {p.address} · {p.floorsDescription}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xs uppercase tracking-wider text-tierra">{p.statusLabel}</span>
              <Link href={`/projects/${p.slug}`} className="text-sm text-musgo hover:underline">
                Ver {p.name}
              </Link>
            </div>
          </div>
        </div>
      )}

      {data && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-12">
          <MetricCard
            label="Facturado"
            value={data.invoiced.count ? formatMoney(data.invoiced.amount, data.invoiced.currency) : '—'}
            sub={data.invoiced.count ? `${data.invoiced.count} factura(s)` : 'Sin facturas'}
            href="/facturas"
            empty={!data.invoiced.count}
          />
          <MetricCard
            label="Pendiente de pago"
            value={
              data.invoicesPending.count
                ? formatMoney(data.invoicesPending.amount, data.invoicesPending.currency)
                : '—'
            }
            sub={
              data.invoicesPending.count
                ? `${data.invoicesPending.count} factura(s)`
                : 'Nada pendiente'
            }
            href="/facturas"
            empty={!data.invoicesPending.count}
          />
          <MetricCard
            label="Pagado"
            value={data.paid.count ? formatMoney(data.paid.amount, data.paid.currency) : '—'}
            sub={data.paid.count ? `${data.paid.count} pago(s)` : 'Sin pagos'}
            href="/facturas"
            empty={!data.paid.count}
          />
        </div>
      )}

      <DriveFinancial />

      <section>
        <h2 className="text-xs tracking-[0.18em] uppercase text-niebla mb-4">Documentos recientes</h2>
        {!data && !error ? (
          <Skeleton className="h-28" />
        ) : !data?.recentDocuments.length ? (
          <EmptyState
            title="Todavía no hay documentos vinculados"
            description="Los archivos viven en Drive. Subí una factura o vinculá un archivo existente."
            actionLabel="Ver documentos"
            actionHref="/documentos"
          />
        ) : (
          <ul className="divide-y divide-suelo">
            {data.recentDocuments.map((d) => (
              <li key={d.id} className="py-3 flex justify-between gap-4">
                {d.driveWebViewLink ? (
                  <a
                    href={d.driveWebViewLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-ink truncate hover:text-musgo">
                    {d.name}
                  </a>
                ) : (
                  <span className="text-sm text-ink truncate">{d.name}</span>
                )}
                <span className="text-2xs text-niebla uppercase">{d.category}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </PageShell>
  );
}
