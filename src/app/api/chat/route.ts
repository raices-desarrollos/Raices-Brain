// API route — Chat con el agente seleccionado usando RAG
// TODO: Implementar streaming de respuestas con citas de fuentes

import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  // TODO:
  // 1. Parsear el mensaje del usuario y el agente seleccionado
  // 2. Recuperar contexto relevante via RAG (src/lib/ai/rag.ts)
  // 3. Construir el system prompt del agente con el contexto
  // 4. Llamar a OpenAI con streaming
  // 5. Retornar la respuesta con citas de fuentes

  return new Response(JSON.stringify({ message: 'Chat API — próximamente' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
