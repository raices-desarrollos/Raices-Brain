import Link from 'next/link';

const agents = [
  {
    slug: 'general',
    label: 'General',
    description: 'Preguntas generales sobre Raíces',
    color: 'bg-liquen/10 text-musgo border-liquen/20',
  },
  {
    slug: 'terrenos',
    label: 'Terrenos',
    description: 'Evaluación de terrenos y pipeline',
    color: 'bg-tierra/10 text-tierra border-tierra/20',
  },
  {
    slug: 'proyecto',
    label: 'Proyecto',
    description: 'Estado y decisiones de proyectos',
    color: 'bg-arena/10 text-tierra border-arena/20',
  },
  {
    slug: 'finanzas',
    label: 'Finanzas',
    description: 'Números, costos y proyecciones',
    color: 'bg-musgo/10 text-musgo border-musgo/20',
  },
  {
    slug: 'comercial',
    label: 'Comercial',
    description: 'Ventas, copy y estrategia comercial',
    color: 'bg-ceibo/10 text-ceibo border-ceibo/20',
  },
  {
    slug: 'legal',
    label: 'Legal',
    description: 'Contratos, normativa y escrituras',
    color: 'bg-niebla/10 text-ink border-niebla/20',
  },
];

const stats = [
  { label: 'Proyectos activos', value: '1', sub: 'Ceibo Vidal · diseño', href: '/decisiones' },
  { label: 'Decisiones recientes', value: '3', sub: 'Última: hace 3 días', href: '/decisiones' },
  { label: 'Terrenos en pipeline', value: '0', sub: 'Ninguno activo', href: '/terrenos' },
  { label: 'Documentos indexados', value: '—', sub: 'Pendiente configuración DB', href: '/admin' },
];

export default function DashboardPage() {
  return (
    <div className="max-w-5xl mx-auto px-8 py-10">
      {/* Header */}
      <div className="mb-10">
        <p className="text-niebla text-xs tracking-widest uppercase mb-1">Raíces Desarrollos</p>
        <h1 className="text-2xl font-light text-ink">Buenos días.</h1>
        <p className="text-niebla text-sm mt-1">
          {new Date().toLocaleDateString('es-AR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
        <p className="text-xs text-niebla mt-3 max-w-lg border-l-2 border-suelo pl-3">
          Panel central de Raíces Brain. Desde acá accedés al chat con IA, al registro de
          decisiones, al pipeline de terrenos y a la configuración del sistema.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="bg-lino rounded-lg p-5 border border-suelo hover:border-arena transition-colors group">
            <p className="text-2xl font-light text-ink group-hover:text-musgo transition-colors">
              {s.value}
            </p>
            <p className="text-xs font-medium text-ink mt-1">{s.label}</p>
            <p className="text-2xs text-niebla mt-1">{s.sub}</p>
          </Link>
        ))}
      </div>

      {/* Chat quick access */}
      <div className="bg-ink rounded-xl p-6 mb-10 flex items-center justify-between">
        <div>
          <p className="text-lino font-medium">Consultá el cerebro de Raíces</p>
          <p className="text-niebla text-sm mt-1">
            Preguntá sobre proyectos, decisiones, terrenos o copy comercial.
          </p>
        </div>
        <Link
          href="/brain"
          className="flex-shrink-0 ml-4 bg-liquen text-blanco text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-musgo transition-colors">
          Abrir Brain →
        </Link>
      </div>

      {/* Agents */}
      <div className="mb-10">
        <h2 className="text-xs font-medium text-niebla tracking-widest uppercase mb-4">
          Agentes disponibles
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {agents.map((a) => (
            <Link
              key={a.slug}
              href={`/brain?agent=${a.slug}`}
              className={`border rounded-lg p-4 hover:shadow-sm transition-all ${a.color}`}>
              <p className="text-sm font-medium">{a.label}</p>
              <p className="text-xs mt-1 opacity-70">{a.description}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Project summary */}
      <div>
        <h2 className="text-xs font-medium text-niebla tracking-widest uppercase mb-4">
          Proyectos activos
        </h2>
        <div className="border border-suelo rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 bg-lino">
            <div>
              <p className="font-medium text-ink">Ceibo Vidal</p>
              <p className="text-xs text-niebla mt-0.5">Buenos Aires · PB + 4 pisos + terraza</p>
            </div>
            <span className="text-2xs font-medium tracking-wider uppercase px-2.5 py-1 rounded-full bg-arena/20 text-tierra border border-arena/30">
              Diseño
            </span>
          </div>
          <div className="px-6 py-4 border-t border-suelo grid grid-cols-3 gap-4">
            {[
              { label: 'Pisos', value: 'PB + 4 + terraza' },
              { label: 'Balcones', value: '4 niveles al frente' },
              { label: 'Garage', value: 'Contra medianera' },
            ].map((d) => (
              <div key={d.label}>
                <p className="text-2xs text-niebla uppercase tracking-wider">{d.label}</p>
                <p className="text-sm text-ink mt-0.5">{d.value}</p>
              </div>
            ))}
          </div>
          <div className="px-6 py-3 border-t border-suelo flex justify-end">
            <Link
              href="/decisiones"
              className="text-xs text-musgo hover:text-liquen transition-colors">
              Ver decisiones →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
