'use client';

import { EmptyState, LoadingLine, PageHeader, PageShell } from '@/components/ui';
import Link from 'next/link';
import { useEffect, useState } from 'react';

type Project = {
  slug: string;
  name: string;
  address: string;
  city: string;
  statusLabel: string;
  floorsDescription: string;
};

export default function ProjectsPage() {
  const [items, setItems] = useState<Project[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/projects')
      .then(async (r) => {
        if (!r.ok) throw new Error('projects');
        return r.json();
      })
      .then(setItems)
      .catch(() => setError('No se pudieron cargar los proyectos.'));
  }, []);

  return (
    <PageShell>
      <PageHeader
        kicker="Cartera"
        title="Proyectos"
        description="Cada desarrollo tiene su propia vista: finanzas, documentos, unidades y decisiones."
      />

      {error && <p className="text-sm text-ceibo mb-6">{error}</p>}
      {items === null && !error && (
        <LoadingLine label="Abriendo la cartera…" />
      )}
      {items && items.length === 0 && (
        <EmptyState title="Sin proyectos" description="No hay proyectos cargados todavía." />
      )}
      {items && items.length > 0 && (
        <ul className="divide-y divide-suelo">
          {items.map((p) => (
            <li key={p.slug} className="py-6">
              <Link href={`/projects/${p.slug}`} className="group block">
                <div className="flex items-baseline justify-between gap-4">
                  <h2 className="font-serif text-xl font-light text-ink group-hover:text-musgo">
                    {p.name}
                  </h2>
                  <span className="text-2xs uppercase tracking-wider text-tierra">{p.statusLabel}</span>
                </div>
                <p className="text-sm text-niebla mt-1">
                  {p.address}
                  {p.city ? ` · ${p.city}` : ''}
                  {p.floorsDescription ? ` · ${p.floorsDescription}` : ''}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </PageShell>
  );
}
