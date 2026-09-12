import { buildPriceList } from '@/lib/finance/prices';
import { describe, expect, it } from 'vitest';
import * as XLSX from 'xlsx';

function workbook(): XLSX.WorkBook {
  const rows: unknown[][] = Array.from({ length: 39 }, () => []);
  rows[15] = ['', 'Tipología', 'Cub.', 'Semi', 'Desc.', 'Total', 'SUM', 'Total+SUM'];
  rows[16] = ['', 'Depto A (Frente, 3 amb.)', 71.3, 11.07, 0, 82.37, 4, 86.37];
  rows[17] = ['', 'Depto B (CF, 1 amb.)', 33.6, 3.32, 0, 36.92, 2, 38.92];
  rows[18] = ['', 'Depto C (CF, 2 amb.)', 47.8, 6.46, 0, 54.26, 3, 57.26];
  rows[26] = ['', 'Unidad', 'Piso', 'Ubic.', 'm2', 'Preventa 1'];
  const units: Array<[string, string, string, number]> = [
    ['Depto A — P1', 'P1', 'Frente', 224_359.89],
    ['Depto B — P1', 'P1', 'CF', 97_174.68],
    ['Depto C — P1', 'P1', 'CF', 142_965.62],
    ['Depto A — P2', 'P2', 'Frente', 228_985.87],
    ['Depto B — P2', 'P2', 'CF', 99_178.28],
    ['Depto C — P2', 'P2', 'CF', 145_913.37],
    ['Depto A — P3', 'P3', 'Frente', 233_611.85],
    ['Depto B — P3', 'P3', 'CF', 101_181.88],
    ['Depto C — P3', 'P3', 'CF', 148_861.11],
    ['Depto A — P4', 'P4', 'Frente', 238_237.83],
    ['Depto B — P4', 'P4', 'CF', 103_185.48],
    ['Depto C — P4', 'P4', 'CF', 151_808.86],
  ];
  units.forEach((u, i) => {
    rows[27 + i] = ['', u[0], u[1], u[2], 0, u[3]];
  });

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), '05_Precios_Unidades');
  return wb;
}

describe('buildPriceList', () => {
  it('lee 12 unidades y las superficies de las tipologías', () => {
    const list = buildPriceList(workbook());
    expect(list.units).toHaveLength(12);
    expect(list.typologies.map((t) => t.code)).toEqual(['A', 'B', 'C']);

    const a = list.typologies.find((t) => t.code === 'A')!;
    expect(a.coveredM2).toBe(71.3);
    expect(a.totalM2).toBe(82.37);
    expect(a.totalWithSumM2).toBe(86.37);

    const first = list.units[0];
    expect(first.floor).toBe(1);
    expect(first.location).toBe('Frente');
    expect(first.price).toBe(224359.89);
    expect(first.totalM2).toBe(82.37);
    expect(first.totalWithSumM2).toBe(86.37);

    const b = list.units.find((u) => u.code === 'B' && u.floor === 1);
    expect(b?.location).toBe('Contrafrente');
    expect(b?.rooms).toBe('Monoambiente');
    expect(b?.coveredM2).toBe(33.6);
  });

  it('toma el precio de Preventa 1 (columna F)', () => {
    const list = buildPriceList(workbook());
    expect(list.minPrice).toBe(97174.68);
    expect(list.maxPrice).toBe(238237.83);
    expect(list.units.filter((u) => u.code === 'B')).toHaveLength(4);
  });
});
