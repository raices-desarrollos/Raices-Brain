'use client';

import { RouteProgress } from '@/components/RouteProgress';
import { Sidebar } from '@/components/Sidebar';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === '/login';
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  if (isLogin) {
    return <div className="flex-1 overflow-y-auto">{children}</div>;
  }

  return (
    <>
      <RouteProgress />
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      {mobileOpen && (
        <button
          type="button"
          aria-label="Cerrar menú"
          className="fixed inset-0 bg-ink/40 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="md:hidden flex items-center gap-3 h-14 px-4 border-b border-suelo bg-blanco shrink-0">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="w-9 h-9 flex items-center justify-center text-ink"
            aria-label="Abrir menú">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
              <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
          <div>
            <p className="text-sm font-medium text-ink leading-none">Raíces</p>
            <p className="text-2xs tracking-[0.16em] uppercase text-niebla mt-0.5">Brain</p>
          </div>
        </div>
        <main className="flex-1 overflow-y-auto scrollbar-thin min-w-0">{children}</main>
      </div>
    </>
  );
}
