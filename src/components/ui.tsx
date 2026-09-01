import Link from 'next/link';
import type { ReactNode } from 'react';

export function PageHeader({
  kicker,
  title,
  description,
  action,
}: {
  kicker?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-10 flex items-end justify-between gap-4">
      <div>
        {kicker && (
          <p className="text-niebla text-xs tracking-[0.2em] uppercase mb-2">{kicker}</p>
        )}
        <h1 className="font-serif text-3xl font-light text-ink tracking-tight">{title}</h1>
        {description && <p className="text-niebla text-sm mt-1.5">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="border border-dashed border-arena/60 rounded-sm px-6 py-10 text-center">
      <p className="text-sm font-medium text-ink">{title}</p>
      <p className="text-sm text-niebla mt-1 max-w-md mx-auto">{description}</p>
      {actionHref && actionLabel && (
        <Link
          href={actionHref}
          className="inline-block mt-4 text-sm text-musgo border border-ink px-4 py-2 hover:bg-ink hover:text-blanco transition-colors">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}

export function MetricCard({
  label,
  value,
  sub,
  href,
  empty,
}: {
  label: string;
  value: string;
  sub?: string;
  href?: string;
  empty?: boolean;
}) {
  const inner = (
    <div className="py-4 pr-4">
      <p className={`text-2xl font-light tracking-tight ${empty ? 'text-niebla' : 'text-ink'}`}>
        {value}
      </p>
      <p className="text-xs font-medium text-ink mt-2">{label}</p>
      {sub && <p className="text-2xs text-niebla mt-0.5">{sub}</p>}
    </div>
  );
  if (href) {
    return (
      <Link href={href} className="block hover:opacity-80 transition-opacity">
        {inner}
      </Link>
    );
  }
  return inner;
}
