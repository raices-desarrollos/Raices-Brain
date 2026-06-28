// API route — Gestión y ejecución de agentes
// Endpoint para invocar un agente específico con un mensaje y contexto

import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  // TODO:
  // 1. Parsear agentSlug, message, conversationHistory
  // 2. Cargar la configuración del agente desde data/seed/agents.seed.json
  // 3. Aplicar los permisos del agente (src/lib/security/permissions.ts)
  // 4. Ejecutar RAG con las fuentes de conocimiento del agente
  // 5. Llamar al LLM con el system prompt del agente + contexto RAG
  // 6. Retornar respuesta con citas y agentSlug

  return new Response(JSON.stringify({ message: 'Agents API — próximamente' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function GET(req: NextRequest) {
  // TODO: Listar agentes disponibles y su estado

  return new Response(JSON.stringify({ agents: [], message: 'Agents list — próximamente' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
