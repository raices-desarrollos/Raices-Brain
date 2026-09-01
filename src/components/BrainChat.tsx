'use client';

import { Markdown } from '@/components/Markdown';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

type Agent = { slug: string; label: string };
type Message = { role: 'user' | 'assistant'; content: string; sources?: string[] };

const agents: Agent[] = [
  { slug: 'general', label: 'General' },
  { slug: 'terrenos', label: 'Terrenos' },
  { slug: 'proyecto', label: 'Proyecto' },
  { slug: 'finanzas', label: 'Finanzas' },
  { slug: 'comercial', label: 'Comercial' },
  { slug: 'legal', label: 'Legal' },
];

const noApiKeyMessage = `No hay una API key de OpenAI configurada.

Completá \`OPENAI_API_KEY\` en \`.env.local\` y reiniciá el servidor.`;

function TypingIndicator() {
  return (
    <div className="flex gap-1.5 items-center px-4 py-3">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-niebla animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}

export function BrainChat() {
  const searchParams = useSearchParams();
  const initialAgent = searchParams.get('agent') ?? 'general';
  const initialQ = searchParams.get('q') ?? '';
  const [activeAgent, setActiveAgent] = useState(initialAgent);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState(initialQ);
  const [loading, setLoading] = useState(false);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (preset?: string) => {
    const text = (preset ?? input).trim();
    if (!text || loading) return;

    const history = messages.map((m) => ({ role: m.role, content: m.content }));
    const userMsg: Message = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, agent: activeAgent, history }),
      });

      const data = await res.json();

      if (data.apiKeyMissing) {
        setApiKeyMissing(true);
        setMessages((prev) => [...prev, { role: 'assistant', content: noApiKeyMessage }]);
      } else if (data.error) {
        setError(data.detail ?? data.error);
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: 'No se pudo completar la consulta. Reintentá en un momento.' },
        ]);
      } else {
        const sources: string[] = Array.isArray(data.sources)
          ? data.sources.map((s: string | { title?: string; path?: string }) =>
              typeof s === 'string' ? s : s.path || s.title || '',
            )
          : [];
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: data.answer ?? 'Sin respuesta.',
            sources: sources.filter(Boolean),
          },
        ]);
      }
    } catch {
      setError('Error al conectar con el servidor.');
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Error al conectar con el servidor. Verificá que la app esté corriendo.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const currentAgent = agents.find((a) => a.slug === activeAgent);

  return (
    <div className="flex flex-col h-full bg-blanco">
      <div className="flex items-center justify-between px-6 py-4 border-b border-suelo flex-shrink-0">
        <div>
          <h1 className="font-serif text-lg font-light text-ink">Brain</h1>
          <p className="text-2xs text-niebla mt-0.5">
            Agente: <span className="text-ink">{currentAgent?.label}</span>
          </p>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          {agents.map((a) => (
            <button
              key={a.slug}
              onClick={() => setActiveAgent(a.slug)}
              className={`text-2xs px-2.5 py-1 border transition-colors ${
                activeAgent === a.slug
                  ? 'bg-ink text-blanco border-ink'
                  : 'text-niebla border-suelo hover:border-ink hover:text-ink'
              }`}>
              {a.label}
            </button>
          ))}
        </div>
      </div>

      {apiKeyMissing && (
        <div className="mx-6 mt-4 px-4 py-3 bg-suelo/50 flex-shrink-0">
          <p className="text-xs text-ink font-medium">API key no configurada</p>
          <p className="text-xs text-niebla mt-0.5">
            Completá <code>OPENAI_API_KEY</code> en <code>.env.local</code>.
          </p>
        </div>
      )}

      {error && !apiKeyMissing && <div className="mx-6 mt-4 text-xs text-ceibo">{error}</div>}

      <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-6 space-y-5">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="font-serif text-xl font-light text-ink">Preguntale al Brain</p>
            <p className="text-sm text-niebla mt-2 max-w-sm">
              Facturas, pagos, documentos y el estado de Ceibo Vidal. Si no hay datos, te lo dice.
            </p>
            <div className="mt-8 grid grid-cols-1 gap-2 w-full max-w-md">
              {[
                'Resumime el estado actual de Ceibo Vidal.',
                'Mostrame las últimas facturas de Ceibo Vidal.',
                '¿Cuánto pagamos este mes?',
                '¿Qué documentos tenemos sobre carpinterías?',
              ].map((q) => (
                <button
                  key={q}
                  onClick={() => handleSend(q)}
                  className="text-left text-sm text-niebla border-b border-suelo px-1 py-2 hover:text-ink hover:border-ink">
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-2xl px-4 py-3 ${msg.role === 'user' ? 'bg-ink text-blanco' : 'bg-suelo/40'}`}>
              {msg.role === 'assistant' ? (
                <Markdown text={msg.content} />
              ) : (
                <p className="whitespace-pre-wrap leading-relaxed text-sm">{msg.content}</p>
              )}
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-3 pt-3 border-t border-suelo/80 space-y-1">
                  <p className="text-2xs text-niebla uppercase tracking-wider">Fuentes</p>
                  {msg.sources.map((s, si) => (
                    <p key={si} className="text-2xs text-niebla">
                      {s}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-suelo/40">
              <TypingIndicator />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex-shrink-0 px-6 py-4 border-t border-suelo">
        <div className="flex items-end gap-3 border-b border-suelo focus-within:border-ink pb-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Preguntá sobre Ceibo Vidal, facturas, documentos…"
            rows={1}
            className="flex-1 bg-transparent text-sm text-ink placeholder:text-niebla resize-none outline-none max-h-32"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="flex-shrink-0 bg-ink text-blanco w-8 h-8 flex items-center justify-center disabled:opacity-30">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </div>
        <p className="text-2xs text-niebla mt-2">Enter para enviar · Shift+Enter nueva línea</p>
      </div>
    </div>
  );
}
