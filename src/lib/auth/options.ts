import { isLockedOut, recordFailure, recordSuccess } from '@/lib/auth/throttle';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

if (!process.env.NEXTAUTH_SECRET) {
  // Sin secret, NextAuth firma los JWT con una clave derivada que cambia entre
  // deploys: las sesiones se caen sin explicación. Mejor fallar de entrada.
  throw new Error('NEXTAUTH_SECRET env var is required');
}

/**
 * Hash de una contraseña que nadie usa. Sirve para que el login tarde lo mismo
 * cuando el email no existe que cuando existe.
 */
const DUMMY_HASH = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: 'jwt', maxAge: 8 * 60 * 60 }, // 8 horas
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = credentials.email.toLowerCase().trim();
        if (isLockedOut(email)) return null;

        const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

        // Siempre comparamos contra un hash, exista el usuario o no: si
        // cortáramos antes, el tiempo de respuesta delataría qué emails están
        // registrados.
        const hash = user?.active ? user.passwordHash : DUMMY_HASH;
        const valid = await bcrypt.compare(credentials.password, hash);

        if (!user || !user.active || !valid) {
          recordFailure(email);
          return null;
        }

        recordSuccess(email);
        return { id: user.id, name: user.name, email: user.email, role: user.role };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role ?? 'socio';
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string; role?: string }).id = token.id as string;
        (session.user as { id?: string; role?: string }).role = token.role as string;
      }
      return session;
    },
  },
};
