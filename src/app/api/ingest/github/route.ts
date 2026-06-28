// API route — Ingesta desde GitHub
// Sincroniza documentos Markdown y JSON desde el repositorio de GitHub

import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  // TODO:
  // 1. Verificar webhook secret de GitHub (seguridad)
  // 2. Parsear el evento (push, pull_request, etc.)
  // 3. Identificar archivos modificados o creados
  // 4. Para cada archivo .md o .json relevante:
  //    a. Fetchear el contenido via GitHub API
  //    b. Normalizar y chunkear
  //    c. Actualizar la indexación (reindexar si ya existía)
  // 5. Retornar resumen de documentos procesados

  return new Response(JSON.stringify({ message: 'GitHub ingest API — próximamente' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
