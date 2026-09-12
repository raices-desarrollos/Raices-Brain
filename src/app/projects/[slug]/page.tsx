'use client';

import { ProjectFinance } from '@/components/ProjectFinance';
import { ProjectStages, type StageSnapshot } from '@/components/ProjectStages';
import { SalesDeck } from '@/components/SalesDeck';
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
  stage: StageSnapshot;
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
  // useSearchParams suspende durante el render del servidor, así que el
  // fallback tiene que mostrar exactamente lo mismo que el primer render del
  // cliente; si no, la hidratación no coincide.
  const params = useParams<{ slug: string }>();
  const name = formatProjectName(params.slug);

  return (
    <Suspense fallback={<ProjectPageSkeleton name={name} />}>
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
        <Link href="/" className="text-sm text-musgo mt-2 inline-block">
          Volver al inicio
        </Link>
      </div>
    );
  }

  if (!project) {
    return <ProjectPageSkeleton name={formatProjectName(params.slug)} />;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8 sm:py-10">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <p className="text-2xs tracking-[0.2em] uppercase text-niebla mb-2">Proyecto</p>
          <h1 className="font-serif text-3xl font-normal text-ink tracking-tight">{project.name}</h1>
          <p className="text-sm text-niebla mt-1.5">
            {project.address}
            {project.city ? ` · ${project.city}` : ''}
          </p>
        </div>
        {project.stage && (
          <ProjectStages
            slug={project.slug}
            initial={project.stage}
            onChange={(stage) => setProject({ ...project, stage, statusLabel: stage.current.label })}
          />
        )}
      </div>

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
        <div className="space-y-12">
          <div className="flex flex-wrap items-center gap-2">
            <SalesDeck slug={project.slug} />
            <Link
              href={`/projects/${project.slug}/precios`}
              className="inline-flex items-center gap-2 text-sm text-ink border border-suelo px-4 py-2 rounded-lg hover:border-ink hover:bg-lino transition-colors">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="w-4 h-4">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12"
                />
              </svg>
              Lista de precios
            </Link>
            <Link
              href={`/brain?q=${encodeURIComponent(`Resumime el estado actual de ${project.name}`)}`}
              className="text-sm bg-ink text-blanco rounded-lg px-4 py-2 hover:bg-musgo transition-colors">
              Preguntar a Brain
            </Link>
          </div>

          <dl className="grid grid-cols-2 gap-px bg-suelo rounded-xl border border-suelo overflow-hidden">
            <div className="bg-blanco px-5 py-4">
              <dt className="text-2xs uppercase tracking-[0.16em] text-niebla">Programa</dt>
              <dd className="text-sm text-ink mt-1.5">{project.floorsDescription || '—'}</dd>
            </div>
            <div className="bg-blanco px-5 py-4">
              <dt className="text-2xs uppercase tracking-[0.16em] text-niebla">Facturas</dt>
              <dd className="text-sm text-ink mt-1.5">
                {formatCount(invoices.length, 'factura', 'facturas')}
              </dd>
            </div>
          </dl>

          <ProjectFinance slug={project.slug} />

          {decisions.length > 0 && (
            <div>
              <h2 className="text-2xs tracking-[0.18em] uppercase text-niebla mb-3">
                Decisiones recientes
              </h2>
              <ul className="divide-y divide-suelo border-y border-suelo">
                {decisions.slice(0, 3).map((d) => (
                  <li key={d.id} className="py-3.5">
                    <p className="text-sm text-ink">{d.title}</p>
                    <p className="text-xs text-niebla mt-0.5">{d.date}</p>
                  </li>
                ))}
              </ul>
              <Link
                href="/decisiones"
                className="inline-block mt-3 text-xs text-musgo hover:text-ink transition-colors">
                Ver el registro completo
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
