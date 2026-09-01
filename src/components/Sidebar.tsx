'use client';

import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import type { ReactNode } from 'react';

type NavItem = { href: string; label: string; icon: ReactNode };

const primary: NavItem[] = [
  {
    href: '/',
    label: 'Inicio',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l9-8 9 8M5 10v10h14V10" />
      </svg>
    ),
  },
  {
    href: '/projects',
    label: 'Proyectos',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 21V8l9-5 9 5v13M9 21v-8h6v8" />
      </svg>
    ),
  },
  {
    href: '/documentos',
    label: 'Documentos',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 3h7l5 5v13a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z" />
      </svg>
    ),
  },
  {
    href: '/facturas',
    label: 'Facturas',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="w-5 h-5">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8 7h8M8 11h8M8 15h4M6 3h12a2 2 0 012 2v16l-3-1.5L14 21l-3-1.5L8 21l-3-1.5L3 21V5a2 2 0 012-2z"
        />
      </svg>
    ),
  },
  {
    href: '/brain',
    label: 'Brain',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="w-5 h-5">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        />
      </svg>
    ),
  },
];

const secondary: NavItem[] = [
  {
    href: '/factibilidad',
    label: 'Factibilidad',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="w-5 h-5">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4 19V5m4 14V9m4 10V7m4 12V11m4 8V5"
        />
      </svg>
    ),
  },
  {
    href: '/tareas',
    label: 'Tareas',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01" />
      </svg>
    ),
  },
  {
    href: '/decisiones',
    label: 'Decisiones',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7 4h10a2 2 0 012 2v14l-7-3-7 3V6a2 2 0 012-2z" />
      </svg>
    ),
  },
  {
    href: '/terrenos',
    label: 'Terrenos',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s7-5.5 7-11a7 7 0 10-14 0c0 5.5 7 11 7 11z" />
      </svg>
    ),
  },
  {
    href: '/administracion',
    label: 'Administración',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h10" />
      </svg>
    ),
  },
  {
    href: '/admin',
    label: 'Config',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="w-5 h-5">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.7 1.7 0 00.34 1.86l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.7 1.7 0 00-1.86-.34 1.7 1.7 0 00-1 1.56V21a2 2 0 01-4 0v-.09a1.7 1.7 0 00-1-1.56 1.7 1.7 0 00-1.86.34l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.7 1.7 0 00.34-1.86 1.7 1.7 0 00-1.56-1H3a2 2 0 010-4h.09a1.7 1.7 0 001.56-1 1.7 1.7 0 00-.34-1.86l-.06-.06a2 2 0 012.83-2.83l.06.06a1.7 1.7 0 001.86.34H9a1.7 1.7 0 001-1.56V3a2 2 0 014 0v.09a1.7 1.7 0 001 1.56 1.7 1.7 0 001.86-.34l.06-.06a2 2 0 012.83 2.83l-.06.06a1.7 1.7 0 00-.34 1.86V9c.26.63.98 1.09 1.7 1.09H21a2 2 0 010 4h-.09a1.7 1.7 0 00-1.51.91z"
        />
      </svg>
    ),
  },
];

function NavLink({ item, collapsed, pathname }: { item: NavItem; collapsed: boolean; pathname: string }) {
  const active =
    item.href === '/'
      ? pathname === '/'
      : pathname === item.href || pathname.startsWith(item.href + '/');

  return (
    <div className="relative group">
      <Link
        href={item.href}
        className={`flex items-center rounded-sm transition-colors ${collapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2'} ${
          active ? 'bg-white/10 text-blanco' : 'text-blanco/55 hover:text-blanco hover:bg-white/5'
        }`}>
        {item.icon}
        {!collapsed && <span className="text-sm">{item.label}</span>}
      </Link>
      {collapsed && (
        <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2 z-50 opacity-0 group-hover:opacity-100">
          <div className="bg-ink text-blanco text-xs px-2.5 py-1.5 rounded-sm whitespace-nowrap border border-white/10">
            {item.label}
          </div>
        </div>
      )}
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('sidebar-collapsed') === 'true') setCollapsed(true);
  }, []);

  function toggle() {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('sidebar-collapsed', String(next));
      return next;
    });
  }

  const initials = (session?.user?.name ?? session?.user?.email ?? '?')
    .split(' ')
    .map((w: string) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <aside
      className={`flex-shrink-0 bg-ink flex flex-col h-full transition-all duration-200 ${collapsed ? 'w-16' : 'w-56'}`}>
      <div
        className={`flex items-center h-16 border-b border-white/10 ${collapsed ? 'justify-center' : 'px-4 justify-between'}`}>
        {collapsed ? (
          <button
            onClick={toggle}
            title="Expandir menú"
            className="w-8 h-8 rounded-sm bg-musgo flex items-center justify-center hover:bg-liquen transition">
            <span className="text-blanco text-sm font-medium">R</span>
          </button>
        ) : (
          <>
            <div>
              <p className="text-blanco text-sm font-medium tracking-wide">Raíces</p>
              <p className="text-blanco/45 text-2xs tracking-[0.18em] uppercase mt-0.5">Brain</p>
            </div>
            <button
              onClick={toggle}
              title="Colapsar menú"
              className="w-7 h-7 rounded-sm flex items-center justify-center text-blanco/45 hover:text-blanco hover:bg-white/10">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </>
        )}
      </div>

      <nav className={`flex-1 py-3 overflow-y-auto ${collapsed ? 'px-2' : 'px-2.5'}`}>
        {primary.map((item) => (
          <NavLink key={item.href} item={item} collapsed={collapsed} pathname={pathname} />
        ))}
        {!collapsed && (
          <p className="text-2xs tracking-[0.18em] uppercase text-blanco/30 px-3 mt-5 mb-2">Más</p>
        )}
        {collapsed && <div className="my-2 border-t border-white/10" />}
        {secondary.map((item) => (
          <NavLink key={item.href} item={item} collapsed={collapsed} pathname={pathname} />
        ))}
      </nav>

      <div className={`border-t border-white/10 py-3 ${collapsed ? 'px-2' : 'px-3'}`}>
        {collapsed ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
              <span className="text-blanco text-xs">{initials}</span>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              title="Cerrar sesión"
              className="flex justify-center p-2 w-full rounded-sm text-blanco/45 hover:text-ceibo hover:bg-white/10">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="w-4 h-4">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </button>
          </div>
        ) : (
          <>
            {session?.user && (
              <div className="flex items-center gap-3 mb-3 px-1">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-blanco text-xs">{initials}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-blanco text-xs font-medium truncate">
                    {session.user.name ?? session.user.email?.split('@')[0]}
                  </p>
                  <p className="text-blanco/40 text-2xs truncate">{session.user.email}</p>
                </div>
              </div>
            )}
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="flex items-center gap-2.5 w-full px-3 py-2 rounded-sm text-blanco/45 hover:text-ceibo hover:bg-white/5 text-sm">
              Cerrar sesión
            </button>
          </>
        )}
      </div>
    </aside>
  );
}
