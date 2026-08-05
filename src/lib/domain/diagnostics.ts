// Reglas de diagnóstico centralizadas — modificar aquí sin tocar UI.
import type { FeasibilityResults } from './feasibility';

export type DiagnosisLevel = 'atractivo' | 'factible' | 'riesgoso' | 'no-rentable' | 'insuficiente';

export interface Diagnosis {
  level: DiagnosisLevel;
  label: string;
  color: string; // Tailwind class
  mainStrength: string;
  mainRisk: string;
}

const THRESHOLDS = {
  attractiveRoi: 25, // ROI >= 25% → atractivo
  feasibleRoi: 12, // ROI >= 12% → factible
  riskyRoi: 0, // ROI > 0%  → riesgoso (pero rentable)
  maxBreakEvenPct: 90, // punto equilibrio > 90% m² → riesgoso
  attractiveMargin: 20, // margen sobre ventas >= 20% → atractivo
};

export function diagnose(results: FeasibilityResults): Diagnosis {
  const { roi, marginOnSalesPct, breakEvenPct, netProfit } = results;

  if (roi === 0 && marginOnSalesPct === 0) {
    return {
      level: 'insuficiente',
      label: 'Información insuficiente',
      color: 'bg-niebla/10 text-niebla border-niebla/20',
      mainStrength: 'No aplica',
      mainRisk: 'Completar todos los campos para obtener un diagnóstico.',
    };
  }

  if (netProfit <= 0) {
    return {
      level: 'no-rentable',
      label: 'No rentable',
      color: 'bg-ceibo/10 text-ceibo border-ceibo/20',
      mainStrength: 'El análisis está completo.',
      mainRisk: `El proyecto genera pérdida estimada. ROI: ${roi.toFixed(1)}%.`,
    };
  }

  if (
    roi >= THRESHOLDS.attractiveRoi &&
    marginOnSalesPct >= THRESHOLDS.attractiveMargin &&
    breakEvenPct <= 75
  ) {
    return {
      level: 'atractivo',
      label: 'Atractivo',
      color: 'bg-liquen/10 text-musgo border-liquen/20',
      mainStrength: `ROI ${roi.toFixed(1)}% y margen ${marginOnSalesPct.toFixed(1)}% sobre ventas.`,
      mainRisk:
        breakEvenPct > 60
          ? `Necesitás vender el ${breakEvenPct.toFixed(0)}% de los m² para cubrir costos.`
          : 'Baja exposición al riesgo de absorción de mercado.',
    };
  }

  if (roi >= THRESHOLDS.feasibleRoi && breakEvenPct <= THRESHOLDS.maxBreakEvenPct) {
    return {
      level: 'factible',
      label: 'Factible',
      color: 'bg-arena/10 text-tierra border-arena/20',
      mainStrength: `ROI ${roi.toFixed(1)}% dentro de parámetros aceptables.`,
      mainRisk:
        breakEvenPct > 75
          ? `Punto de equilibrio en ${breakEvenPct.toFixed(0)}% de los m² — margen de absorción ajustado.`
          : 'Verificar supuestos de costo y precio antes de comprometerse.',
    };
  }

  return {
    level: 'riesgoso',
    label: 'Riesgoso',
    color: 'bg-tierra/10 text-tierra border-tierra/20',
    mainStrength:
      roi > 0
        ? `El proyecto es positivo con ROI ${roi.toFixed(1)}%, pero con márgenes ajustados.`
        : 'El análisis está completo.',
    mainRisk:
      breakEvenPct > THRESHOLDS.maxBreakEvenPct
        ? `Punto de equilibrio en ${breakEvenPct.toFixed(0)}% de los m² — riesgo elevado.`
        : `Margen sobre ventas de ${marginOnSalesPct.toFixed(1)}% — insuficiente para absorber imprevistos.`,
  };
}
