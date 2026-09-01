'use client';

import { Sidebar } from '@/components/Sidebar';
import { usePathname } from 'next/navigation';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === '/login';

  if (isLogin) {
    return <div className="flex-1 overflow-y-auto">{children}</div>;
  }

  return (
    <>
      <Sidebar />
      <main className="flex-1 overflow-y-auto scrollbar-thin min-w-0">{children}</main>
    </>
  );
}
