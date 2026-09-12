'use client';

import { PriceListShare } from '@/components/PriceListShare';
import { EmptyState, PageHeader, PageShell, Skeleton } from '@/components/ui';
import { formatProjectName, formatUsd } from '@/lib/format';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

type Typology = {
  code: string;
  location: string;
  rooms: string;
  coveredM2: number;
  totalM2: number;
  totalWithSumM2: number;
};

type Unit = {
  id: string;
  code: string;
  floor: number;
  location: string;
  rooms: string;
  price: number;
};

type PriceList = {
  listName: string;
  units: Unit[];
  typologies: Typology[];
  floors: number[];
};

function formatM2(value: number): string {
  return value.toLocaleString('es-AR', { maximumFractionDigits: 1 });
}

export default function PreciosPage() {
  const params = useParams<{ slug: string }>();
  const name = formatProjectName(params.slug);
  const [data, setData] = useState<PriceList | null>(null);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(
    async (refresh = false) => {
      if (refresh) setRefreshing(true);
      try {
        const res = await fetch(`/api/projects/${params.slug}/prices${refresh ? '?refresh=1' : ''}`);
        const body = await res.json().catch(() => null);
        if (!res.ok) throw new Error(body?.error ?? 'No se pudo cargar la lista.');
        setData(body as PriceList);
        setError('');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo cargar la lista.');
        setData(null);
      } finally {
        setRefreshing(false);
      }
    },
    [params.slug],
  );

  useEffect(() => {
    load();
  }, [load]);

  const typologies = useMemo(() => {
    if (!data) return [];
    return data.typologies.map((t) => {
      const prices = data.units.filter((u) => u.code === t.code).map((u) => u.price);
      return {
        ...t,
        from: prices.length ? Math.min(...prices) : 0,
        to: prices.length ? Math.max(...prices) : 0,
      };
    });
  }, [data]);

  const byFloor = useMemo(() => {
    if (!data) return [];
    return data.floors.map((floor) => ({
      floor,
      units: data.units.filter((u) => u.floor === floor),
    }));
  }, [data]);

  return (
    <PageShell wide>
      <PageHeader
        kicker={name}
        title="Lista de precios"
        description={data ? `${data.listName} · ${data.units.length} unidades` : 'Preventa de Ceibo Vidal'}
        action={
          <div className="flex items-center gap-3 sm:gap-4">
            {data ? <PriceListShare slug={params.slug} /> : null}
            {data ? (
              <button
                type="button"
                onClick={() => load(true)}
                disabled={refreshing}
                className="text-sm text-niebla hover:text-ink disabled:opacity-50">
                {refreshing ? 'Actualizando…' : 'Actualizar'}
              </button>
            ) : null}
            <Link href={`/projects/${params.slug}`} className="text-sm text-musgo hover:text-ink">
              Volver al proyecto
            </Link>
          </div>
        }
      />

      {error && <EmptyState title="No pudimos abrir la lista" description={error} />}

      {!data && !error && (
        <div className="space-y-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Skeleton className="h-56" />
            <Skeleton className="h-56" />
            <Skeleton className="h-56" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
        </div>
      )}

      {data && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {typologies.map((t) => (
              <article
                key={t.code}
                className="bg-blanco rounded-2xl border border-suelo px-6 py-6 flex flex-col">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-2xs uppercase tracking-[0.18em] text-niebla">{t.location}</p>
                    <h2 className="font-serif text-[1.65rem] leading-tight text-ink mt-1.5">
                      {t.rooms || `Unidad ${t.code}`}
                    </h2>
                    <div className="h-px w-8 bg-arena mt-3" />
                  </div>
                  <span
                    className="font-serif text-[2.75rem] leading-none text-tierra/70"
                    aria-hidden>
                    {t.code}
                  </span>
                </div>

                <dl className="grid grid-cols-3 gap-3 mt-8 pt-5 border-t border-suelo">
                  <div>
                    <dt className="text-2xs uppercase tracking-[0.12em] text-niebla">Cubiertos</dt>
                    <dd className="font-serif text-[1.35rem] tabular-nums text-ink mt-1 leading-none">
                      {formatM2(t.coveredM2)}
                      <span className="text-xs text-niebla ml-0.5">m²</span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-2xs uppercase tracking-[0.12em] text-niebla">Sin SUM</dt>
                    <dd className="font-serif text-[1.35rem] tabular-nums text-ink mt-1 leading-none">
                      {formatM2(t.totalM2)}
                      <span className="text-xs text-niebla ml-0.5">m²</span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-2xs uppercase tracking-[0.12em] text-niebla">Con SUM</dt>
                    <dd className="font-serif text-[1.35rem] tabular-nums text-ink mt-1 leading-none">
                      {formatM2(t.totalWithSumM2)}
                      <span className="text-xs text-niebla ml-0.5">m²</span>
                    </dd>
                  </div>
                </dl>

                <p className="mt-6 text-sm text-niebla">
                  Desde <span className="text-ink tabular-nums">{formatUsd(t.from)}</span>
                </p>
              </article>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-12 mt-14">
            {byFloor.map((group) => (
              <section key={group.floor}>
                <p className="text-2xs uppercase tracking-[0.18em] text-niebla mb-1">Piso {group.floor}</p>
                <ul>
                  {group.units.map((unit) => (
                    <li
                      key={unit.id}
                      className="flex items-baseline justify-between gap-6 py-4 border-t border-suelo first:border-t-arena/40">
                      <div className="flex items-baseline gap-4 min-w-0">
                        <span className="font-serif text-2xl text-tierra w-6 shrink-0">{unit.code}</span>
                        <div className="min-w-0">
                          <p className="text-ink">{unit.location}</p>
                          {unit.rooms ? (
                            <p className="text-sm text-niebla mt-0.5">{unit.rooms}</p>
                          ) : null}
                        </div>
                      </div>
                      <p className="font-serif text-[1.35rem] tabular-nums text-ink shrink-0">
                        {formatUsd(unit.price)}
                      </p>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>

          <p className="text-xs text-niebla mt-12">
            Valores en USD, lista {data.listName.toLowerCase()}. Superficies de planta tipo.
          </p>
        </>
      )}
    </PageShell>
  );
}
