'use client';

import { BrandMark, GhostButton, PrimaryButton } from '@/components/ui';
import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[error-boundary]', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
      <BrandMark />
      <p className="text-2xs tracking-[0.22em] uppercase text-niebla mt-8">Raíces</p>
      <h1 className="font-serif text-2xl sm:text-3xl text-ink mt-2">Algo se rompió acá</h1>
      <p className="text-sm text-niebla mt-3 max-w-sm">
        No pudimos terminar de cargar esta pantalla. Podés reintentar; si sigue pasando, lo
        anotamos para revisarlo.
      </p>
      <div className="flex flex-wrap gap-2 justify-center mt-6">
        <PrimaryButton onClick={reset}>Reintentar</PrimaryButton>
        <GhostButton href="/">Volver al inicio</GhostButton>
      </div>
      {error.digest && (
        <p className="text-2xs text-niebla/70 mt-8 tracking-wide">Referencia: {error.digest}</p>
      )}
    </div>
  );
}
