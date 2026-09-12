'use client';

import { useEffect, useRef, useState } from 'react';

const SHARE_TEXT = 'Lista de precios de Ceibo Vidal (Preventa 1).';

function downloadFile(file: File) {
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url;
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function canShareFile(file: File): boolean {
  return typeof navigator !== 'undefined' && !!navigator.canShare?.({ files: [file] });
}

async function nativeShare(file: File): Promise<boolean> {
  if (!canShareFile(file)) return false;
  try {
    await navigator.share({
      files: [file],
      title: 'Ceibo Vidal · Lista de precios',
      text: SHARE_TEXT,
    });
    return true;
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') return true;
    return false;
  }
}

export function PriceListShare({ slug }: { slug: string }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  async function prepare(): Promise<File | null> {
    if (file) return file;
    setBusy(true);
    setError('');
    try {
      const res = await fetch(`/api/projects/${slug}/prices/pdf`);
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? 'No se pudo armar el PDF.');
      }
      const blob = await res.blob();
      const name =
        res.headers.get('Content-Disposition')?.match(/filename="([^"]+)"/)?.[1] ??
        'Ceibo-Vidal-lista-precios.pdf';
      const next = new File([blob], name, { type: 'application/pdf' });
      setFile(next);
      return next;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo armar el PDF.');
      return null;
    } finally {
      setBusy(false);
    }
  }

  async function openMenu() {
    const ready = await prepare();
    if (ready) setOpen(true);
  }

  async function shareWhatsApp() {
    const ready = await prepare();
    if (!ready) return;
    if (await nativeShare(ready)) {
      setOpen(false);
      return;
    }
    downloadFile(ready);
    window.open(`https://wa.me/?text=${encodeURIComponent(SHARE_TEXT)}`, '_blank', 'noopener');
    setOpen(false);
  }

  async function shareMail() {
    const ready = await prepare();
    if (!ready) return;
    if (await nativeShare(ready)) {
      setOpen(false);
      return;
    }
    downloadFile(ready);
    const subject = encodeURIComponent('Ceibo Vidal · Lista de precios');
    const body = encodeURIComponent(
      `${SHARE_TEXT}\n\nEl PDF se descargo en esta computadora: adjuntarlo al enviar.`,
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    setOpen(false);
  }

  async function download() {
    const ready = await prepare();
    if (!ready) return;
    downloadFile(ready);
    setOpen(false);
  }

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        onClick={openMenu}
        disabled={busy}
        className="inline-flex items-center gap-2 text-sm border border-ink text-ink px-4 py-2 rounded-lg hover:bg-ink hover:text-blanco transition-colors disabled:opacity-50">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="w-4 h-4">
          <circle cx="6" cy="12" r="2.25" />
          <circle cx="18" cy="6.5" r="2.25" />
          <circle cx="18" cy="17.5" r="2.25" />
          <path strokeLinecap="round" d="M8.1 11.1l7.3-3.6M8.1 12.9l7.3 3.6" />
        </svg>
        {busy ? 'Armando el PDF…' : 'Compartir'}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-56 bg-blanco border border-suelo rounded-xl shadow-lg py-1.5 z-20">
          <p className="px-3.5 pt-1.5 pb-2 text-2xs uppercase tracking-[0.14em] text-niebla">
            PDF listo
          </p>
          <button
            type="button"
            role="menuitem"
            onClick={shareWhatsApp}
            className="w-full text-left px-3.5 py-2 text-sm text-ink hover:bg-lino">
            WhatsApp
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={shareMail}
            className="w-full text-left px-3.5 py-2 text-sm text-ink hover:bg-lino">
            Mail
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={download}
            className="w-full text-left px-3.5 py-2 text-sm text-ink hover:bg-lino">
            Descargar PDF
          </button>
          <p className="px-3.5 pt-2 pb-1.5 text-xs text-niebla leading-relaxed">
            En el celular se manda el PDF. En la computadora se descarga para adjuntarlo.
          </p>
        </div>
      )}

      {error && <p className="absolute right-0 top-full mt-2 text-xs text-ceibo w-56">{error}</p>}
    </div>
  );
}
