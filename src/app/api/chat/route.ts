// API route — Chat con el agente seleccionado usando RAG
import { formatContext, searchKnowledge } from '@/lib/ai/search';
import { NextRequest, NextResponse } from 'next/server';

const AGENT_SYSTEM_PROMPTS: Record<string, string> = {
  general:
    'Sos el asistente general de Raíces Desarrollos. Respondé preguntas sobre la empresa, sus proyectos y decisiones con precisión y tono calmo.',
  terrenos:
    'Sos el agente de terrenos de Raíces Desarrollos. Evaluás terrenos y manejás el pipeline de adquisiciones usando la rúbrica interna.',
  proyecto:
    'Sos el agente de proyectos de Raíces Desarrollos. Conocés el estado, decisiones y avances de todos los proyectos activos.',
  finanzas:
    'Sos el agente de finanzas de Raíces Desarrollos. Analizás costos, proyecciones y estructuras financieras de los proyectos.',
  comercial:
    'Sos el agente comercial de Raíces Desarrollos. Redactás copy, manejás estrategia de ventas y posicionamiento de marca.',
  legal:
    'Sos el agente legal de Raíces Desarrollos. Conocés los contratos, normativa y procesos notariales de los proyectos.',
};

export async function POST(req: NextRequest) {
  const { message, agent = 'general' } = await req.json();

  if (!message?.trim()) {
    return NextResponse.json({ error: 'Mensaje vacío' }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ apiKeyMissing: true, answer: null });
  }

  try {
    const basePrompt = AGENT_SYSTEM_PROMPTS[agent] ?? AGENT_SYSTEM_PROMPTS.general;

    // Recuperar contexto relevante del knowledge base
    let contextBlock = '';
    let sources: string[] = [];
    try {
      const chunks = await searchKnowledge(message, 5);
      // Filtrar chunks con similaridad mínima para evitar ruido
      const relevant = chunks.filter((c) => c.similarity > 0.3);
      contextBlock = formatContext(relevant);
      sources = [...new Set(relevant.map((c) => c.filePath))];
    } catch {
      // Si la búsqueda falla (tabla vacía, sin key, etc.) seguir sin contexto
    }

    const systemPrompt = contextBlock
      ? `${basePrompt}\n\nUsá el siguiente contexto interno para responder. Si la respuesta está en el contexto, basate en él. Si no, respondé con tu conocimiento general.\n\n${contextBlock}`
      : basePrompt;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message },
        ],
        temperature: 0.3,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      console.error('OpenAI error:', err);
      return NextResponse.json(
        { error: 'Error de OpenAI', detail: err?.error?.message },
        { status: response.status },
      );
    }

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content ?? 'Sin respuesta.';

    return NextResponse.json({ answer, sources });
  } catch (err) {
    console.error('Chat route error:', err);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
