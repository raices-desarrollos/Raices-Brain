import { withAuth } from 'next-auth/middleware';

export default withAuth({
  pages: { signIn: '/login' },
});

export const config = {
  /**
   * Todo pide sesión salvo el login, los internos de NextAuth, los assets de
   * Next y los archivos que los navegadores y crawlers piden sin sesión
   * (íconos, robots.txt): si esos redirigen al login, el navegador los
   * interpreta como recursos roto.
   */
  matcher: [
    '/((?!login|api/auth|_next/static|_next/image|favicon\\.ico|icon\\.svg|apple-icon\\.svg|robots\\.txt|sitemap\\.xml|manifest\\.webmanifest).*)',
  ],
};
