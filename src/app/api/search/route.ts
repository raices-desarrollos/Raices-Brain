// API route — Búsqueda semántica en el knowledge base
// Endpoint para buscar documentos relevantes por similitud vectorial

import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  // TODO:
  // 1. Parsear query, filters (project, category, etc.) y topK
  // 2. Generar embedding de la query (src/lib/ai/embeddings.ts)
  // 3. Buscar en la base vectorial por similitud coseno
  // 4. Opcionalmente: reranking de resultados
  // 5. Retornar documentos con score de relevancia y metadata

  return new Response(JSON.stringify({ message: 'Search API — próximamente', results: [] }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
