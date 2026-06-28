// API route — Ingesta desde Google Drive
// Sincroniza documentos desde una carpeta de Google Drive

import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  // TODO:
  // 1. Autenticar con Google Drive API (OAuth2 con refresh token)
  // 2. Listar archivos modificados desde la última sincronización
  // 3. Para cada archivo:
  //    a. Descargar contenido (exportar como texto/markdown para Docs)
  //    b. Normalizar y chunkear
  //    c. Indexar en la base vectorial
  // 4. Guardar timestamp de última sincronización
  // 5. Retornar resumen de documentos procesados

  return new Response(JSON.stringify({ message: 'Drive ingest API — próximamente' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
