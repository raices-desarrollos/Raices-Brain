import { BRAIN_TOOLS } from '@/lib/ai/tools';
import { executeBrainTool } from '@/lib/ai/execute-tool';
import { requireAuth } from '@/lib/auth/server';
import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 60;

const SYSTEM_PROMPT = `Sos el asistente operativo de Raíces Desarrollos. Respondé en español, con calma y precisión, para socios que no programan.

Tenés herramientas para consultar facturas, pagos, documentos, Drive y el estado de Ceibo Vidal (Vidal 3849). Usalas cuando la pregunta lo pida.

El archivo de Google Drive configurado es la carpeta del proyecto Ceibo Vidal. Todos esos archivos son de este proyecto: no hace falta “vincularlos”.

Reglas:
- Preferí get_invoices, get_payments, get_project_financial_summary y search_documents antes que search_knowledge.
- Si una herramienta devuelve lista vacía, decí que todavía no hay datos cargados. No inventes números, facturas ni documentos.
- Ejemplos: si no hay facturas, respondé «Todavía no hay facturas registradas para Ceibo Vidal.»
- Distinguí dato existente (viene de una herramienta) de información no disponible.
- Respondé en markdown breve, útil para operar el proyecto esta semana.`;

type ChatMessage = { role: 'user' | 'assistant'; content: string };

function userFacingAiError(err: unknown): { code: string; status: number; message: string } {
  const raw = err instanceof Error ? err.message : String(err);
  if (/timeout|ETIMEDOUT|timed out/i.test(raw)) {
    return {
      code: 'timeout',
      status: 504,
      message: 'Brain tardó demasiado. Reintentá con una pregunta más concreta.',
    };
  }
  if (err instanceof OpenAI.APIError) {
    if (err.status === 401 || err.status === 403) {
      return {
        code: 'ai_config',
        status: 502,
        message: 'Brain no puede conectarse al servicio de inteligencia. Pedile a quien administra la app que lo revise.',
      };
    }
    return {
      code: 'ai',
      status: 502,
      message: 'Brain no pudo completar la consulta. Reintentá en un momento.',
    };
  }
  return {
    code: 'internal',
    status: 500,
    message: 'No se pudo completar la consulta. Reintentá en un momento.',
  };
}

export async function POST(req: NextRequest) {
  const { response } = await requireAuth();
  if (response) return response;

  let body: { message?: string; history?: ChatMessage[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid', message: 'Pedido inválido.' }, { status: 400 });
  }

  const { message, history } = body;
  if (!message?.trim()) {
    return NextResponse.json({ error: 'empty', message: 'Escribí una pregunta.' }, { status: 400 });
  }
  if (message.length > 8000) {
    return NextResponse.json({ error: 'too_long', message: 'El mensaje es demasiado largo.' }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ apiKeyMissing: true, answer: null });
  }

  const openai = new OpenAI({ apiKey, timeout: 45_000 });
  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: 'system', content: SYSTEM_PROMPT },
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
      answer: 'Hace falta acotar la pregunta. Probá de nuevo con un tema a la vez (facturas, pagos o documentos).',
      sources: [...sources],
      toolsUsed,
    });
  } catch (err) {
    const mapped = userFacingAiError(err);
    console.error('[brain]', mapped.code, err instanceof Error ? err.message : err);
    return NextResponse.json(
      { error: mapped.code, message: mapped.message },
      { status: mapped.status },
    );
  }
}
