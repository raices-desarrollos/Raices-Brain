'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export function RouteProgress() {
  const pathname = usePathname();
  const [on, setOn] = useState(false);

  useEffect(() => {
    setOn(true);
    const t = setTimeout(() => setOn(false), 450);
    return () => clearTimeout(t);
  }, [pathname]);

  return (
    <div className="fixed top-0 left-0 right-0 z-[70] h-[2px] pointer-events-none" aria-hidden>
      <div
        className={`h-full bg-musgo origin-left transition-[width,opacity] duration-500 ease-out ${
          on ? 'w-full opacity-100' : 'w-0 opacity-0'
        }`}
      />
    </div>
  );
}
