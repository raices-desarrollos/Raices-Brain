import { buildSnapshot, resolveStageId, STAGES } from '@/lib/domain/stages';
import { describe, expect, it } from 'vitest';

describe('resolveStageId', () => {
  it('acepta el id de una etapa', () => {
    expect(resolveStageId('planos-municipalidad')).toBe('planos-municipalidad');
  });

  it('traduce una fase vieja a su primera etapa', () => {
    expect(resolveStageId('permits')).toBe('planos-municipalidad');
    expect(resolveStageId('design')).toBe('terreno');
  });

  it('usa el default de Ceibo Vidal si no hay nada guardado', () => {
    expect(resolveStageId(null, 'ceibo-vidal')).toBe('planos-municipalidad');
  });
});

describe('buildSnapshot', () => {
  it('marca hechas las etapas anteriores y deja el resto por delante', () => {
    const snap = buildSnapshot('planos-municipalidad');

    expect(snap.phase.id).toBe('permits');
    expect(snap.current.label).toBe('Aprobación de planos');
    expect(snap.stages.find((s) => s.id === 'proyecto-ejecutivo')?.state).toBe('done');
    expect(snap.stages.find((s) => s.id === 'planos-municipalidad')?.state).toBe('current');
    expect(snap.stages.find((s) => s.id === 'permiso-obra')?.state).toBe('upcoming');
  });

  it('no incluye una fase de venta', () => {
    expect(snapPhases()).not.toContain('Venta');
    expect(STAGES.some((s) => /venta|comercial/i.test(s.label))).toBe(false);
  });

  it('recorre Diseño, Permisos, Obra y Entrega', () => {
    expect(snapPhases()).toEqual(['Diseño', 'Permisos', 'Obra', 'Entrega']);
  });
});

function snapPhases() {
  return buildSnapshot('planos-municipalidad').phases.map((p) => p.label);
}
