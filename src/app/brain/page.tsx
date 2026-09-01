import { BrainChat } from '@/components/BrainChat';
import { Suspense } from 'react';

export default function BrainPage() {
  return (
    <div className="h-full">
      <Suspense fallback={<div className="p-10 text-sm text-niebla">Cargando Brain…</div>}>
        <BrainChat />
      </Suspense>
    </div>
  );
}
