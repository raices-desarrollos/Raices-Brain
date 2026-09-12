import { BrandMark, GhostButton, PrimaryButton } from '@/components/ui';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
      <BrandMark />
      <p className="text-2xs tracking-[0.22em] uppercase text-niebla mt-8">Raíces</p>
      <h1 className="font-serif text-2xl sm:text-3xl text-ink mt-2">Esta pantalla no existe</h1>
      <p className="text-sm text-niebla mt-3 max-w-sm">
        Puede que el link esté viejo o que la sección todavía no esté armada.
      </p>
      <div className="flex flex-wrap gap-2 justify-center mt-6">
        <PrimaryButton href="/">Ir al inicio</PrimaryButton>
        <GhostButton href="/projects/ceibo-vidal">Ir a Ceibo Vidal</GhostButton>
      </div>
    </div>
  );
}
