/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['pg', 'pdf-parse', 'pdfjs-dist'],

  // No anunciar qué framework corre atrás.
  poweredByHeader: false,

  // Los source maps de producción exponen el código del servidor a cualquiera
  // que abra las devtools.
  productionBrowserSourceMaps: false,

  eslint: {
    dirs: ['src'],
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // SAMEORIGIN y no DENY: la app muestra la carpeta de venta en un
          // iframe propio. Sigue bloqueado que nos embeba otro sitio.
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Content-Security-Policy', value: "frame-ancestors 'self'" },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          // Obliga a HTTPS por dos años, incluidos los subdominios.
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
