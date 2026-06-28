// Test: Agente de terrenos
// Verifica el comportamiento del agente de evaluación de terrenos

import { describe, expect, it } from 'vitest';

// TODO: Implementar tests reales cuando el agente esté implementado

describe('Agente Terrenos', () => {
  it('debería pedir más datos cuando la información del terreno es insuficiente', async () => {
    // TODO:
    // const response = await runRag('Vi un terreno en Villa Urquiza, ¿qué te parece?', {
    //   agentSlug: 'terrenos',
    // })
    // expect(response.answer.toLowerCase()).toContain('superficie')
    // expect(response.answer.toLowerCase()).toContain('precio')

    expect(true).toBe(true); // Placeholder
  });

  it('debería generar una evaluación estructurada con datos completos', async () => {
    // TODO:
    // const response = await runRag(
    //   'Terreno en Almagro, 200m², frente 10m, USD 180.000, zonificación R2b',
    //   { agentSlug: 'terrenos' }
    // )
    // expect(response.answer).toContain('puntaje')
    // expect(response.answer).toContain('Avanzar')

    expect(true).toBe(true); // Placeholder
  });

  it('debería aplicar la rúbrica de evaluación correctamente', async () => {
    // TODO: Verificar que el puntaje calculado sea consistente con la rúbrica

    expect(true).toBe(true); // Placeholder
  });

  it('no debería inventar datos que no se proporcionaron', async () => {
    // TODO: Verificar que el agente no fabrica datos del terreno

    expect(true).toBe(true); // Placeholder
  });
});
