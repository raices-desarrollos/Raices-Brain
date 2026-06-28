// Chunking de documentos para indexación en la base vectorial
// Divide los documentos en fragmentos óptimos para el RAG

export interface Chunk {
  content: string;
  index: number;
  totalChunks: number;
  metadata: {
    documentId: string;
    title: string;
    startChar: number;
    endChar: number;
  };
}

const DEFAULT_CHUNK_SIZE = 1000; // caracteres
const DEFAULT_OVERLAP = 200; // caracteres de superposición entre chunks

/**
 * Divide un documento en chunks con superposición para mejor recuperación en RAG.
 * @param content El contenido del documento
 * @param documentId El ID del documento fuente
 * @param title El título del documento
 * @param chunkSize Tamaño máximo de cada chunk en caracteres
 * @param overlap Superposición entre chunks consecutivos
 */
export function chunkDocument(
  content: string,
  documentId: string,
  title: string,
  chunkSize: number = DEFAULT_CHUNK_SIZE,
  overlap: number = DEFAULT_OVERLAP,
): Chunk[] {
  // TODO: Implementar chunking inteligente que:
  // 1. Respete los límites de párrafos y secciones Markdown
  // 2. No corte en medio de una oración
  // 3. Preserve los headers del Markdown como contexto en cada chunk
  // 4. Maneje tablas y listas como unidades atómicas si son pequeñas

  const chunks: Chunk[] = [];
  let start = 0;
  let index = 0;

  while (start < content.length) {
    const end = Math.min(start + chunkSize, content.length);
    chunks.push({
      content: content.slice(start, end),
      index,
      totalChunks: 0, // Se actualiza al final
      metadata: {
        documentId,
        title,
        startChar: start,
        endChar: end,
      },
    });
    start += chunkSize - overlap;
    index++;
  }

  // Actualizar totalChunks en todos los chunks
  return chunks.map((chunk) => ({ ...chunk, totalChunks: chunks.length }));
}
