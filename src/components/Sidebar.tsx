'use client';

import { displayName, initialsOf } from '@/lib/domain/people';
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

function NavLink({ item, collapsed, pathname }: { item: NavItem; collapsed: boolean; pathname: string }) {
  const active =
    item.href === '/'
      ? pathname === '/'
      : pathname === item.href || pathname.startsWith(item.href + '/');

  return (
    <div className="relative group">
      <Link
        href={item.href}
        aria-current={active ? 'page' : undefined}
        className={`flex items-center rounded-lg transition-colors ${
          collapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2'
        } ${active ? 'bg-white/10 text-blanco' : 'text-blanco/55 hover:text-blanco hover:bg-white/5'}`}>
        {item.icon}
        {!collapsed && <span className="text-sm">{item.label}</span>}
      </Link>
      {collapsed && (
        <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2 z-50 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-ink text-blanco text-xs px-2.5 py-1.5 rounded-md whitespace-nowrap border border-white/10">
            {item.label}
          </div>
        </div>
      )}
    </div>
  );
}

export function Sidebar({
  mobileOpen = false,
  onClose,
}: {
  mobileOpen?: boolean;
  onClose?: () => void;
}) {
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

  const initials = initialsOf(session?.user);
  const name = displayName(session?.user);

  const compact = collapsed && !mobileOpen;

  return (
    <aside
      className={`bg-ink flex flex-col h-full transition-all duration-200 z-50
        ${mobileOpen ? 'fixed inset-y-0 left-0 w-56 flex' : 'hidden md:flex flex-shrink-0'}
        ${!mobileOpen && (collapsed ? 'md:w-16' : 'md:w-56')}`}>
      <div
        className={`flex items-center h-16 border-b border-white/10 ${compact ? 'justify-center' : 'px-4 justify-between'}`}>
        {compact ? (
          <button
            onClick={toggle}
            title="Expandir menú"
            className="w-8 h-8 rounded-lg bg-musgo flex items-center justify-center hover:bg-liquen transition">
            <span className="text-blanco text-sm font-medium">R</span>
          </button>
        ) : (
          <>
            <div>
              <p className="text-blanco text-sm font-medium tracking-wide">Raíces</p>
              <p className="text-blanco/45 text-2xs tracking-[0.18em] uppercase mt-0.5">Brain</p>
            </div>
            <button
              onClick={mobileOpen ? onClose : toggle}
              title={mobileOpen ? 'Cerrar menú' : 'Colapsar menú'}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-blanco/45 hover:text-blanco hover:bg-white/10">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </>
        )}
      </div>

      <nav className={`flex-1 py-3 overflow-y-auto space-y-0.5 ${compact ? 'px-2' : 'px-2.5'}`}>
        {primary.map((item) => (
          <NavLink key={item.href} item={item} collapsed={compact} pathname={pathname} />
        ))}
      </nav>

      <div className={`border-t border-white/10 py-3 ${compact ? 'px-2' : 'px-3'}`}>
        {compact ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
              <span className="text-blanco text-xs">{initials}</span>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              title="Cerrar sesión"
              className="flex justify-center p-2 w-full rounded-lg text-blanco/45 hover:text-ceibo hover:bg-white/10">
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
                  <p className="text-blanco text-sm font-medium truncate">
                    {name ?? session.user.email?.split('@')[0]}
                  </p>
                  <p className="text-blanco/45 text-xs truncate">{session.user.email}</p>
                </div>
              </div>
            )}
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-blanco/45 hover:text-ceibo hover:bg-white/5 text-sm">
              Cerrar sesión
            </button>
          </>
        )}
      </div>
    </aside>
  );
}
