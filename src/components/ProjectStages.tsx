'use client';

import { useEffect, useId, useRef, useState } from 'react';

type StageState = 'done' | 'current' | 'upcoming';

type Stage = {
  id: string;
  label: string;
  phaseId: string;
  state: StageState;
};

type Phase = {
  id: string;
  label: string;
  state: StageState;
  stages: Stage[];
};

export type StageSnapshot = {
  currentId: string;
  current: { id: string; label: string };
  phase: { id: string; label: string };
  phases: Phase[];
};

/**
 * El sello de etapa que ya tenía el header. Adentro, un menú chico para
 * cambiarla: el resumen no se rellena con el recorrido.
 */
export function ProjectStages({
  slug,
  initial,
  onChange,
}: {
  slug: string;
  initial: StageSnapshot;
  onChange?: (stage: StageSnapshot) => void;
}) {
  const [stage, setStage] = useState(initial);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState('');
  const menuId = useId();
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (root.current && !root.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  async function select(stageId: string) {
    if (stageId === stage.currentId || saving) return;
    setSaving(stageId);
    setError('');
    try {
      const res = await fetch(`/api/projects/${slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stageId }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.stage) {
        setError(data?.error ?? 'No se pudo cambiar la etapa.');
        return;
      }
      setStage(data.stage);
      onChange?.(data.stage);
      setOpen(false);
    } catch {
      setError('No se pudo cambiar la etapa.');
    } finally {
      setSaving(null);
    }
  }

  return (
    <div ref={root} className="relative self-start">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-full border border-suelo px-3 py-1.5 hover:border-ink transition-colors">
        <span className="w-1.5 h-1.5 rounded-full bg-tierra" aria-hidden />
        <span className="text-xs uppercase tracking-[0.14em] text-tierra">{stage.current.label}</span>
      </button>

      {open && (
        <div
          id={menuId}
          role="listbox"
          aria-label="Estado del proyecto"
          className="absolute right-0 top-full z-20 mt-2 w-64 bg-blanco border border-suelo rounded-xl p-2 shadow-lg">
          <p className="px-2.5 pt-1.5 pb-2 mb-1 text-sm text-ink border-b border-suelo">
            Estado del proyecto
          </p>
          {stage.phases.map((phase) => (
            <div key={phase.id} className="py-1">
              <p className="px-2.5 pt-1.5 pb-1 text-2xs tracking-[0.16em] uppercase text-niebla">
                {phase.label}
              </p>
              {phase.stages.map((item) => {
                const current = item.state === 'current';
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="option"
                    aria-selected={current}
                    disabled={saving === item.id}
                    onClick={() => select(item.id)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-sm transition-colors ${
                      current ? 'bg-ink text-blanco' : 'text-ink hover:bg-lino'
                    }`}>
                    {item.label}
                  </button>
                );
              })}
            </div>
          ))}
          {error && <p className="px-2.5 py-2 text-xs text-ceibo">{error}</p>}
        </div>
      )}
    </div>
  );
}
