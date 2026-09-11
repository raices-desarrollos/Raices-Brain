import { SessionProvider } from '@/components/SessionProvider';
import { AppShell } from '@/components/AppShell';
import type { Metadata } from 'next';
import { Fraunces, Inter } from 'next/font/google';
import './globals.css';

// Inter para la interfaz y los números; Fraunces para los títulos.
// Se sirven desde nuestro dominio, así el texto no parpadea al cargar.
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

const fraunces = Fraunces({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-serif',
  axes: ['SOFT', 'WONK', 'opsz'],
});

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
    <html lang="es" className={`${inter.variable} ${fraunces.variable}`}>
      <body className="flex h-screen overflow-hidden bg-lino">
        <SessionProvider>
          <AppShell>{children}</AppShell>
        </SessionProvider>
      </body>
    </html>
  );
}
