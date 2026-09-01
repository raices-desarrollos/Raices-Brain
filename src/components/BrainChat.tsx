'use client';

import { Markdown } from '@/components/Markdown';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

type Message = { role: 'user' | 'assistant'; content: string; sources?: string[] };

const noApiKeyMessage = `Brain no está disponible ahora.

Quien administra la app tiene que completar la conexión.`;

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

function errorFromResponse(status: number, data: { message?: string; error?: string }): string {
  if (data.message) return data.message;
  if (status === 401) return 'La sesión venció. Volvé a iniciar sesión.';
  if (status === 504 || status === 408) return 'Brain tardó demasiado. Reintentá.';
  if (status >= 500) return 'No se pudo completar la consulta. Reintentá en un momento.';
  return 'No se pudo completar la consulta.';
}

export function BrainChat() {
  const searchParams = useSearchParams();
  const initialQ = searchParams.get('q') ?? '';
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState(initialQ);
  const [loading, setLoading] = useState(false);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);
  const [error, setError] = useState('');
  const [lastFailed, setLastFailed] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (preset?: string, opts?: { retry?: boolean }) => {
    const text = (preset ?? input).trim();
    if (!text || loading) return;

    const retrying = Boolean(opts?.retry);
    let history = messages.map((m) => ({ role: m.role, content: m.content }));
    if (retrying) {
      const last = history.at(-1);
      if (last?.role === 'assistant') history = history.slice(0, -1);
      const lastUser = history.at(-1);
      if (lastUser?.role === 'user' && lastUser.content === text) {
        history = history.slice(0, -1);
      }
    }

    setMessages((prev) => {
      if (!retrying) return [...prev, { role: 'user', content: text }];
      const next = [...prev];
      if (next.at(-1)?.role === 'assistant') next.pop();
      const last = next.at(-1);
      if (!(last?.role === 'user' && last.content === text)) {
        next.push({ role: 'user', content: text });
      }
      return next;
    });
    if (!retrying) setInput('');
    setLoading(true);
    setError('');
    setLastFailed(null);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history }),
      });

      const raw = await res.text();
      let data: {
        apiKeyMissing?: boolean;
        error?: string;
        message?: string;
        answer?: string;
        sources?: Array<string | { title?: string; path?: string }>;
      } = {};
      try {
        data = raw ? JSON.parse(raw) : {};
      } catch {
        setError(
          res.status === 504
            ? 'Brain tardó demasiado. Reintentá.'
            : 'No se pudo completar la consulta. Reintentá en un momento.',
        );
        setLastFailed(text);
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: 'No pude responder ahora. Reintentá en un momento.' },
        ]);
        return;
      }

      if (data.apiKeyMissing) {
        setApiKeyMissing(true);
        setMessages((prev) => [...prev, { role: 'assistant', content: noApiKeyMessage }]);
      } else if (!res.ok || data.error) {
        const msg = errorFromResponse(res.status, data);
        setError(msg);
        setLastFailed(text);
        setMessages((prev) => [...prev, { role: 'assistant', content: msg }]);
      } else {
        const sources: string[] = Array.isArray(data.sources)
          ? data.sources.map((s) => (typeof s === 'string' ? s : s.path || s.title || ''))
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
      setError('No se pudo completar la consulta. Reintentá en un momento.');
      setLastFailed(text);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'No se pudo completar la consulta. Reintentá en un momento.' },
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

  return (
    <div className="flex flex-col h-full bg-blanco">
      <div className="flex items-center justify-between px-6 py-4 border-b border-suelo flex-shrink-0">
        <div>
          <h1 className="font-serif text-lg font-light text-ink">Brain</h1>
          <p className="text-sm text-niebla mt-0.5">Preguntá sobre Ceibo Vidal, facturas, pagos o documentos.</p>
        </div>
      </div>

      {apiKeyMissing && (
        <div className="mx-6 mt-4 px-4 py-3 bg-suelo/50 rounded-lg flex-shrink-0">
          <p className="text-sm text-ink">Brain no está disponible ahora.</p>
          <p className="text-sm text-niebla mt-0.5">Pedile a quien administra la app que revise la conexión.</p>
        </div>
      )}

      {error && !apiKeyMissing && (
        <div className="mx-6 mt-4 flex items-center justify-between gap-3 text-sm text-ceibo">
          <p>{error}</p>
          {lastFailed && (
            <button
              type="button"
              onClick={() => handleSend(lastFailed, { retry: true })}
              className="text-sm text-ink underline shrink-0">
              Reintentar
            </button>
          )}
        </div>
      )}

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
                  className="text-left text-sm text-niebla border border-suelo rounded-lg px-3.5 py-2.5 hover:text-ink hover:border-ink hover:bg-suelo/30 transition-colors">
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-2xl px-4 py-3 rounded-xl ${
                msg.role === 'user' ? 'bg-ink text-blanco rounded-br-md' : 'bg-suelo/50 rounded-bl-md'
              }`}>
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
            <div className="bg-suelo/50 rounded-xl rounded-bl-md">
              <TypingIndicator />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex-shrink-0 px-6 py-4 border-t border-suelo">
        <div className="flex items-end gap-3 rounded-xl border border-suelo bg-blanco px-3 py-2 focus-within:border-ink">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Preguntá sobre Ceibo Vidal, facturas, documentos…"
            rows={1}
            className="flex-1 bg-transparent text-sm text-ink placeholder:text-niebla resize-none outline-none max-h-32 py-1"
          />
          <button
            type="button"
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="flex-shrink-0 bg-ink text-blanco w-8 h-8 rounded-full flex items-center justify-center disabled:opacity-30 hover:bg-musgo transition-colors">
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
