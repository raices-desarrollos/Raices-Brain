import { SessionProvider } from '@/components/SessionProvider';
import { AppShell } from '@/components/AppShell';
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Raíces Brain',
  description: 'Sistema operativo interno de Raíces Desarrollos',
  applicationName: 'Raíces Brain',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '48x48' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.svg',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1A1A18',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="flex h-screen overflow-hidden bg-blanco">
        <SessionProvider>
          <AppShell>{children}</AppShell>
        </SessionProvider>
      </body>
    </html>
  );
}
