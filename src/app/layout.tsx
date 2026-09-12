import { SessionProvider } from '@/components/SessionProvider';
import { AppShell } from '@/components/AppShell';
import type { Metadata, Viewport } from 'next';
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
  // El template deja que cada pantalla ponga su propio título sin repetir la marca.
  title: { default: 'Raíces Brain', template: '%s · Raíces Brain' },
  description: 'Sistema operativo interno de Raíces Desarrollos',
  applicationName: 'Raíces Brain',
  // Es una herramienta interna: no queremos que la indexe ningún buscador.
  robots: { index: false, follow: false, nocache: true },
  formatDetection: { telephone: false, email: false, address: false },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '48x48' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.svg',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#21201E',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${inter.variable} ${fraunces.variable}`} suppressHydrationWarning>
      <body className="flex h-screen overflow-hidden bg-lino" suppressHydrationWarning>
        <SessionProvider>
          <AppShell>{children}</AppShell>
        </SessionProvider>
      </body>
    </html>
  );
}
