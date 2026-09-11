'use client';

import { Spinner } from '@/components/ui';
import { formatBytes, formatDate } from '@/lib/format';
import { useEffect, useState } from 'react';

type Deck = {
  slug: string;
  pdfName: string | null;
  pdfSize: number | null;
  hasHtml: boolean;
  modifiedTime: string | null;
};

export function SalesDeck({ slug }: { slug: string }) {
  const [deck, setDeck] = useState<Deck | null>(null);
  const [open, setOpen] = useState(false);
  const [rendered, setRendered] = useState(false);

  useEffect(() => {
    let active = true;
    fetch(`/api/projects/${slug}/carpeta`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (active) setDeck(d);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [slug]);

  // Cerrar con Escape y frenar el scroll del fondo mientras el visor está abierto.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (!deck) return null;

  const webUrl = `/api/projects/${slug}/carpeta/file/index`;
  const pdfUrl = `/api/projects/${slug}/carpeta/file/pdf`;

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {deck.hasHtml && (
          <button
            type="button"
            onClick={() => {
              setRendered(false);
              setOpen(true);
            }}
            className="inline-flex items-center gap-2 text-sm border border-ink text-ink px-4 py-2 rounded-lg hover:bg-ink hover:text-blanco transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="w-4 h-4">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.036 12.322a1 1 0 010-.644C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178a1 1 0 010 .644C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.964-7.178z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Ver carpeta de venta
          </button>
        )}
        {deck.pdfName && (
          <a
            href={pdfUrl}
            className="inline-flex items-center gap-2 text-sm text-ink border border-suelo px-4 py-2 rounded-lg hover:border-ink hover:bg-lino transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="w-4 h-4">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2"
              />
            </svg>
            Descargar PDF
          </a>
        )}
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-ink/70 flex items-center justify-center p-0 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Carpeta de venta">
          <button
            type="button"
            aria-label="Cerrar"
            className="absolute inset-0 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div className="relative bg-blanco w-full h-full sm:h-[92vh] sm:max-w-6xl sm:rounded-xl overflow-hidden flex flex-col shadow-2xl">
            <header className="relative z-10 flex items-center gap-3 sm:gap-4 px-4 sm:px-5 h-16 border-b border-suelo shrink-0 bg-blanco">
              <div className="min-w-0 flex-1">
                <p className="text-2xs tracking-[0.18em] uppercase text-niebla">Carpeta de venta</p>
                <p className="text-sm text-ink truncate mt-0.5">Ceibo Vidal · Vidal 3849</p>
              </div>
              <p className="hidden lg:block text-xs text-niebla shrink-0">
                {deck.modifiedTime ? formatDate(deck.modifiedTime) : ''}
              </p>
              <a
                href={webUrl}
                target="_blank"
                rel="noreferrer"
                className="hidden sm:block text-xs text-niebla hover:text-ink transition-colors shrink-0">
                Pestaña nueva
              </a>
              {deck.pdfName && (
                <a href={pdfUrl} className="text-xs text-musgo hover:text-ink transition-colors shrink-0">
                  Descargar{deck.pdfSize ? ` (${formatBytes(deck.pdfSize)})` : ''}
                </a>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Cerrar"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-niebla hover:text-ink hover:bg-suelo transition-colors shrink-0">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4">
                  <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </header>
            <div className="flex-1 relative bg-lino">
              {!rendered && (
                <div className="absolute inset-0 flex items-center justify-center gap-3 pointer-events-none">
                  <Spinner className="w-5 h-5" />
                  <span className="text-sm text-niebla">Abriendo la carpeta…</span>
                </div>
              )}
              <iframe
                src={webUrl}
                title="Carpeta de venta de Ceibo Vidal"
                onLoad={() => setRendered(true)}
                className="absolute inset-0 w-full h-full border-0"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default SalesDeck;
