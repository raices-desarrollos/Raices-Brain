'use client';

import { useEffect, useId, useRef } from 'react';
import type { ReactNode } from 'react';

/**
 * Diálogo modal con el comportamiento que se espera de uno: cierra con Escape,
 * cierra al clickear afuera, frena el scroll del fondo, deja el foco adentro y
 * se anuncia a los lectores de pantalla.
 */
export function Modal({
  title,
  subtitle,
  onClose,
  children,
  footer,
  width = 'md',
}: {
  title: string;
  subtitle?: ReactNode;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  width?: 'md' | 'lg';
}) {
  const titleId = useId();
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !panel.current) return;

      // Ciclamos el foco entre los controles del modal para que no se escape al
      // contenido de atrás, que está tapado.
      const focusables = panel.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // El primer control del modal recibe el foco al abrirse.
    panel.current
      ?.querySelector<HTMLElement>(
        'input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled])',
      )
      ?.focus();

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-ink/50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Cerrar"
        tabIndex={-1}
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`relative bg-blanco w-full ${
          width === 'lg' ? 'max-w-2xl' : 'max-w-md'
        } p-6 rounded-xl max-h-[90vh] overflow-y-auto scrollbar-thin shadow-2xl`}>
        <h2 id={titleId} className="font-serif text-xl text-ink">
          {title}
        </h2>
        {subtitle && <p className="text-sm text-niebla mt-1">{subtitle}</p>}
        <div className="mt-6">{children}</div>
        {footer && <div className="flex gap-3 justify-end mt-6">{footer}</div>}
      </div>
    </div>
  );
}

export default Modal;
