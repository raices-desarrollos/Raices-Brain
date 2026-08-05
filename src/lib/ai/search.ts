import { sql } from 'drizzle-orm';
import { db } from '../db';
import { generateEmbedding } from './embeddings';

export interface SearchResult {
  id: string;
  filePath: string;
  heading: string;
  content: string;
  similarity: number;
}

export async function searchKnowledge(query: string, limit = 5): Promise<SearchResult[]> {
  const { embedding } = await generateEmbedding(query);
  const vectorLiteral = `[${embedding.join(',')}]`;

  const rows = await db.execute<{
    id: string;
    file_path: string;
    heading: string;
    content: string;
    similarity: number;
  }>(
    sql`SELECT id, file_path, heading, content,
               1 - (embedding <=> ${vectorLiteral}::vector) AS similarity
        FROM knowledge_chunks
        ORDER BY embedding <=> ${vectorLiteral}::vector
        LIMIT ${limit}`,
  );

  return rows.rows.map((r) => ({
    id: r.id,
    filePath: r.file_path,
    heading: r.heading,
    content: r.content,
    similarity: r.similarity,
  }));
}

// Formatea los chunks recuperados como bloque de contexto para el system prompt
export function formatContext(chunks: SearchResult[]): string {
  if (chunks.length === 0) return '';
  const sections = chunks.map((c) => `### ${c.heading}\n_Fuente: ${c.filePath}_\n\n${c.content}`);
  return `## Contexto interno de Raíces Desarrollos\n\n${sections.join('\n\n---\n\n')}`;
}
