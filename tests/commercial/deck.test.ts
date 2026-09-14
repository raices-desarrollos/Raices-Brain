import { pickCarpetaHtml, pickCarpetaPdfs } from '@/lib/commercial/deck';
import { describe, expect, it } from 'vitest';

describe('pickCarpetaPdfs', () => {
  const files = [
    'SGA-VDL-BROCHURE-2026.08.31.pdf',
    'Ceibo-Vidal-carpeta-de-venta-completa.pdf',
    'Ceibo-Vidal-carpeta-de-venta.pdf',
  ];

  it('no elige la versión completa como PDF de clientes', () => {
    expect(pickCarpetaPdfs(files)).toEqual({
      commercial: 'Ceibo-Vidal-carpeta-de-venta.pdf',
      complete: 'Ceibo-Vidal-carpeta-de-venta-completa.pdf',
    });
  });
});

describe('pickCarpetaHtml', () => {
  it('prioriza carpeta-de-venta.html y ignora inversores', () => {
    expect(
      pickCarpetaHtml(['carpeta-inversores.html', 'carpeta-de-venta.html', 'notas.html']),
    ).toBe('carpeta-de-venta.html');
  });

  it('acepta un rename que siga diciendo carpeta de venta', () => {
    expect(pickCarpetaHtml(['carpeta-de-venta-clientes.html'])).toBe(
      'carpeta-de-venta-clientes.html',
    );
  });
});
