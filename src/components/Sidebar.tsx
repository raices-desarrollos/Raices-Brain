'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const nav = [
  {
    href: '/',
    label: 'Dashboard',
    tooltip:
      'Vista general: proyectos activos, decisiones recientes y acceso rápido a todas las secciones.',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
      </svg>
    ),
  },
  {
    href: '/brain',
    label: 'Brain',
    tooltip:
      'Chat con IA. Preguntá sobre proyectos, decisiones, terrenos, finanzas o copy comercial. Elegí el agente según el tema.',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path
          fillRule="evenodd"
          d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  {
    href: '/decisiones',
    label: 'Decisiones',
    tooltip:
      'Registro de todas las decisiones tomadas por proyecto y área. Cada decisión incluye contexto, razón y estado.',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
        <path
          fillRule="evenodd"
          d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  {
    href: '/terrenos',
    label: 'Terrenos',
    tooltip:
      'Pipeline de terrenos: los que están en análisis, los que pasaron evaluación y los descartados.',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path
          fillRule="evenodd"
          d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  {
    href: '/admin',
    label: 'Admin',
    tooltip:
      'Estado de la configuración: variables de entorno, conexiones activas y scripts del sistema.',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path
          fillRule="evenodd"
          d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 flex-shrink-0 bg-ink flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-liquen flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 text-blanco">
              <path
                fillRule="evenodd"
                d="M10 2a8 8 0 100 16A8 8 0 0010 2zm0 14a6 6 0 110-12 6 6 0 010 12z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div>
            <p className="text-lino text-xs font-semibold tracking-widest uppercase leading-none">
              Raíces
            </p>
            <p className="text-niebla text-2xs tracking-widest uppercase">Brain</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {nav.map((item) => {
          const active = pathname === item.href;
          return (
            <div key={item.href} className="relative group">
              <Link
                href={item.href}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors
                  ${active ? 'bg-white/10 text-lino' : 'text-niebla hover:text-lino hover:bg-white/5'}
                `}>
                <span className={active ? 'text-liquen' : ''}>{item.icon}</span>
                {item.label}
              </Link>
              {/* Tooltip */}
              <div
                className="
                pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50
                w-52 rounded-lg bg-white border border-suelo shadow-md px-3 py-2.5
                opacity-0 group-hover:opacity-100 transition-opacity duration-150
              ">
                <p className="text-xs font-medium text-ink mb-0.5">{item.label}</p>
                <p className="text-2xs text-niebla leading-relaxed">{item.tooltip}</p>
                {/* Arrow */}
                <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-white" />
              </div>
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-white/10">
        <p className="text-niebla text-2xs">Raíces Desarrollos</p>
        <p className="text-white/20 text-2xs mt-0.5">Uso interno · {new Date().getFullYear()}</p>
      </div>
    </aside>
  );
}
