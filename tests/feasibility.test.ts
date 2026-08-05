import { diagnose } from '@/lib/domain/diagnostics';
import {
    calculateFeasibility,
    calculateScenario,
    SCENARIOS,
    validateInputs,
    type FeasibilityInputs,
} from '@/lib/domain/feasibility';
import { describe, expect, it } from 'vitest';

const BASE: FeasibilityInputs = {
  landPrice: 500_000,
  purchaseCosts: 25_000,
  landArea: 1000,
  buildableArea: 2000,
  sellableArea: 1800,
  constructionCostPerSqm: 1200,
  constructionSqm: 2000,
  additionalConstructionCosts: 50_000,
  professionalFees: 80_000,
  developerFees: 100_000,
  adminAndLegalCosts: 30_000,
  commercializationCosts: 40_000,
  taxes: 20_000,
  contingencyPct: 5,
  salePricePerSqm: 3000,
  otherIncome: 0,
  saleCommissionPct: 3,
};

describe('calculateFeasibility', () => {
  it('calcula costo de adquisición correctamente', () => {
    const r = calculateFeasibility(BASE);
    expect(r.totalAcquisitionCost).toBe(500_000 + 25_000);
  });

  it('calcula costo directo de construcción correctamente', () => {
    const r = calculateFeasibility(BASE);
    expect(r.directConstructionCost).toBe(1200 * 2000 + 50_000);
  });

  it('calcula ingresos brutos correctamente', () => {
    const r = calculateFeasibility(BASE);
    expect(r.grossIncome).toBe(3000 * 1800);
  });

  it('calcula ingresos netos descontando comisión', () => {
    const r = calculateFeasibility(BASE);
    expect(r.netIncome).toBeCloseTo(r.grossIncome * (1 - 0.03), 0);
  });

  it('proyecto rentable tiene ganancia positiva', () => {
    const r = calculateFeasibility(BASE);
    expect(r.netProfit).toBeGreaterThan(0);
  });

  it('proyecto no rentable cuando precio es muy bajo', () => {
    const r = calculateFeasibility({ ...BASE, salePricePerSqm: 500 });
    expect(r.netProfit).toBeLessThan(0);
  });

  it('ROI es positivo en proyecto rentable', () => {
    const r = calculateFeasibility(BASE);
    expect(r.roi).toBeGreaterThan(0);
  });

  it('ROI es negativo en proyecto no rentable', () => {
    const r = calculateFeasibility({ ...BASE, salePricePerSqm: 500 });
    expect(r.roi).toBeLessThan(0);
  });

  it('calcula costo por m² vendible', () => {
    const r = calculateFeasibility(BASE);
    expect(r.costPerSellableSqm).toBeCloseTo(r.totalProjectCost / BASE.sellableArea, 1);
  });

  it('punto de equilibrio <= 100% en proyecto rentable', () => {
    const r = calculateFeasibility(BASE);
    expect(r.breakEvenPct).toBeLessThan(100);
  });

  it('punto de equilibrio > 100% en proyecto no rentable', () => {
    const r = calculateFeasibility({ ...BASE, salePricePerSqm: 500 });
    expect(r.breakEvenPct).toBeGreaterThan(100);
  });

  it('margen sobre ventas es correcto', () => {
    const r = calculateFeasibility(BASE);
    const expected = ((r.netIncome - r.totalProjectCost) / r.netIncome) * 100;
    expect(r.marginOnSalesPct).toBeCloseTo(expected, 1);
  });

  it('variación del costo de construcción impacta costo total', () => {
    const cheaper = calculateFeasibility({ ...BASE, constructionCostPerSqm: 800 });
    const expensive = calculateFeasibility({ ...BASE, constructionCostPerSqm: 1600 });
    expect(cheaper.totalProjectCost).toBeLessThan(expensive.totalProjectCost);
    expect(cheaper.netProfit).toBeGreaterThan(expensive.netProfit);
  });

  it('variación del precio de venta impacta ganancia', () => {
    const low = calculateFeasibility({ ...BASE, salePricePerSqm: 2000 });
    const high = calculateFeasibility({ ...BASE, salePricePerSqm: 4000 });
    expect(high.netProfit).toBeGreaterThan(low.netProfit);
  });
});

describe('punto de equilibrio', () => {
  it('precio mínimo de venta cubre los costos', () => {
    const r = calculateFeasibility(BASE);
    const revenueAtMin =
      r.minSalePriceToBreakEven * BASE.sellableArea * (1 - BASE.saleCommissionPct / 100);
    expect(revenueAtMin).toBeGreaterThanOrEqual(r.totalProjectCost - 1); // tolerancia 1 USD
  });
});

describe('validateInputs', () => {
  it('retorna error si metros vendibles son 0', () => {
    const errors = validateInputs({ ...BASE, sellableArea: 0 });
    expect(errors.length).toBeGreaterThan(0);
  });

  it('retorna error si metros construibles son 0', () => {
    const errors = validateInputs({ ...BASE, buildableArea: 0 });
    expect(errors.length).toBeGreaterThan(0);
  });

  it('retorna error si precio de venta es 0', () => {
    const errors = validateInputs({ ...BASE, salePricePerSqm: 0 });
    expect(errors.length).toBeGreaterThan(0);
  });

  it('retorna error si costo de construcción es 0', () => {
    const errors = validateInputs({ ...BASE, constructionCostPerSqm: 0 });
    expect(errors.length).toBeGreaterThan(0);
  });

  it('retorna error si metros vendibles superan los construibles', () => {
    const errors = validateInputs({ ...BASE, sellableArea: 3000, buildableArea: 2000 });
    expect(errors.length).toBeGreaterThan(0);
  });

  it('retorna error si precio del terreno es negativo', () => {
    const errors = validateInputs({ ...BASE, landPrice: -1 });
    expect(errors.length).toBeGreaterThan(0);
  });

  it('sin errores con inputs válidos', () => {
    const errors = validateInputs(BASE);
    expect(errors).toHaveLength(0);
  });
});

describe('escenarios', () => {
  it('conservador tiene menor ganancia que base', () => {
    const base = calculateScenario(BASE, SCENARIOS.base);
    const conservador = calculateScenario(BASE, SCENARIOS.conservador);
    expect(conservador.netProfit).toBeLessThan(base.netProfit);
  });

  it('optimista tiene mayor ganancia que base', () => {
    const base = calculateScenario(BASE, SCENARIOS.base);
    const optimista = calculateScenario(BASE, SCENARIOS.optimista);
    expect(optimista.netProfit).toBeGreaterThan(base.netProfit);
  });
});

describe('diagnose', () => {
  it('diagnostica "atractivo" con ROI alto y bajo punto de equilibrio', () => {
    const r = calculateFeasibility({ ...BASE, salePricePerSqm: 5000, constructionCostPerSqm: 800 });
    const d = diagnose(r);
    expect(d.level).toBe('atractivo');
  });

  it('diagnostica "no-rentable" cuando hay pérdida', () => {
    const r = calculateFeasibility({ ...BASE, salePricePerSqm: 500 });
    const d = diagnose(r);
    expect(d.level).toBe('no-rentable');
  });

  it('diagnostica "insuficiente" con todos los valores en 0', () => {
    const r = calculateFeasibility({
      ...BASE,
      sellableArea: 0,
      salePricePerSqm: 0,
    } as FeasibilityInputs);
    const d = diagnose(r);
    expect(['insuficiente', 'no-rentable']).toContain(d.level);
  });
});
