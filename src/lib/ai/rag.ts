// Motor RAG (Retrieval-Augmented Generation) de Raíces Brain
// Orquesta la búsqueda vectorial y la generación de respuestas con contexto


export interface RagDocument {
  id: string;
  title: string;
  content: string;
  sourceUrl?: string;
  project?: string;
  category?: string;
  score: number;
}

export interface RagResult {
  answer: string;
  sources: RagDocument[];
  agentSlug?: string;
}

export interface RagOptions {
  agentSlug?: string;
  projectFilter?: string;
  categoryFilter?: string;
  topK?: number;
}

/**
 * Ejecuta el pipeline RAG completo:
 * 1. Genera el embedding de la query
 * 2. Busca documentos relevantes en la base vectorial
 * 3. Construye el contexto con los documentos recuperados
 * 4. Llama al LLM con el contexto y el system prompt del agente
 * @param query Pregunta o mensaje del usuario
 * @param options Opciones de filtrado y configuración
 */
export async function runRag(query: string, options: RagOptions = {}): Promise<RagResult> {
  // TODO:
  // 1. await generateEmbedding(query)
  // 2. Buscar en vector DB con filtros de options
  // 3. Recuperar documentos más relevantes (topK ?? 5)
  // 4. Construir el contexto: `\n\n---\n\n`.join(docs.map(d => d.content))
  // 5. Cargar system prompt del agente
  // 6. Llamar al LLM con streaming o sin streaming según la ruta
  // 7. Retornar respuesta + fuentes con sus scores

  throw new Error('runRag: pendiente de implementación');
}

/**
 * Solo recupera documentos relevantes sin generar una respuesta.
 * Útil para el endpoint /api/search.
 */
export async function retrieveDocuments(
  query: string,
  options: RagOptions = {},
): Promise<RagDocument[]> {
  // TODO: Implementar búsqueda vectorial pura
  throw new Error('retrieveDocuments: pendiente de implementación');
}
