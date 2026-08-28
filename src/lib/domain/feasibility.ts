// Todas las fórmulas financieras de factibilidad.
// Módulo puro: sin side-effects, sin imports de UI, testeable en aislamiento.

export interface FeasibilityInputs {
  // Terreno
  landPrice: number;
  purchaseCosts: number; // escribanía, comisión compra, impuestos adquisición
  landArea: number; // m² del terreno
  buildableArea: number; // m² construibles totales
  sellableArea: number; // m² vendibles (menor o igual a construibles)

  // Construcción
  constructionCostPerSqm: number; // $/m²
  constructionSqm: number; // m² sobre los que aplica ese costo
  additionalConstructionCosts: number;
  professionalFees: number;
  developerFees: number;
  adminAndLegalCosts: number;
  commercializationCosts: number;
  taxes: number;
  contingencyPct: number; // porcentaje, ej: 5 para 5%

  // Ventas
  salePricePerSqm: number; // $/m² de venta
  otherIncome: number;
  saleCommissionPct: number; // porcentaje, ej: 3 para 3%
}

export interface FeasibilityResults {
  // Costos
  landCost: number;
  totalAcquisitionCost: number;
  directConstructionCost: number;
  contingency: number;
  indirectCosts: number;
  totalProjectCost: number;

  // Ingresos
  grossIncome: number;
  saleCommission: number;
  netIncome: number;

  // Rentabilidad
  grossProfit: number;
  netProfit: number;
  marginOnSalesPct: number;
  returnOnCostPct: number;
  roi: number;

  // Indicadores por m²
  costPerSellableSqm: number;
  landIncidencePerSellableSqm: number;
  minSalePriceToBreakEven: number;

  // Punto de equilibrio
  breakEvenSqm: number;
  breakEvenPct: number;

  // Diagnóstico de precio máximo del terreno
  maxLandPriceForMinReturn: number;
}

export interface ScenarioAdjustment {
  salePriceMultiplier: number;
  constructionCostMultiplier: number;
  contingencyPct: number;
}

export const SCENARIOS: Record<string, ScenarioAdjustment> = {
  conservador: {
    salePriceMultiplier: 0.9,
    constructionCostMultiplier: 1.1,
    contingencyPct: 10,
  },
  base: {
    salePriceMultiplier: 1.0,
    constructionCostMultiplier: 1.0,
    contingencyPct: 5,
  },
  optimista: {
    salePriceMultiplier: 1.1,
    constructionCostMultiplier: 0.95,
    contingencyPct: 3,
  },
};

// Rentabilidad mínima aceptable para calcular precio máximo del terreno
const MIN_RETURN_ON_COST = 0.15; // 15%

