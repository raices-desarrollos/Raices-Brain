'use client';

import { useEffect } from 'react';

/**
 * Última red de contención: se usa cuando falla el layout raíz, así que no
 * puede apoyarse en los componentes ni en los estilos de la app.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[global-error]', error);
  }, [error]);

  return (
    <html lang="es">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.75rem',
          padding: '2rem',
          textAlign: 'center',
          backgroundColor: '#F0EDE6',
          color: '#21201E',
          fontFamily: 'Georgia, Cambria, serif',
        }}>
        <p
          style={{
            fontSize: '0.6875rem',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: '#6E6F68',
            fontFamily: 'system-ui, sans-serif',
          }}>
          Raíces
        </p>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 400, margin: 0 }}>No pudimos abrir la app</h1>
        <p
          style={{
            fontSize: '0.9375rem',
            color: '#6E6F68',
            maxWidth: '26rem',
            fontFamily: 'system-ui, sans-serif',
          }}>
          Hubo un error al arrancar. Reintentá en un momento.
        </p>
        <button
          type="button"
          onClick={reset}
          style={{
            marginTop: '0.5rem',
            padding: '0.5rem 1rem',
            fontSize: '0.9375rem',
            color: '#F8F7F4',
            backgroundColor: '#21201E',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            fontFamily: 'system-ui, sans-serif',
          }}>
          Reintentar
        </button>
      </body>
    </html>
  );
}
