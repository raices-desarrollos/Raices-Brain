import { buildVidalFinance } from '@/lib/finance/vidal';
import { describe, expect, it } from 'vitest';
import * as XLSX from 'xlsx';

/**
 * El tablero de Ceibo Vidal sale de dos planillas de Drive. Estos tests armar
 * planillas equivalentes a mano para fijar la aritmética: si alguien cambia el
 * parser y los aportes, el corte terreno/resto o el efectivo dejan de cuadrar,
 * saltan acá y no en la pantalla de los socios.
 */

// Serial de Excel dentro del rango que acepta el parser (sistema 1900).
const SERIAL = 45_900;

const MOVIMIENTOS_HEADER = [
  'Rubro',
  'Fecha',
  'Detalle',
  'Importe $',
  'Importe u$s',
  'USD Gastados',
];

type MovRow = [string, number, string, number, number, number];

function fondosWorkbook(rows: MovRow[]): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.aoa_to_sheet([['Ceibo Vidal'], ['Movimientos hasta junio 2026']]),
    'CARATULA',
  );

  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.aoa_to_sheet([MOVIMIENTOS_HEADER, ...rows]),
    'MOVIMIENTOS',
  );

  return wb;
}

/** Aportes que suman 200.000 USD, más egresos de terreno y de obra, más una venta. */
const MOVIMIENTOS: MovRow[] = [
  ['APORTE SOCIOS', SERIAL, 'APORTE DARIO', 0, 100_000, 100_000],
  ['APORTE SOCIOS', SERIAL + 1, 'APORTE FEDERICO', 96_000_000, 0, 80_000],
  ['APORTE SOCIOS', SERIAL + 2, 'APORTE PASCUAL', 0, 20_000, 20_000],
  ['TERRENO', SERIAL + 3, 'Compra del lote', 0, 0, -150_000],
  ['HONORARIOS', SERIAL + 4, 'Escribano', 0, 0, -20_000],
  ['VENTAS', SERIAL + 5, 'Venta unidad A', 0, 0, 5_000],
];

function sociosWorkbook(
  ledgers: { sheet: string; committed: number; balance: number }[],
  committedTotal: string,
): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.aoa_to_sheet([
      ['Aporte inicial total', committedTotal],
      [],
      ['SOCIO', 'SALDO'],
      ...ledgers.map((l) => [l.sheet.toUpperCase(), l.balance]),
      ['TOTAL', ledgers.reduce((acc, l) => acc + l.balance, 0)],
    ]),
    'VIDAL',
  );

  for (const ledger of ledgers) {
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.aoa_to_sheet([
        ['Concepto', 'SALDO USD'],
        ['Aporte inicial', ledger.committed],
        ['Aportes realizados', ledger.balance],
      ]),
      ledger.sheet,
    );
  }

  return wb;
}

/** Libros que cuadran: lo aportado coincide con comprometido menos saldo. */
const SOCIOS_COHERENTES = [
  { sheet: 'Dario Mintzer', committed: 350_000, balance: 250_000 },
  { sheet: 'Federico Sujarchuk', committed: 150_000, balance: 70_000 },
  { sheet: 'Pascual Galliverti', committed: 150_000, balance: 130_000 },
];

function build(socios: XLSX.WorkBook | null = sociosWorkbook(SOCIOS_COHERENTES, '650.000')) {
  return buildVidalFinance(fondosWorkbook(MOVIMIENTOS), socios, []);
}

describe('buildVidalFinance · aportes de socios', () => {
  it('suma los aportes y reparte la participación de cada socio', () => {
    const f = build();

    expect(f.contributions.total).toBe(200_000);
    expect(f.contributions.movements).toBe(3);
    expect(f.partners).toHaveLength(3);

    // Ordenados de mayor a menor aporte.
    expect(f.partners.map((p) => p.firstName)).toEqual(['Dario', 'Federico', 'Pascual']);
    expect(f.partners.map((p) => p.usd)).toEqual([100_000, 80_000, 20_000]);
    expect(f.partners.map((p) => p.share)).toEqual([0.5, 0.4, 0.1]);

    // Las participaciones tienen que cerrar en 1.
    expect(f.partners.reduce((acc, p) => acc + p.share, 0)).toBeCloseTo(1, 10);
  });

  it('separa los aportes hechos en dólares de los hechos en pesos', () => {
    const f = build();

    expect(f.contributions.usdDirect).toBe(120_000);
    expect(f.contributions.arsConverted).toBe(80_000);
    expect(f.contributions.arsNominal).toBe(96_000_000);
    // Las dos vías tienen que reconstruir el total.
    expect(f.contributions.usdDirect + f.contributions.arsConverted).toBe(f.contributions.total);
  });

  it('toma el nombre completo del socio de su hoja en CUENTA SOCIOS', () => {
    const f = build();
    expect(f.partners.map((p) => p.name)).toEqual([
      'Dario Mintzer',
      'Federico Sujarchuk',
      'Pascual Galliverti',
    ]);
  });

  it('cae al nombre del detalle cuando no hay planilla de socios', () => {
    const f = build(null);
    expect(f.partners.map((p) => p.name)).toEqual(['Dario', 'Federico', 'Pascual']);
    expect(f.capital.committed).toBeNull();
  });
});

