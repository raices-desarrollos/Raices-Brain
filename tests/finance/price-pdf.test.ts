import { buildPriceListPdf, pdfText, priceListFileName } from '@/lib/finance/price-pdf';
import type { PriceList } from '@/lib/finance/prices';
import { describe, expect, it } from 'vitest';

const list: PriceList = {
  currency: 'USD',
  listName: 'Preventa 1',
  typologies: [
    {
      code: 'A',
      label: 'Depto A',
      location: 'Frente',
      rooms: '3 ambientes',
      coveredM2: 71.3,
      totalM2: 82.37,
      sumM2: 4,
      totalWithSumM2: 86.37,
    },
    {
      code: 'B',
      label: 'Depto B',
      location: 'Contrafrente',
      rooms: 'Monoambiente',
      coveredM2: 33.6,
      totalM2: 36.92,
      sumM2: 2,
      totalWithSumM2: 38.92,
    },
    {
      code: 'C',
      label: 'Depto C',
      location: 'Contrafrente',
      rooms: '2 ambientes',
      coveredM2: 47.8,
      totalM2: 54.26,
      sumM2: 3,
      totalWithSumM2: 57.26,
    },
  ],
  units: [
    {
      id: 'A-1',
      code: 'A',
      floor: 1,
      floorLabel: 'Piso 1',
      location: 'Frente',
      rooms: '3 ambientes',
      coveredM2: 71.3,
      totalM2: 82.37,
      totalWithSumM2: 86.37,
      price: 224_359.89,
    },
    {
      id: 'B-1',
      code: 'B',
      floor: 1,
      floorLabel: 'Piso 1',
      location: 'Contrafrente',
      rooms: 'Monoambiente',
      coveredM2: 33.6,
      totalM2: 36.92,
      totalWithSumM2: 38.92,
      price: 97_174.68,
    },
  ],
  floors: [1],
  minPrice: 97_174.68,
  maxPrice: 224_359.89,
  source: null,
  syncedAt: '2026-09-12T10:00:00.000Z',
};

describe('price list PDF', () => {
  it('arma un PDF con las unidades', async () => {
    const bytes = await buildPriceListPdf(list, {
      projectName: 'Ceibo Vidal',
      address: 'Vidal 3849',
      city: 'CABA',
    });
    const header = Buffer.from(bytes.subarray(0, 5)).toString('ascii');
    expect(header).toBe('%PDF-');
    expect(bytes.byteLength).toBeGreaterThan(1500);
  });

  it('nombra el archivo sin acentos raros', () => {
    expect(priceListFileName('Ceibo Vidal')).toBe('Ceibo-Vidal-lista-precios.pdf');
  });

  it('deja el texto en Latin-1', () => {
    expect(pdfText('Ubicación · m²')).toMatch(/Ubicacion|Ubicación/);
    expect(pdfText('m²')).toBe('m2');
  });
});
