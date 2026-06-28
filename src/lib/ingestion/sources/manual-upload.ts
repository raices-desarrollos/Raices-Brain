// Conector de ingesta manual (upload directo)
// Procesa archivos subidos directamente por el usuario desde la UI de admin

export type SupportedFormat = 'md' | 'txt' | 'pdf' | 'docx';

export interface ManualUploadOptions {
  filename: string;
  content: Buffer | string;
  project?: string;
  category?: string;
  isConfidential?: boolean;
}

export interface ManualUploadResult {
  documentId: string;
  chunksIndexed: number;
  title: string;
}

/**
 * Procesa un archivo subido manualmente e lo indexa en la base vectorial.
 * @param options Opciones de la subida
 */
export async function processManualUpload(
  options: ManualUploadOptions,
): Promise<ManualUploadResult> {
  // TODO:
  // 1. Detectar el formato del archivo desde la extensión
  // 2. Extraer el texto según el formato (MD/TXT: directo; PDF: parsear; DOCX: parsear)
  // 3. Llamar a indexDocument con source: 'manual-upload'
  // 4. Retornar resultado

  throw new Error('processManualUpload: pendiente de implementación');
}

/**
 * Verifica si un formato de archivo está soportado.
 */
export function isSupportedFormat(filename: string): boolean {
  const ext = filename.split('.').pop()?.toLowerCase();
  return ['md', 'txt', 'pdf', 'docx'].includes(ext ?? '');
}