describe('buildVidalFinance · egresos e ingresos', () => {
  it('separa el terreno del resto de los egresos', () => {
    const f = build();

    expect(f.expenses.land).toBe(150_000);
    expect(f.expenses.other).toBe(20_000);
    expect(f.expenses.total).toBe(170_000);
    // El corte tiene que ser exhaustivo: terreno + resto = total.
    expect(f.expenses.land + f.expenses.other).toBe(f.expenses.total);

    expect(f.expenses.landLines.map((l) => l.category)).toEqual(['Terreno']);
    expect(f.expenses.otherLines.map((l) => l.category)).toEqual(['Honorarios']);
  });

  it('publica los egresos en positivo aunque la planilla los traiga negativos', () => {
    const f = build();
    expect(f.expenses.lines.every((l) => l.usd > 0)).toBe(true);
  });

  it('reconoce como ingreso cualquier rubro positivo que no sea un aporte', () => {
    const f = build();
    expect(f.income.total).toBe(5_000);
    expect(f.income.lines.map((l) => l.category)).toEqual(['Ventas']);
  });

  it('deja los ingresos en cero cuando todavía no hay ventas', () => {
    const sinVentas = MOVIMIENTOS.filter((m) => m[0] !== 'VENTAS');
    const f = buildVidalFinance(fondosWorkbook(sinVentas), null, []);

    expect(f.income.total).toBe(0);
    expect(f.income.lines).toEqual([]);
  });

  it('no cuenta los aportes como ingresos', () => {
    const f = build();
    expect(f.income.lines.some((l) => /aporte/i.test(l.category))).toBe(false);
  });
});

describe('buildVidalFinance · capital y caja', () => {
  it('calcula el capital comprometido, lo pendiente y el avance', () => {
    const f = build();

    expect(f.capital.committed).toBe(650_000);
    expect(f.capital.contributed).toBe(200_000);
    expect(f.capital.pending).toBe(450_000);
    expect(f.capital.progress).toBeCloseTo(200_000 / 650_000, 10);
  });

  it('la caja es lo que entró menos lo que salió', () => {
    const f = build();
    expect(f.cash).toBe(200_000 + 5_000 - 170_000);
  });
});

describe('buildVidalFinance · controles cruzados', () => {
  it('no avisa nada cuando las dos planillas cuadran', () => {
    expect(build().warnings).toEqual([]);
  });

  it('avisa cuando la cuenta corriente de un socio no coincide con MOVIMIENTOS', () => {
    // A Federico le falta registrar 5.000 en su cuenta corriente.
    const desfasado = SOCIOS_COHERENTES.map((l) =>
      l.sheet === 'Federico Sujarchuk' ? { ...l, balance: l.balance + 5_000 } : l,
    );
    const f = build(sociosWorkbook(desfasado, '650.000'));

    expect(f.warnings).toHaveLength(1);
    expect(f.warnings[0]).toContain('Federico');
    expect(f.warnings[0]).toContain('5.000');
  });

  it('avisa si la planilla de fondos no tiene hoja MOVIMIENTOS', () => {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([['vacío']]), 'CARATULA');
    const f = buildVidalFinance(wb, null, []);

    expect(f.warnings.join(' ')).toMatch(/MOVIMIENTOS/);
    expect(f.contributions.total).toBe(0);
    expect(f.expenses.total).toBe(0);
  });
});

describe('buildVidalFinance · metadatos', () => {
  it('lee el período de la carátula y la fecha del último movimiento', () => {
    const f = build();

    expect(f.periodLabel).toBe('Movimientos hasta junio 2026');
    expect(f.lastMovementDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(f.currency).toBe('USD');
  });
});
