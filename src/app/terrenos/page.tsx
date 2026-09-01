import { readFileSync, readdirSync } from 'fs';
import Link from 'next/link';
import { join } from 'path';

interface Terrain {
  name: string;
  status: 'pipeline' | 'evaluated' | 'rejected';
  content: string;
  slug: string;
}

function getTerrains(): Terrain[] {
  const base = join(process.cwd(), 'knowledge', 'terrains');
  const results: Terrain[] = [];
  const dirs: Array<{ dir: string; status: Terrain['status'] }> = [
    { dir: join(base, 'pipeline'), status: 'pipeline' },
    { dir: join(base, 'evaluated'), status: 'evaluated' },
    { dir: join(base, 'rejected'), status: 'rejected' },
  ];
  for (const { dir, status } of dirs) {
    try {
      const files = readdirSync(dir).filter((f) => f.endsWith('.md'));
      for (const f of files) {
        const raw = readFileSync(join(dir, f), 'utf-8');
        const title = raw.split('\n')[0]?.replace(/^#\s*/, '').trim();
        results.push({
          name: title || f,
          status,
          content: raw.slice(0, 200),
          slug: f.replace('.md', ''),
        });
      }
    } catch {
      // dir empty or missing
    }
  }
  return results;
}

const statusLabel: Record<Terrain['status'], string> = {
  pipeline: 'En análisis',
  evaluated: 'Evaluado',
  rejected: 'Descartado',
};
const statusColor: Record<Terrain['status'], string> = {
  pipeline: 'bg-gray-100 text-amber-700 border-amber-200',
  evaluated: 'bg-blue-50 text-blue-600 border-blue-200',
  rejected: 'bg-red-50 text-red-600 border-red-200',
};

export default function TerrenosPage() {
  const terrains = getTerrains();
  const pipeline = terrains.filter((t) => t.status === 'pipeline');
  const evaluated = terrains.filter((t) => t.status === 'evaluated');
  const rejected = terrains.filter((t) => t.status === 'rejected');

  return (
    <div className="max-w-4xl mx-auto px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <p className="text-gray-500 text-xs tracking-widest uppercase mb-1">Adquisiciones</p>
        <h1 className="text-2xl font-light text-gray-900">Terrenos</h1>
        <p className="text-gray-500 text-sm mt-1">
          {terrains.length} terreno{terrains.length !== 1 ? 's' : ''} en el sistema
        </p>
        <p className="text-xs text-gray-500 mt-3 max-w-lg border-l-2 border-gray-200 pl-3">
          Pipeline de terrenos analizados por Raíces. Cada terreno pasa por tres etapas: en
          análisis, evaluado formalmente con la rúbrica interna, o descartado con justificación.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'En análisis', value: pipeline.length, color: 'text-amber-700' },
          { label: 'Evaluados', value: evaluated.length, color: 'text-blue-600' },
          { label: 'Descartados', value: rejected.length, color: 'text-red-600' },
        ].map((s) => (
          <div key={s.label} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className={`text-2xl font-light ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {terrains.length === 0 && (
        <div className="text-center py-16 border border-dashed border-suelo rounded-xl">
          <p className="text-sm text-ink">Todavía no hay terrenos en análisis.</p>
          <p className="text-sm text-niebla mt-2">Cuando evalúen uno, va a aparecer acá.</p>
          <Link
            href="/brain?q=Evaluá este terreno"
            className="inline-block mt-4 text-sm text-musgo border border-ink rounded-lg px-4 py-2">
            Preguntar a Brain
          </Link>
        </div>
      )}

      {/* Pipeline */}
      {[
        { label: 'En análisis', items: pipeline, status: 'pipeline' as const },
        { label: 'Evaluados', items: evaluated, status: 'evaluated' as const },
        { label: 'Descartados', items: rejected, status: 'rejected' as const },
      ]
        .filter((g) => g.items.length > 0)
        .map((group) => (
          <div key={group.label} className="mb-8">
            <h2 className="text-xs font-medium text-gray-500 tracking-widest uppercase mb-3">
              {group.label}
            </h2>
            <div className="space-y-3">
              {group.items.map((t) => (
                <div key={t.slug} className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="px-5 py-4 bg-gray-50 flex items-center justify-between gap-4">
                    <p className="font-medium text-sm text-gray-900">{t.name}</p>
                    <span
                      className={`text-2xs font-medium tracking-wider px-2.5 py-1 rounded-full border ${statusColor[t.status]}`}>
                      {statusLabel[t.status]}
                    </span>
                  </div>
                  <div className="px-5 py-3 border-t border-gray-200 flex justify-end">
                    <Link
                      href={`/brain?agent=terrenos&q=${encodeURIComponent(t.name)}`}
                      className="text-xs text-blue-600 hover:text-blue-500 transition-colors">
                      Analizar con Brain →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

      {/* CTA */}
      <div className="mt-6 border border-dashed border-gray-200 rounded-xl p-6 text-center">
        <p className="text-sm text-gray-500 mb-3">¿Tenés un terreno para evaluar?</p>
        <Link
          href="/brain?q=Evaluá este terreno"
          className="inline-block text-sm font-medium text-blanco bg-ink rounded-lg px-5 py-2.5 hover:bg-musgo transition-colors">
          Evaluar con Brain
        </Link>
      </div>
    </div>
  );
}
