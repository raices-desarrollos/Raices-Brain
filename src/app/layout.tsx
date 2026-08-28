import { SessionProvider } from '@/components/SessionProvider';
import { Sidebar } from '@/components/Sidebar';
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Raíces Brain',
  description: 'Cerebro digital de Raíces Desarrollos',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="flex h-screen overflow-hidden bg-gray-50">
        <SessionProvider>
          <Sidebar />
          <main className="flex-1 overflow-y-auto scrollbar-thin">{children}</main>
        </SessionProvider>
      </body>
    </html>
  );
}
