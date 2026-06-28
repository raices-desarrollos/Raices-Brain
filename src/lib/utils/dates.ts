// Utilidades de fechas
// Funciones para manejo consistente de fechas en el proyecto

/**
 * Formatea una fecha al formato YYYY-MM-DD usado en nombres de archivos y decisiones.
 * @param date Fecha a formatear (default: hoy)
 */
export function formatDateSlug(date: Date = new Date()): string {
  return date.toISOString().split('T')[0];
}

/**
 * Formatea una fecha para mostrar en texto legible en español.
 * @param dateStr Fecha en formato YYYY-MM-DD o ISO
 */
export function formatDateDisplay(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'America/Argentina/Buenos_Aires',
  });
}

/**
 * Retorna la fecha de hoy en formato YYYY-MM-DD.
 */
export function today(): string {
  return formatDateSlug(new Date());
}
