import { BrainChat } from '@/components/BrainChat';
import { PageLoader } from '@/components/ui';
import { Suspense } from 'react';

export default function BrainPage() {
  return (
    <div className="h-full">
      <Suspense
        fallback={
          <PageLoader kicker="Brain" title="Preparando el asistente" hint="Consultas sobre Ceibo Vidal, facturas y documentos." />
        }>
        <BrainChat />
      </Suspense>
    </div>
  );
}
