// Utilidades de slugs
// Generación de slugs URL-friendly para proyectos, terrenos y documentos

/**
 * Convierte un texto a slug kebab-case URL-friendly.
 * @param text El texto a convertir
 * Ej: "Ceibo Vidal" → "ceibo-vidal"
 * Ej: "Medrano 700 - Almagro" → "medrano-700-almagro"
 */
export function toSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
    .replace(/[^a-z0-9\s-]/g, '') // Solo alfanumérico y guiones
    .replace(/\s+/g, '-') // Espacios a guiones
    .replace(/-+/g, '-') // Múltiples guiones a uno
    .replace(/^-|-$/g, ''); // Eliminar guiones al inicio/fin
}

/**
 * Genera un slug único para un documento de decisión.
 * @param date Fecha en formato YYYY-MM-DD
 * @param title Título de la decisión
 */
export function decisionSlug(date: string, title: string): string {
  return `${date}-${toSlug(title)}`;
}

/**
 * Genera un slug para un nombre de archivo de render.
 * @param project Slug del proyecto
 * @param view Tipo de vista
 * @param variant Variante (ej: 'v1', 'v2')
 */
export function renderSlug(project: string, view: string, variant: string = 'v1'): string {
  return `${project}-${toSlug(view)}-${variant}`;
}
