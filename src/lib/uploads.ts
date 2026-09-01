export const MAX_INVOICE_BYTES = 12 * 1024 * 1024;

const ALLOWED_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/jpg',
]);

export function validateInvoiceFile(file: { name: string; type: string; size: number }): string | null {
  if (!file.size) return 'El archivo está vacío.';
  if (file.size > MAX_INVOICE_BYTES) return 'El archivo supera 12 MB. Usá un PDF o una foto más liviana.';
  const type = (file.type || '').toLowerCase();
  const name = file.name.toLowerCase();
  const allowedExt = name.endsWith('.pdf') || name.endsWith('.jpg') || name.endsWith('.jpeg') || name.endsWith('.png') || name.endsWith('.webp');
  if (type && !ALLOWED_TYPES.has(type) && !allowedExt) {
    return 'Usá PDF, JPG o PNG.';
  }
  if (!type && !allowedExt) return 'Usá PDF, JPG o PNG.';
  return null;
}
