import Link from 'next/link';
import type { ReactNode } from 'react';

export function PageShell({ children, wide }: { children: ReactNode; wide?: boolean }) {
  return (
    <div className={`mx-auto px-4 sm:px-8 py-8 sm:py-10 ${wide ? 'max-w-5xl' : 'max-w-4xl'}`}>
      {children}
    </div>
  );
}

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
    <div className="mb-8 sm:mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
      <div>
        {kicker && (
          <p className="text-niebla text-xs tracking-[0.2em] uppercase mb-2">{kicker}</p>
        )}
        <h1 className="font-serif text-3xl font-light text-ink tracking-tight">{title}</h1>
        {description && <p className="text-niebla text-sm mt-1.5">{description}</p>}
      </div>
      {action ? <div className="flex flex-wrap gap-2 shrink-0">{action}</div> : null}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
  action,
  compact,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  action?: ReactNode;
  compact?: boolean;
}) {
  return (
    <div
      className={`border border-dashed border-arena/60 rounded-xl text-center ${
        compact ? 'px-4 py-5' : 'px-6 py-10'
      }`}>
      <p className="text-sm font-medium text-ink">{title}</p>
      <p className="text-sm text-niebla mt-1 max-w-md mx-auto">{description}</p>
      {action}
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

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-suelo/80 rounded-md ${className}`} />;
}

export function Spinner({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg
      className={`animate-spin text-musgo ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden>
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path
        className="opacity-90"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V2C5.373 2 2 5.373 2 12h2z"
      />
    </svg>
  );
}

/** Four rising bars — building / floors, not a generic spinner. */
export function BrandMark({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const heights = size === 'sm' ? [10, 14, 18, 22] : [18, 26, 34, 44];
  const bar = size === 'sm' ? 'w-1' : 'w-1.5';
  return (
    <div className="inline-flex flex-col items-start" aria-hidden>
      <div className="flex items-end gap-[3px]">
        {heights.map((h, i) => (
          <span
            key={i}
            className={`${bar} bg-musgo origin-bottom animate-rise`}
            style={{ height: h, animationDelay: `${i * 110}ms` }}
          />
        ))}
      </div>
      <span className={`block h-px bg-arena/90 mt-1 ${size === 'sm' ? 'w-7' : 'w-10'}`} />
    </div>
  );
}

export function PageLoader({
  kicker = 'Raíces',
  title = 'Un momento',
  hint = 'Estamos abriendo la ficha.',
}: {
  kicker?: string;
  title?: string;
  hint?: string;
}) {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-[55vh] px-6 text-center"
      role="status"
      aria-live="polite">
      <BrandMark />
      <p className="text-2xs tracking-[0.22em] uppercase text-niebla mt-8">{kicker}</p>
      <p className="font-serif text-2xl sm:text-3xl font-light text-ink mt-2">{title}</p>
      <p className="text-sm text-niebla mt-2 max-w-xs">{hint}</p>
    </div>
  );
}

export function LoadingLine({ label = 'Cargando…' }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 py-8" role="status" aria-live="polite">
      <BrandMark size="sm" />
      <span className="text-sm text-niebla">{label}</span>
    </div>
  );
}

export function ListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="divide-y divide-suelo" aria-hidden>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="py-3.5 flex justify-between gap-4">
          <Skeleton className={`h-4 ${i % 3 === 0 ? 'w-2/5' : i % 3 === 1 ? 'w-1/3' : 'w-1/2'}`} />
          <Skeleton className="h-3 w-16" />
        </div>
      ))}
    </div>
  );
}

export function ProjectPageSkeleton({ name }: { name?: string }) {
  return (
    <PageShell wide>
      <div className="mb-10" role="status" aria-live="polite">
        <BrandMark />
        <p className="text-2xs tracking-[0.2em] uppercase text-niebla mt-8">Proyecto</p>
        <h1 className="font-serif text-3xl font-light text-ink mt-1">{name ?? 'Abriendo…'}</h1>
        <p className="text-sm text-niebla mt-2">Preparando facturas, documentos y estado.</p>
      </div>
      <div className="flex gap-3 border-b border-suelo mb-10 pb-3 overflow-hidden">
        {['w-16', 'w-20', 'w-16'].map((w, i) => (
          <Skeleton key={i} className={`h-3.5 ${w} shrink-0`} />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-6">
        <Skeleton className="h-14" />
        <Skeleton className="h-14" />
        <Skeleton className="h-14" />
      </div>
    </PageShell>
  );
}

export function Overlay({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div
      className="absolute inset-0 bg-blanco/80 flex flex-col items-center justify-center z-10 px-6"
      role="status"
      aria-live="polite">
      <Spinner className="w-6 h-6 mb-3" />
      <p className="text-sm text-ink">{title}</p>
      {description && <p className="text-xs text-niebla mt-1 text-center">{description}</p>}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    pendiente: { label: 'Pendiente', className: 'text-tierra' },
    pagada: { label: 'Pagada', className: 'text-musgo' },
    parcial: { label: 'Parcial', className: 'text-arena' },
    anulada: { label: 'Anulada', className: 'text-niebla' },
  };
  const s = map[status] ?? { label: status, className: 'text-niebla' };
  return <span className={`text-2xs uppercase tracking-wider ${s.className}`}>{s.label}</span>;
}

export function Alert({
  tone = 'error',
  children,
}: {
  tone?: 'error' | 'info' | 'ok';
  children: ReactNode;
}) {
  const cls =
    tone === 'ok'
      ? 'text-musgo bg-suelo/50 border-suelo'
      : tone === 'info'
        ? 'text-ink bg-suelo/40 border-suelo'
        : 'text-ceibo bg-ceibo/5 border-ceibo/20';
  return <p className={`text-sm border rounded-lg px-3 py-2 ${cls}`}>{children}</p>;
}

export function PrimaryButton({
  children,
  href,
  onClick,
  disabled,
  type = 'button',
}: {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit';
}) {
  const cls =
    'inline-flex items-center justify-center gap-2 text-sm bg-ink text-blanco px-4 py-2 rounded-lg hover:bg-musgo transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cls}>
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  href,
  onClick,
  disabled,
}: {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  const cls =
    'inline-flex items-center justify-center text-sm border border-ink text-ink px-4 py-2 rounded-lg hover:bg-ink hover:text-blanco transition-colors disabled:opacity-50';
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={cls}>
      {children}
    </button>
  );
}
