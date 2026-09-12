import type { MetadataRoute } from 'next';

/** Herramienta interna: ningún buscador debería rastrearla. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', disallow: '/' }],
  };
}
