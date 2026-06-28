// Test: Agente de finanzas
// Verifica el comportamiento del agente de análisis financiero

import { describe, expect, it } from 'vitest';

// TODO: Implementar tests reales cuando el agente esté implementado

describe('Agente Finanzas', () => {
  it('debería calcular el margen bruto correctamente con datos completos', async () => {
    // TODO:
    // const response = await runRag(
    //   'Terreno USD 200.000, 400m² vendibles a USD 2.500/m², costo de obra USD 850/m²',
    //   { agentSlug: 'finanzas' }
    // )
    // expect(response.answer).toContain('360.400') // Margen esperado
    // expect(response.answer).toContain('36%') // Porcentaje de margen

    expect(true).toBe(true); // Placeholder
  });

  it('debería mostrar los supuestos usados en el cálculo', async () => {
    // TODO: Verificar que el agente siempre menciona los supuestos

    expect(true).toBe(true); // Placeholder
  });

  it('no debería dar TIR sin un cronograma de flujos de caja', async () => {
    // TODO: Verificar que el agente es honesto sobre las limitaciones del análisis

    expect(true).toBe(true); // Placeholder
  });

  it('debería ser conservador en las estimaciones', async () => {
    // TODO: Verificar que ante incertidumbre, usa el escenario pesimista

    expect(true).toBe(true); // Placeholder
  });
});
