export { formatProjectName } from '@/lib/domain/catalog';

export function formatCount(n: number, singular: string, plural: string): string {
  if (n === 0) return `No hay ${plural}`;
  if (n === 1) return `1 ${singular}`;
  return `${n} ${plural}`;
}

export function formatMoney(amount: number | null | undefined, currency = 'ARS'): string {
  if (amount == null || Number.isNaN(amount)) return '—';
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return '—';
  const d = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) {
    return typeof value === 'string' ? value : '—';
  }
  return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
