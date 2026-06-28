// API route — Ingesta manual de documentos
// Permite subir documentos directamente para indexar en el knowledge base

import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  // TODO:
  // 1. Recibir el archivo (multipart/form-data)
  // 2. Validar tipo y tamaño
  // 3. Extraer texto (PDF, DOCX, MD, TXT)
  // 4. Normalizar (src/lib/ingestion/normalize.ts)
  // 5. Chunkear (src/lib/ingestion/chunk.ts)
  // 6. Indexar (src/lib/ingestion/index-document.ts)
  // 7. Retornar confirmación con id del documento

  return new Response(JSON.stringify({ message: 'Manual ingest API — próximamente' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
