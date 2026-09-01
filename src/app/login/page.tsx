'use client';

import { signIn } from 'next-auth/react';
import { PageLoader } from '@/components/ui';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useRef, useState } from 'react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const configError = searchParams.get('error') === 'Configuration';
  const [email, setEmail] = useState('');
  const passwordRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState(
    configError ? 'El servidor no está configurado para iniciar sesión. Pedile a quien administra la app que revise el acceso.' : '',
  );
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await signIn('credentials', {
      email,
      password: passwordRef.current?.value ?? '',
      redirect: false,
    });
    setLoading(false);
    if (res?.ok) {
      router.push('/');
      router.refresh();
    } else if (res?.error === 'Configuration') {
      setError('El servidor no está configurado para iniciar sesión. Pedile a quien administra la app que lo revise.');
    } else {
      setError('Email o contraseña incorrectos.');
    }
  }

  return (
    <div className="min-h-screen bg-lino flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="text-ink text-xl font-serif font-light">Raíces</p>
          <p className="text-niebla text-2xs tracking-[0.2em] uppercase mt-1">Brain</p>
          <p className="text-niebla text-sm mt-3">Plataforma interna</p>
        </div>

        <div className="bg-blanco border border-suelo rounded-2xl p-8">
          <h1 className="text-ink text-lg font-medium mb-6">Iniciar sesión</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-ink font-medium mb-1.5">Email</label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 border border-suelo rounded-lg text-sm text-ink bg-blanco focus:outline-none focus:border-ink"
                placeholder="socio@raices.com"
              />
            </div>

            <div>
              <label className="block text-sm text-ink font-medium mb-1.5">Contraseña</label>
              <input
                type="password"
                required
                autoComplete="current-password"
                ref={passwordRef}
                className="w-full px-3 py-2.5 border border-suelo rounded-lg text-sm text-ink bg-blanco focus:outline-none focus:border-ink"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-ceibo text-sm border border-ceibo/20 bg-ceibo/5 rounded-lg px-3 py-2" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-ink text-blanco py-2.5 text-sm font-medium rounded-lg hover:bg-musgo transition disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Ingresando…' : 'Ingresar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-lino flex items-center justify-center">
          <PageLoader kicker="Raíces" title="Un momento" hint="Abriendo el acceso." />
        </div>
      }>
      <LoginForm />
    </Suspense>
  );
}
