// Generación de embeddings para documentos y queries
// TODO: Implementar con el SDK de OpenAI


export interface EmbeddingResult {
  embedding: number[];
  model: string;
  tokens: number;
}

/**
 * Genera el embedding de un texto usando el modelo configurado.
 * @param text Texto a vectorizar
 * @returns Vector de embedding
 */
export async function generateEmbedding(text: string): Promise<EmbeddingResult> {
  // TODO: Implementar usando OpenAI embeddings API
  // const response = await openai.embeddings.create({
  //   model: EMBEDDING_MODEL,
  //   input: text,
  // })
  // return {
  //   embedding: response.data[0].embedding,
  //   model: EMBEDDING_MODEL,
  //   tokens: response.usage.total_tokens,
  // }

  throw new Error('generateEmbedding: pendiente de implementación');
}

/**
 * Genera embeddings en batch para múltiples textos.
 * @param texts Array de textos a vectorizar
 * @returns Array de vectores de embedding
 */
export async function generateEmbeddings(texts: string[]): Promise<EmbeddingResult[]> {
  // TODO: Implementar con batching eficiente para no exceder rate limits
  return Promise.all(texts.map(generateEmbedding));
}
