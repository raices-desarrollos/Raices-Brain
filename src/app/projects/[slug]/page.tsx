'use client';

import DriveFinancial from '@/components/DriveFinancial';
import { EmptyState, ProjectPageSkeleton } from '@/components/ui';
import { formatCount, formatMoney, formatProjectName } from '@/lib/format';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

const TABS = [
  { id: 'resumen', label: 'Resumen' },
  { id: 'documentos', label: 'Documentos' },
  { id: 'facturas', label: 'Facturas' },
] as const;

type Project = {
  slug: string;
  name: string;
  address: string;
  city: string;
  statusLabel: string;
  floorsDescription: string;
};

type Invoice = {
  id: string;
  supplierName: string;
  amount: number;
  currency: string;
  status: string;
  issueDate: string | null;
  category: string;
};
type Decision = { id: string; title: string; date: string; sourceFile?: string };

export default function ProjectPage() {
  return (
    <Suspense fallback={<ProjectPageSkeleton />}>
      <ProjectView />
    </Suspense>
  );
}

function ProjectView() {
  const params = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const tab = (searchParams.get('tab') as (typeof TABS)[number]['id']) || 'resumen';
  const [project, setProject] = useState<Project | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [decisions, setDecisions] = useState<Decision[]>([]);

  useEffect(() => {
    fetch(`/api/projects/${params.slug}`).then(async (r) => {
      if (!r.ok) setNotFound(true);
      else setProject(await r.json());
    });
    fetch(`/api/invoices?project=${params.slug}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setInvoices(Array.isArray(d) ? d : []));
    fetch('/api/dashboard')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setDecisions(d?.recentDecisions ?? []));
  }, [params.slug]);

  if (notFound) {
    return (
      <div className="max-w-4xl mx-auto px-8 py-16">
        <p className="text-sm text-niebla">Proyecto no encontrado.</p>
        <Link href="/projects" className="text-sm text-musgo mt-2 inline-block">
          Volver a proyectos
        </Link>
      </div>
    );
  }

  if (!project) {
    return <ProjectPageSkeleton name={formatProjectName(params.slug)} />;
  }

  return (
    <div className="max-w-5xl mx-auto px-8 py-10">
      <p className="text-2xs tracking-[0.2em] uppercase text-niebla mb-2">Proyecto</p>
      <h1 className="font-serif text-3xl font-light text-ink">{project.name}</h1>
      <p className="text-sm text-niebla mt-1">
        {project.address}
        {project.city ? ` · ${project.city}` : ''}
      </p>
      <p className="text-xs text-tierra mt-2 uppercase tracking-wider">{project.statusLabel}</p>

      <nav className="flex gap-1.5 mt-8 mb-10 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <Link
            key={t.id}
            href={`/projects/${project.slug}?tab=${t.id}`}
            className={`px-3 py-1.5 text-sm whitespace-nowrap rounded-full border transition-colors ${
              tab === t.id
                ? 'bg-ink text-blanco border-ink'
                : 'text-niebla border-suelo hover:border-ink hover:text-ink'
            }`}>
            {t.label}
          </Link>
        ))}
      </nav>

      {tab === 'resumen' && (
        <div className="space-y-10">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-2xs uppercase tracking-wider text-niebla">Programa</p>
              <p className="text-sm mt-1">{project.floorsDescription || '—'}</p>
            </div>
            <div>
              <p className="text-2xs uppercase tracking-wider text-niebla">Facturas</p>
              <p className="text-sm mt-1">{formatCount(invoices.length, 'factura', 'facturas')}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link href="/facturas/nueva" className="text-sm border border-ink rounded-lg px-4 py-2">
              Subir factura
            </Link>
            <Link
              href={`/brain?q=${encodeURIComponent(`Resumime el estado actual de ${project.name}`)}`}
              className="text-sm bg-ink text-blanco rounded-lg px-4 py-2">
              Preguntar a Brain
            </Link>
          </div>
          <DriveFinancial />
          {decisions.length > 0 && (
            <div>
              <h2 className="text-xs tracking-[0.18em] uppercase text-niebla mb-3">Decisiones recientes</h2>
              <ul className="divide-y divide-suelo">
                {decisions.slice(0, 3).map((d) => (
                  <li key={d.id} className="py-3">
                    <p className="text-sm">{d.title}</p>
                    <p className="text-2xs text-niebla">{d.date}</p>
                  </li>
                ))}
              </ul>
              <Link href="/decisiones" className="inline-block mt-3 text-sm text-musgo">
                Consultá el registro completo de decisiones del proyecto.
              </Link>
            </div>
          )}
        </div>
      )}

      {tab === 'documentos' && (
        <div>
          <div className="flex justify-between mb-4">
            <p className="text-sm text-niebla">El archivo de {project.name} está en Google Drive.</p>
            <Link href="/documentos" className="text-sm text-musgo">
              Abrir archivo
            </Link>
          </div>
          <EmptyState
            compact
            title="El archivo vive en Documentos"
            description="Planos, planillas y carpetas de Ceibo Vidal se abren desde ahí. No hace falta vincularlos: ya son de este proyecto."
            actionLabel="Ver documentos"
            actionHref="/documentos"
          />
        </div>
      )}

      {tab === 'facturas' && (
        <div>
          <div className="flex justify-between mb-4">
            <p className="text-sm text-niebla">{formatCount(invoices.length, 'factura', 'facturas')}</p>
            <Link href="/facturas/nueva" className="text-sm border border-ink rounded-lg px-3 py-1.5">
              Subir factura
            </Link>
          </div>
          {!invoices.length ? (
            <EmptyState
              compact
              title="No hay facturas de este proyecto"
              description="Subí un PDF o una foto. Revisás los datos y confirmás."
              actionLabel="Subir factura"
              actionHref="/facturas/nueva"
            />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-2xs uppercase tracking-wider text-niebla">
                  <th className="py-2 font-medium">Proveedor</th>
                  <th className="py-2 font-medium">Monto</th>
                  <th className="py-2 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((i) => (
                  <tr key={i.id} className="border-t border-suelo">
                    <td className="py-3">{i.supplierName}</td>
                    <td>{formatMoney(i.amount, i.currency)}</td>
                    <td className="text-niebla capitalize">{i.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
