// Normalización de documentos antes de la indexación
// Convierte diferentes formatos a texto plano estructurado

export interface NormalizedDocument {
  title: string;
  content: string;
  metadata: {
    source: 'github' | 'google-drive' | 'manual-upload';
    sourceUrl?: string;
    project?: string;
    category?: string;
    tags?: string[];
    isConfidential?: boolean;
    originalFormat: string;
  };
}

/**
 * Normaliza un archivo Markdown eliminando sintaxis y preservando estructura.
 * @param markdown Contenido del archivo Markdown
 * @param title Título del documento
 */
export function normalizeMarkdown(
  markdown: string,
  title?: string,
): Pick<NormalizedDocument, 'title' | 'content'> {
  // TODO: Implementar normalización que:
  // 1. Extraiga el título del primer H1 si no se provee
  // 2. Preserve la estructura de secciones como texto plano
  // 3. Elimine sintaxis Markdown innecesaria para el embedding
  // 4. Pero preserve tablas en formato legible

  const extractedTitle = title ?? markdown.split('\n')[0].replace(/^#\s*/, '').trim();
  return {
    title: extractedTitle,
    content: markdown,
  };
}

/**
 * Normaliza un archivo JSON a texto descriptivo indexable.
 * @param json Objeto JSON a normalizar
 * @param title Título del documento
 */
export function normalizeJson(
  json: Record<string, unknown>,
  title: string,
): Pick<NormalizedDocument, 'title' | 'content'> {
  // TODO: Convertir JSON a descripción en lenguaje natural para mejor recuperación
  return {
    title,
    content: JSON.stringify(json, null, 2),
  };
}

/**
 * Detecta la categoría y el proyecto de un documento a partir de su path.
 * @param filePath Path del archivo relativo a la raíz del repo
 */
export function detectDocumentMetadata(filePath: string): {
  project?: string;
  category?: string;
  isConfidential?: boolean;
} {
  // TODO: Implementar detección basada en el path
  // Ej: knowledge/projects/ceibo-vidal/decisions/ → project: ceibo-vidal, category: decisions
  // Ej: knowledge/company/finance/ → project: company, category: finance, isConfidential: true

  const parts = filePath.split('/');

  if (parts[0] === 'knowledge' && parts[1] === 'projects' && parts[2]) {
    return {
      project: parts[2],
      category: parts[3] ?? 'general',
    };
  }

  if (parts[0] === 'knowledge' && parts[1] === 'company') {
    return {
      project: 'company',
      category: parts[2] ?? 'general',
      isConfidential: parts[2] === 'finance' || parts[2] === 'legal',
    };
  }

  return {};
}
