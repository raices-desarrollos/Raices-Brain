/**
 * Ingesta todos los archivos .md de knowledge/ en la tabla knowledge_chunks.
 * Uso: npx tsx scripts/ingest-knowledge.ts
 * Requiere: DATABASE_URL y OPENAI_API_KEY (lee .env.local automáticamente).
 */
import { randomUUID } from 'crypto';
import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { readFileSync, readdirSync, statSync } from 'fs';
import { relative, resolve } from 'path';
import { Pool } from 'pg';
import { loadDotenv } from './load-env';

loadDotenv();

const KNOWLEDGE_ROOT = resolve(process.cwd(), 'knowledge');
const MIN_CHUNK_CHARS = 80;
const BATCH_SIZE = 5; // embeddings por lote para no saturar rate limit

// ─── Helpers ─────────────────────────────────────────────────────────────────

function walkFiles(dir: string): string[] {
  const results: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = `${dir}/${entry}`;
    if (statSync(full).isDirectory()) {
      results.push(...walkFiles(full));
    } else if (entry.endsWith('.md')) {
      results.push(full);
    }
  }
  return results;
}

interface Chunk {
  filePath: string; // relativo a knowledge/
  heading: string;
  content: string;
}

function chunkFile(absPath: string): Chunk[] {
  const relPath = relative(KNOWLEDGE_ROOT, absPath);
  const raw = readFileSync(absPath, 'utf-8');
  const chunks: Chunk[] = [];

  // Dividir por headings H1/H2
  const sections = raw.split(/\n(?=#{1,2} )/);

  for (const section of sections) {
    const lines = section.trim().split('\n');
    const headingLine = lines[0]?.replace(/^#+\s*/, '').trim() || relPath;
    const body = lines.slice(1).join('\n').trim();

    if (body.length >= MIN_CHUNK_CHARS) {
      chunks.push({ filePath: relPath, heading: headingLine, content: body });
    }
  }

  // Si no hay secciones suficientemente largas, usar el archivo completo
  if (chunks.length === 0 && raw.trim().length >= MIN_CHUNK_CHARS) {
    chunks.push({ filePath: relPath, heading: relPath, content: raw.trim() });
  }

  return chunks;
}

async function generateEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY no configurado');

  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: process.env.OPENAI_EMBEDDING_MODEL ?? 'text-embedding-3-large',
      input: text,
      dimensions: 1536,
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(`OpenAI error: ${(err as { error?: { message?: string } }).error?.message}`);
  }

  const data = (await response.json()) as { data: Array<{ embedding: number[] }> };
  return data.data[0].embedding;
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) throw new Error('DATABASE_URL no configurado');

  const pool = new Pool({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
  });
  const db = drizzle(pool);

  // Recolectar todos los chunks
  const files = walkFiles(KNOWLEDGE_ROOT);
  console.log(`📂 ${files.length} archivos encontrados en knowledge/`);

  const allChunks: Chunk[] = [];
  for (const f of files) {
    const chunks = chunkFile(f);
    allChunks.push(...chunks);
  }
  console.log(`✂️  ${allChunks.length} chunks generados`);

  // Limpiar tabla y reingestar
  await db.execute(sql`DELETE FROM knowledge_chunks`);
  console.log('🗑️  Tabla limpiada');

  let inserted = 0;
  for (let i = 0; i < allChunks.length; i += BATCH_SIZE) {
    const batch = allChunks.slice(i, i + BATCH_SIZE);

    for (const chunk of batch) {
      const embeddingInput = `${chunk.heading}\n\n${chunk.content}`;
      const embedding = await generateEmbedding(embeddingInput);
      const vectorLiteral = `[${embedding.join(',')}]`;

      await db.execute(
        sql`INSERT INTO knowledge_chunks (id, file_path, heading, content, embedding)
            VALUES (${randomUUID()}, ${chunk.filePath}, ${chunk.heading}, ${chunk.content}, ${vectorLiteral}::vector)`,
      );
      inserted++;
    }

    console.log(`   ✓ ${inserted}/${allChunks.length} chunks`);
    // Pequeña pausa entre lotes para respetar rate limit
    if (i + BATCH_SIZE < allChunks.length) await sleep(500);
  }

  console.log(`\n✅ Ingesta completa: ${inserted} chunks en knowledge_chunks`);
  await pool.end();
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
