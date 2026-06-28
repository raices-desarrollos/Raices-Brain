// Test: Agente comercial
// Verifica el comportamiento del agente de comunicación y marketing

import { describe, expect, it } from 'vitest';

// TODO: Implementar tests reales cuando el agente esté implementado

describe('Agente Comercial', () => {
  it('debería generar copy en el tono de voz de Raíces', async () => {
    // TODO:
    // const response = await runRag(
    //   'Generá un copy de Instagram para el lanzamiento de Ceibo Vidal',
    //   { agentSlug: 'comercial' }
    // )
    // const copy = response.answer.toLowerCase()
    // Verificar que no usa palabras prohibidas
    // expect(copy).not.toContain('exclusivo')
    // expect(copy).not.toContain('premium')
    // Verificar que menciona los balcones (argumento principal)
    // expect(copy).toContain('balcón')

    expect(true).toBe(true); // Placeholder
  });

  it('no debería usar superlativos vacíos', async () => {
    // TODO: Verificar que el agente evita "exclusivo", "de primer nivel", etc.

    expect(true).toBe(true); // Placeholder
  });

  it('debería incluir datos concretos cuando están disponibles', async () => {
    // TODO: Verificar que el agente usa los datos del knowledge base

    expect(true).toBe(true); // Placeholder
  });

  it('debería pedir datos faltantes antes de generar copy final', async () => {
    // TODO: Verificar que el agente no inventa precios o fechas

    expect(true).toBe(true); // Placeholder
  });
});
