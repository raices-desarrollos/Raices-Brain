import { generateEmbedding } from '@/lib/ai/embeddings';
import { audit } from '@/lib/audit';
import { getUserId, requireAuth } from '@/lib/auth/server';
import { db } from '@/lib/db';
import { documents } from '@/lib/db/schema';
import { retrieveFile } from '@/lib/storage';
import { randomUUID } from 'crypto';
import { eq, sql } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

type Params = { params: Promise<{ id: string }> };

const EXCEL_MIME_TYPES = new Set([
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]);

export async function POST(_req: NextRequest, { params }: Params) {
  const { session, response } = await requireAuth();
  if (response) return response;

  const { id } = await params;
  const userId = getUserId(session);

  const [doc] = await db.select().from(documents).where(eq(documents.id, id)).limit(1);
  if (!doc) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
  if (!EXCEL_MIME_TYPES.has(doc.mimeType)) {
    return NextResponse.json(
      { error: 'Solo se pueden ingestar archivos Excel (.xls, .xlsx)' },
      { status: 400 },
    );
  }

  // Leer el archivo desde storage
  const fileBuffer = await retrieveFile(doc.storageKey);
  const workbook = XLSX.read(fileBuffer, { type: 'buffer' });

  // Limpiar chunks previos del mismo documento
  await db.execute(sql`DELETE FROM knowledge_chunks WHERE file_path = ${`documentos/${doc.name}`}`);

  let totalChunks = 0;

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });
    if (rows.length === 0) continue;

    // Convertir a texto markdown: cabeceras + filas
    const headers = Object.keys(rows[0]);
    const headerRow = `| ${headers.join(' | ')} |`;
    const separator = `| ${headers.map(() => '---').join(' | ')} |`;
    const dataRows = rows.map(
      (r) => `| ${headers.map((h) => String(r[h] ?? '').trim()).join(' | ')} |`,
    );
    const tableText = [headerRow, separator, ...dataRows].join('\n');

    const heading = `${doc.name} — ${sheetName}`;
    const content = `Archivo: ${doc.name}\nHoja: ${sheetName}\n\n${tableText}`;
    const embeddingInput = `${heading}\n\n${content}`;

    const { embedding } = await generateEmbedding(embeddingInput);
    const vectorLiteral = `[${embedding.join(',')}]`;

    await db.execute(
      sql`INSERT INTO knowledge_chunks (id, file_path, heading, content, embedding)
          VALUES (${randomUUID()}, ${'documentos/' + doc.name}, ${heading}, ${content}, ${vectorLiteral}::vector)`,
    );
    totalChunks++;
  }

  await audit(userId, 'create', 'document', id, `Ingesta RAG: ${totalChunks} hojas de ${doc.name}`);

  return NextResponse.json({ ok: true, chunks: totalChunks, sheets: workbook.SheetNames });
}
