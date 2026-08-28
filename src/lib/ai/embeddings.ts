// Generación de embeddings para documentos y queries
// 1536 dimensions via text-embedding-3-large (reduced) — matches vector(1536) in schema

const EMBEDDING_MODEL = process.env.OPENAI_EMBEDDING_MODEL ?? 'text-embedding-3-large';

export interface EmbeddingResult {
  embedding: number[];
  model: string;
  tokens: number;
}

export async function generateEmbedding(text: string): Promise<EmbeddingResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY no configurado');

  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model: EMBEDDING_MODEL, input: text, dimensions: 1536 }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(`OpenAI embeddings error: ${err?.error?.message}`);
  }

  const data = await response.json();
  return {
    embedding: data.data[0].embedding as number[],
    model: data.model as string,
    tokens: data.usage.total_tokens as number,
  };
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
