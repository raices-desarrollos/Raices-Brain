'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

type Agent = { slug: string; label: string; color: string };
type Message = { role: 'user' | 'assistant'; content: string; sources?: Source[] };
type Source = { title: string; category?: string; project?: string };

const agents: Agent[] = [
  { slug: 'general', label: 'General', color: 'text-musgo' },
  { slug: 'terrenos', label: 'Terrenos', color: 'text-tierra' },
  { slug: 'proyecto', label: 'Proyecto', color: 'text-arena' },
  { slug: 'finanzas', label: 'Finanzas', color: 'text-musgo' },
  { slug: 'comercial', label: 'Comercial', color: 'text-ceibo' },
  { slug: 'legal', label: 'Legal', color: 'text-niebla' },
];

const noApiKeyMessage = `No hay una API key de OpenAI configurada.

Para habilitar el Brain, completá \`OPENAI_API_KEY\` en tu archivo \`.env.local\` y reiniciá el servidor.

Mientras tanto, podés explorar el knowledge base desde los archivos en \`knowledge/\` y revisar las decisiones en la sección /decisiones.`;

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
  const [activeAgent, setActiveAgent] = useState(initialAgent);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, agent: activeAgent }),
      });

      const data = await res.json();

      if (data.apiKeyMissing) {
        setApiKeyMissing(true);
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: noApiKeyMessage,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: data.answer ?? data.message ?? 'Sin respuesta.',
            sources: data.sources,
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Error al conectar con el servidor. Verificá que la app esté corriendo.',
        },
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
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-suelo bg-blanco flex-shrink-0">
        <div>
          <h1 className="text-sm font-medium text-ink">Raíces Brain</h1>
          <p className="text-2xs text-niebla mt-0.5">
            Agente activo:{' '}
            <span className={`font-medium ${currentAgent?.color}`}>{currentAgent?.label}</span>
          </p>
        </div>

        {/* Agent selector */}
        <div className="flex items-center gap-1.5">
          {agents.map((a) => (
            <button
              key={a.slug}
              onClick={() => setActiveAgent(a.slug)}
              className={`text-2xs px-2.5 py-1 rounded-full border transition-colors ${
                activeAgent === a.slug
                  ? 'bg-ink text-lino border-ink'
                  : 'text-niebla border-suelo hover:border-ink hover:text-ink'
              }`}>
              {a.label}
            </button>
          ))}
        </div>
      </div>

      {/* API key warning banner */}
      {apiKeyMissing && (
        <div className="mx-6 mt-4 px-4 py-3 bg-arena/10 border border-arena/30 rounded-lg flex-shrink-0">
          <p className="text-xs text-tierra font-medium">API key no configurada</p>
          <p className="text-xs text-niebla mt-0.5">
            Completá <code className="bg-suelo px-1 rounded">OPENAI_API_KEY</code> en{' '}
            <code className="bg-suelo px-1 rounded">.env.local</code> para habilitar el Brain.
          </p>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-6 space-y-5">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-10 h-10 rounded-full bg-liquen/10 flex items-center justify-center mb-4">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-liquen">
                <path
                  fillRule="evenodd"
                  d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <p className="text-sm text-ink font-medium">Preguntale al Brain</p>
            <p className="text-xs text-niebla mt-1 max-w-xs">
              Consultá sobre proyectos, terrenos, decisiones, copy comercial o cualquier cosa del
              conocimiento interno de Raíces.
            </p>
            <div className="mt-6 grid grid-cols-1 gap-2 w-full max-w-sm">
              {[
                '¿Cuáles son las decisiones de fachada de Ceibo Vidal?',
                '¿Cuántos balcones tiene Ceibo Vidal?',
                '¿Qué terrenos están en evaluación?',
              ].map((q) => (
                <button
                  key={q}
                  onClick={() => {
                    setInput(q);
                    inputRef.current?.focus();
                  }}
                  className="text-left text-xs text-niebla border border-suelo rounded-lg px-3 py-2 hover:border-ink hover:text-ink transition-colors">
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-2xl rounded-xl px-4 py-3 ${
                msg.role === 'user'
                  ? 'bg-ink text-lino text-sm'
                  : 'bg-lino border border-suelo text-ink text-sm'
              }`}>
              <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-3 pt-3 border-t border-suelo space-y-1">
                  <p className="text-2xs text-niebla uppercase tracking-wider">Fuentes</p>
                  {msg.sources.map((s, si) => (
                    <p key={si} className="text-2xs text-niebla">
                      · {s.title} {s.project && <span className="text-arena">· {s.project}</span>}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-lino border border-suelo rounded-xl">
              <TypingIndicator />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 px-6 py-4 border-t border-suelo bg-blanco">
        <div className="flex items-end gap-3 bg-lino border border-suelo rounded-xl px-4 py-3 focus-within:border-ink transition-colors">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Preguntá algo sobre Raíces..."
            rows={1}
            className="flex-1 bg-transparent text-sm text-ink placeholder:text-niebla resize-none outline-none max-h-32 scrollbar-thin"
            style={{ scrollbarWidth: 'none' }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="flex-shrink-0 bg-ink text-lino w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-30 hover:bg-musgo transition-colors">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </div>
        <p className="text-2xs text-niebla mt-2 text-center">
          Enter para enviar · Shift+Enter para nueva línea
        </p>
      </div>
    </div>
  );
}
