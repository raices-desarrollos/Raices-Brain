import DriveFinancial from '@/components/DriveFinancial';
import Link from 'next/link';

const agents = [
  {
    slug: 'general',
    label: 'General',
    description: 'Preguntas generales sobre Raíces',
    color: 'bg-blue-50 text-blue-600 border-blue-200',
  },
  {
    slug: 'terrenos',
    label: 'Terrenos',
    description: 'Evaluación de terrenos y pipeline',
    color: 'bg-amber-50 text-amber-700 border-tierra/20',
  },
  {
    slug: 'proyecto',
    label: 'Proyecto',
    description: 'Estado y decisiones de proyectos',
    color: 'bg-gray-100 text-amber-700 border-amber-200',
  },
  {
    slug: 'finanzas',
    label: 'Finanzas',
    description: 'Números, costos y proyecciones',
    color: 'bg-blue-50 text-blue-600 border-musgo/20',
  },
  {
    slug: 'comercial',
    label: 'Comercial',
    description: 'Ventas, copy y estrategia comercial',
    color: 'bg-red-50 text-red-600 border-red-200',
  },
  {
    slug: 'legal',
    label: 'Legal',
    description: 'Contratos, normativa y escrituras',
    color: 'bg-niebla/10 text-gray-900 border-niebla/20',
  },
];

const stats = [
  {
    label: 'Proyectos activos',
    value: '1',
    sub: 'Ceibo Vidal · diseño',
    href: '/decisiones',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
      </svg>
    ),
    accent: 'text-blue-600 bg-blue-50',
  },
  {
    label: 'Decisiones registradas',
    value: '3',
    sub: 'Ceibo Vidal',
    href: '/decisiones',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
        <path
          fillRule="evenodd"
          d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
          clipRule="evenodd"
        />
      </svg>
    ),
    accent: 'text-amber-700 bg-gray-100',
  },
  {
    label: 'Terrenos en análisis',
    value: '0',
    sub: 'Sin pipeline activo',
    href: '/terrenos',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
        <path
          fillRule="evenodd"
          d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
          clipRule="evenodd"
        />
      </svg>
    ),
    accent: 'text-gray-500 bg-gray-100',
  },
  {
    label: 'Chunks indexados',
    value: '220+',
    sub: 'Knowledge base activa',
    href: '/admin',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
        <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
      </svg>
    ),
    accent: 'text-blue-600 bg-blue-50',
  },
];

export default function DashboardPage() {
  return (
    <div className="max-w-5xl mx-auto px-8 py-10">
      {/* Header */}
      <div className="mb-10 flex items-end justify-between">
        <div>
          <p className="text-gray-500 text-xs tracking-widest uppercase mb-2">Raíces Desarrollos</p>
          <h1 className="text-3xl font-light text-gray-900 tracking-tight">Buenos días.</h1>
          <p className="text-gray-500 text-sm mt-1.5 capitalize">
            {new Date().toLocaleDateString('es-AR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        <Link
          href="/brain"
          className="flex items-center gap-2 bg-gray-900 text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-gray-900 transition-colors">
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path
              fillRule="evenodd"
              d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
              clipRule="evenodd"
            />
          </svg>
          Abrir Brain
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 hover:shadow-sm transition-all group">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${s.accent}`}>
              {s.icon}
            </div>
            <p className="text-2xl font-semibold text-gray-900 tracking-tight">{s.value}</p>
            <p className="text-xs font-medium text-gray-900 mt-1">{s.label}</p>
            <p className="text-2xs text-gray-500 mt-0.5">{s.sub}</p>
          </Link>
        ))}
      </div>

      {/* Finanzas Google Drive */}
      <DriveFinancial />

      {/* Chat + Agentes */}
      <div className="grid grid-cols-5 gap-4 mb-10">
        <div className="col-span-2 bg-gray-900 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-blue-600">
                <path
                  fillRule="evenodd"
                  d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <p className="text-white font-semibold text-base">Brain con RAG</p>
            <p className="text-gray-500 text-xs mt-2 leading-relaxed">
              Chat con IA sobre proyectos, decisiones y finanzas — respaldado por el knowledge base.
            </p>
          </div>
          <Link
            href="/brain"
            className="mt-6 block text-center bg-blue-600 text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-blue-600 transition-colors">
            Consultar →
          </Link>
        </div>

        <div className="col-span-3">
          <h2 className="text-xs font-semibold text-gray-500 tracking-widest uppercase mb-3">
            Agentes especializados
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {agents.map((a) => (
              <Link
                key={a.slug}
                href={`/brain?agent=${a.slug}`}
                className={`border rounded-xl p-3.5 hover:shadow-sm transition-all ${a.color}`}>
                <p className="text-sm font-semibold">{a.label}</p>
                <p className="text-xs mt-0.5 opacity-70">{a.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Project summary */}
      <div>
        <h2 className="text-xs font-semibold text-gray-500 tracking-widest uppercase mb-4">
          Proyectos activos
        </h2>
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-amber-700">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Ceibo Vidal</p>
                <p className="text-xs text-gray-500 mt-0.5">Buenos Aires · PB + 4 pisos + terraza</p>
              </div>
            </div>
            <span className="text-2xs font-semibold tracking-wider uppercase px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              En diseño
            </span>
          </div>
          <div className="px-6 py-4 grid grid-cols-3 gap-6">
            {[
              { label: 'Pisos', value: 'PB + 4 + terraza' },
              { label: 'Balcones', value: '4 niveles al frente' },
              { label: 'Garage', value: 'Contra medianera' },
            ].map((d) => (
              <div key={d.label}>
                <p className="text-2xs text-gray-500 font-medium uppercase tracking-wider">
                  {d.label}
                </p>
                <p className="text-sm font-medium text-gray-900 mt-1">{d.value}</p>
              </div>
            ))}
          </div>
          <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 flex justify-end">
            <Link
              href="/decisiones"
              className="text-xs text-blue-600 font-medium hover:text-blue-500 transition-colors flex items-center gap-1">
              Ver decisiones
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
