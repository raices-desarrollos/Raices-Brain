// Catálogo canónico de proyectos. Fuente de verdad de producto cuando la DB
// todavía no tiene filas (o la migración no se aplicó). No inventa métricas.

export type ProjectStatus = 'design' | 'permits' | 'construction' | 'sales' | 'delivered';

export interface ProjectCatalogEntry {
  slug: string;
  name: string;
  address: string;
  neighborhood: string | null;
  city: string;
  status: ProjectStatus;
  statusLabel: string;
  floorsDescription: string;
  notes: string | null;
}

export const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  design: 'En diseño',
  permits: 'Permisos',
  construction: 'En obra',
  sales: 'En venta',
  delivered: 'Entregado',
};

export const PROJECT_CATALOG: ProjectCatalogEntry[] = [
  {
    slug: 'ceibo-vidal',
    name: 'Ceibo Vidal',
    address: 'Vidal 3849',
    neighborhood: null,
    city: 'CABA',
    status: 'design',
    statusLabel: 'En diseño',
    floorsDescription: 'PB + 4 pisos + terraza',
    notes: null,
  },
];

export function getCatalogProject(slug: string): ProjectCatalogEntry | null {
  return PROJECT_CATALOG.find((p) => p.slug === slug) ?? null;
}

export const INVOICE_CATEGORIES = [
  'arquitectura',
  'carpintería',
  'instalaciones',
  'materiales',
  'honorarios',
  'impuestos',
  'servicios',
  'escribanía',
  'marketing',
  'otro',
] as const;

export const INVOICE_STATUSES = ['pendiente', 'pagada', 'parcial', 'anulada'] as const;
