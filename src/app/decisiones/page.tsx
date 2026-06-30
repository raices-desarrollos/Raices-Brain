import { readFileSync, readdirSync } from 'fs';
import Link from 'next/link';
import { join } from 'path';

interface Decision {
  title: string;
  date: string;
  project: string;
  area: string;
  status: string;
  slug: string;
  content: string;
}

function parseDecisionFile(filePath: string, slug: string): Decision {
  const raw = readFileSync(filePath, 'utf-8');
  const lines = raw.split('\n');

  const title = lines[0]?.replace(/^#\s*/, '').replace('Decisión: ', '').trim();
  const dateMatch = raw.match(/\*\*Fecha:\*\*\s*(.+)/);
  const projectMatch = raw.match(/\*\*Proyecto:\*\*\s*(.+)/);
  const areaMatch = raw.match(/\*\*Área:\*\*\s*(.+)/);
  const statusMatch = raw.match(/\*\*Estado:\*\*\s*(.+)/);

  // Extract first paragraph after "## La decisión"
  const sectionMatch = raw.match(/## La decisión\n\n(.+?)(?:\n\n|$)/s);

  return {
    title,
    date: dateMatch?.[1]?.trim() ?? '—',
    project: projectMatch?.[1]?.trim() ?? '—',
    area: areaMatch?.[1]?.trim() ?? '—',
    status: statusMatch?.[1]?.trim() ?? '—',
    slug,
    content: sectionMatch?.[1]?.trim() ?? '',
  };
}

function getDecisions(): Decision[] {
  const base = join(process.cwd(), 'knowledge', 'projects', 'ceibo-vidal', 'decisions');
  try {
    const files = readdirSync(base).filter((f) => f.endsWith('.md'));
    return files
      .map((f) => parseDecisionFile(join(base, f), f.replace('.md', '')))
      .sort((a, b) => b.date.localeCompare(a.date));
  } catch {
    return [];
  }
}

const statusColors: Record<string, string> = {
  'Aprobada y vigente': 'bg-liquen/10 text-musgo border-liquen/20',
  'En revisión': 'bg-arena/10 text-tierra border-arena/20',
  Pendiente: 'bg-niebla/10 text-niebla border-niebla/20',
};

export default function DecisionesPage() {
  const decisions = getDecisions();

  return (
    <div className="max-w-4xl mx-auto px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <p className="text-niebla text-xs tracking-widest uppercase mb-1">Registro</p>
        <h1 className="text-2xl font-light text-ink">Decisiones</h1>
        <p className="text-niebla text-sm mt-1">
          {decisions.length} decisión{decisions.length !== 1 ? 'es' : ''} registrada
          {decisions.length !== 1 ? 's' : ''}
        </p>
        <p className="text-xs text-niebla mt-3 max-w-lg border-l-2 border-suelo pl-3">
          Memoria institucional del proyecto. Cada decisión incluye contexto, alternativas
          consideradas y razón de la elección. Si alguíx pregunta &ldquo;¿por qué hicimos
          esto?&rdquo;, la respuesta está acá.
        </p>
      </div>

      {/* Filter bar (visual only) */}
      <div className="flex items-center gap-2 mb-6">
        <span className="text-2xs text-niebla uppercase tracking-wider mr-2">Proyecto</span>
        <button className="text-2xs px-2.5 py-1 rounded-full bg-ink text-lino border border-ink">
          Ceibo Vidal
        </button>
        <button className="text-2xs px-2.5 py-1 rounded-full text-niebla border border-suelo hover:border-ink hover:text-ink transition-colors">
          Todos
        </button>
      </div>

      {/* Decisions list */}
      {decisions.length === 0 ? (
        <div className="text-center py-20 text-niebla">
          <p className="text-sm">No hay decisiones registradas todavía.</p>
          <p className="text-xs mt-1">
            Agregá archivos `.md` en{' '}
            <code className="bg-suelo px-1 rounded">knowledge/projects/[proyecto]/decisions/</code>
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {decisions.map((d) => (
            <div
              key={d.slug}
              className="border border-suelo rounded-xl overflow-hidden hover:border-arena transition-colors">
              <div className="px-6 py-4 bg-lino flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-ink text-sm leading-snug">{d.title}</p>
                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                    <span className="text-2xs text-niebla">{d.date}</span>
                    <span className="text-2xs text-niebla">·</span>
                    <span className="text-2xs text-niebla">{d.project}</span>
                    <span className="text-2xs text-niebla">·</span>
                    <span className="text-2xs text-niebla">{d.area}</span>
                  </div>
                </div>
                <span
                  className={`flex-shrink-0 text-2xs font-medium tracking-wider px-2.5 py-1 rounded-full border ${statusColors[d.status] ?? 'bg-suelo text-niebla border-suelo'}`}>
                  {d.status}
                </span>
              </div>
              {d.content && (
                <div className="px-6 py-4 border-t border-suelo">
                  <p className="text-sm text-niebla leading-relaxed line-clamp-2">{d.content}</p>
                </div>
              )}
              <div className="px-6 py-3 border-t border-suelo flex justify-between items-center">
                <span className="text-2xs text-niebla">{d.slug}</span>
                <Link
                  href={`/brain?agent=proyecto&q=${encodeURIComponent(d.title)}`}
                  className="text-xs text-musgo hover:text-liquen transition-colors">
                  Preguntar al Brain →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
