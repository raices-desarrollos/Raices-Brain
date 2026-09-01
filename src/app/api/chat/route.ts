import { BRAIN_TOOLS } from '@/lib/ai/tools';
import { executeBrainTool } from '@/lib/ai/execute-tool';
import { requireAuth } from '@/lib/auth/server';
import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';

const AGENT_SYSTEM_PROMPTS: Record<string, string> = {
  general:
    'Sos el asistente operativo de Raíces Desarrollos, el cerebro interno de la empresa. Respondé en español, con calma, precisión y sin marketing. Si usás una herramienta, basá la respuesta en su resultado. Si no hay datos, decilo: no inventes números ni documentos.',
  terrenos:
    'Sos el agente de terrenos de Raíces Desarrollos. Evaluás terrenos con la rúbrica interna. No inventes pipeline.',
  proyecto:
    'Sos el agente de proyectos. Conocés estado, decisiones y avance. Usá get_project y get_latest_decisions para Ceibo Vidal (Vidal 3849).',
  finanzas:
    'Sos el agente de finanzas. Usá get_invoices, get_payments y get_project_financial_summary. Si no hay registros, decí que aún no están cargados.',
  comercial:
    'Sos el agente comercial de Raíces Desarrollos. Tono de marca: calma, naturaleza urbana, sin superlativos de inmobiliaria genérica.',
  legal:
    'Sos el agente legal. Contratos, normativa y escribanía. No des asesoramiento jurídico formal; señalá documentos y hechos registrados.',
};

type ChatMessage = { role: 'user' | 'assistant'; content: string };

export async function POST(req: NextRequest) {
  const { response } = await requireAuth();
  if (response) return response;

  const body = await req.json();
  const { message, agent = 'general', history } = body as {
    message?: string;
    agent?: string;
    history?: ChatMessage[];
  };

  if (!message?.trim()) {
    return NextResponse.json({ error: 'Mensaje vacío' }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ apiKeyMissing: true, answer: null });
  }

  const openai = new OpenAI({ apiKey });
  const basePrompt = AGENT_SYSTEM_PROMPTS[agent] ?? AGENT_SYSTEM_PROMPTS.general;
  const systemPrompt = `${basePrompt}

Tenés herramientas para consultar base de datos, documentos y knowledge. Usalas cuando la pregunta pida facturas, pagos, unidades, documentos, decisiones o el estado de un proyecto.

Proyecto principal: Ceibo Vidal, dirección Vidal 3849, slug ceibo-vidal.

Reglas:
- Preferí tools de facturas, pagos y documentos estructurados antes que knowledge/RAG.
- Distinguí: dato existente (viene de una tool), dato inferido (solo si lo marcás explícitamente), información no disponible.
- Si una tool devuelve lista vacía, decí que no hay datos cargados todavía. No inventes números, facturas ni documentos.
- Respondé en markdown claro, breve, útil para socios no técnicos.
- Para "último plano" u otros archivos: search_documents y, si hay driveFileId, read_drive_file.`;

  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
  ];

  if (Array.isArray(history)) {
    for (const m of history.slice(-12)) {
      if (m.role === 'user' || m.role === 'assistant') {
        messages.push({ role: m.role, content: m.content });
      }
    }
  }

  messages.push({ role: 'user', content: message });

  const sources = new Set<string>();
  const toolsUsed: string[] = [];

  try {
    let iterations = 0;
    while (iterations < 6) {
      iterations += 1;
      const completion = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL ?? 'gpt-4o',
        messages,
        tools: BRAIN_TOOLS,
        temperature: 0.2,
        max_tokens: 1600,
      });

      const choice = completion.choices[0];
      const assistantMsg = choice.message;
      messages.push(assistantMsg);

      const toolCalls = assistantMsg.tool_calls;
      if (!toolCalls?.length) {
        const answer = assistantMsg.content ?? 'Sin respuesta.';
        return NextResponse.json({
          answer,
          sources: [...sources],
          toolsUsed,
        });
      }

      for (const call of toolCalls) {
        if (call.type !== 'function') continue;
        toolsUsed.push(call.function.name);
        let parsed: Record<string, unknown> = {};
        try {
          parsed = JSON.parse(call.function.arguments || '{}');
        } catch {
          parsed = {};
        }
        const output = await executeBrainTool(call.function.name, parsed);
        try {
          const json = JSON.parse(output) as { results?: { path?: string }[]; documents?: { name?: string }[] };
          for (const r of json.results ?? []) {
            if (r.path) sources.add(r.path);
          }
          for (const d of json.documents ?? []) {
            if (d.name) sources.add(d.name);
          }
        } catch {
          // ignore
        }
        messages.push({
          role: 'tool',
          tool_call_id: call.id,
          content: output,
        });
      }
    }

    return NextResponse.json({
      answer: 'Se alcanzó el límite de herramientas. Reformulá la pregunta.',
      sources: [...sources],
      toolsUsed,
    });
  } catch (err) {
    console.error('Chat route error:', err);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