export function calculateFeasibility(inputs: FeasibilityInputs): FeasibilityResults {
  const {
    landPrice,
    purchaseCosts,
    constructionCostPerSqm,
    constructionSqm,
    additionalConstructionCosts,
    professionalFees,
    developerFees,
    adminAndLegalCosts,
    commercializationCosts,
    taxes,
    contingencyPct,
    salePricePerSqm,
    otherIncome,
    saleCommissionPct,
    sellableArea,
  } = inputs;

  // Costos de adquisición
  const landCost = landPrice;
  const totalAcquisitionCost = landPrice + purchaseCosts;

  // Costo directo de construcción
  const directConstructionCost =
    constructionCostPerSqm * constructionSqm + additionalConstructionCosts;

  // Costos indirectos (sin contingencia)
  const indirectCostsBase =
    professionalFees + developerFees + adminAndLegalCosts + commercializationCosts + taxes;

  // Contingencia sobre construcción + indirectos
  const contingencyBase = directConstructionCost + indirectCostsBase;
  const contingency = contingencyBase * (contingencyPct / 100);

  const indirectCosts = indirectCostsBase + contingency;

  // Costo total
  const totalProjectCost = totalAcquisitionCost + directConstructionCost + indirectCosts;

  // Ingresos
  const grossIncome = salePricePerSqm * sellableArea + otherIncome;
  const saleCommission = grossIncome * (saleCommissionPct / 100);
  const netIncome = grossIncome - saleCommission;

  // Ganancia
  const grossProfit = grossIncome - totalProjectCost;
  const netProfit = netIncome - totalProjectCost;

  // Rentabilidad
  const marginOnSalesPct = netIncome > 0 ? (netProfit / netIncome) * 100 : 0;
  const returnOnCostPct = totalProjectCost > 0 ? (netProfit / totalProjectCost) * 100 : 0;
  const roi = totalProjectCost > 0 ? (netProfit / totalProjectCost) * 100 : 0;

  // Indicadores por m² vendible
  const costPerSellableSqm = sellableArea > 0 ? totalProjectCost / sellableArea : 0;
  const landIncidencePerSellableSqm = sellableArea > 0 ? totalAcquisitionCost / sellableArea : 0;

  // Precio mínimo de venta para cubrir costos
  const minSalePriceToBreakEven =
    sellableArea > 0 ? totalProjectCost / (sellableArea * (1 - saleCommissionPct / 100)) : 0;

  // Punto de equilibrio en m²
  // Ingreso neto por m² = salePricePerSqm * (1 - commissionPct/100)
  const netPricePerSqm = salePricePerSqm * (1 - saleCommissionPct / 100);
  const breakEvenSqm = netPricePerSqm > 0 ? totalProjectCost / netPricePerSqm : sellableArea;
  const breakEvenPct = sellableArea > 0 ? (breakEvenSqm / sellableArea) * 100 : 100;

  // Precio máximo del terreno para rentabilidad mínima (15%)
  // totalProjectCost * (1 + MIN_RETURN) <= netIncome
  // totalAcquisitionCost = netIncome / (1 + MIN_RETURN) - (directCost + indirectCosts_sin_terreno)
  const constructionAndIndirect = directConstructionCost + indirectCosts + contingency; // approximation: recalculate without land
  const maxLandPriceForMinReturn = Math.max(
    0,
    netIncome / (1 + MIN_RETURN_ON_COST) - constructionAndIndirect - purchaseCosts,
  );

  return {
    landCost,
    totalAcquisitionCost,
    directConstructionCost,
    contingency,
    indirectCosts,
    totalProjectCost,
    grossIncome,
    saleCommission,
    netIncome,
    grossProfit,
    netProfit,
    marginOnSalesPct,
    returnOnCostPct,
    roi,
    costPerSellableSqm,
    landIncidencePerSellableSqm,
    minSalePriceToBreakEven,
    breakEvenSqm,
    breakEvenPct,
    maxLandPriceForMinReturn,
  };
}

export function calculateScenario(
  inputs: FeasibilityInputs,
  adjustment: ScenarioAdjustment,
): FeasibilityResults {
  const adjusted: FeasibilityInputs = {
    ...inputs,
    salePricePerSqm: inputs.salePricePerSqm * adjustment.salePriceMultiplier,
    constructionCostPerSqm: inputs.constructionCostPerSqm * adjustment.constructionCostMultiplier,
    contingencyPct: adjustment.contingencyPct,
  };
  return calculateFeasibility(adjusted);
}

export function validateInputs(inputs: Partial<FeasibilityInputs>): string[] {
  const errors: string[] = [];

  if (!inputs.buildableArea || inputs.buildableArea <= 0)
    errors.push('Metros construibles deben ser mayores a 0.');
  if (!inputs.sellableArea || inputs.sellableArea <= 0)
    errors.push('Metros vendibles deben ser mayores a 0.');
  if (
    inputs.sellableArea &&
    inputs.buildableArea &&
    inputs.sellableArea > inputs.buildableArea * 1.05
  ) {
    errors.push('Metros vendibles no pueden superar los construibles (margen 5%).');
  }
  if (!inputs.salePricePerSqm || inputs.salePricePerSqm <= 0)
    errors.push('Precio de venta por m² debe ser mayor a 0.');
  if (!inputs.constructionCostPerSqm || inputs.constructionCostPerSqm <= 0)
    errors.push('Costo de construcción por m² debe ser mayor a 0.');
  if (inputs.landPrice !== undefined && inputs.landPrice < 0)
    errors.push('Precio del terreno no puede ser negativo.');
  if (
    inputs.contingencyPct !== undefined &&
    (inputs.contingencyPct < 0 || inputs.contingencyPct > 100)
  ) {
    errors.push('La contingencia debe estar entre 0 y 100%.');
  }
  if (
    inputs.saleCommissionPct !== undefined &&
    (inputs.saleCommissionPct < 0 || inputs.saleCommissionPct > 100)
  ) {
    errors.push('La comisión de venta debe estar entre 0 y 100%.');
  }

  return errors;
}
