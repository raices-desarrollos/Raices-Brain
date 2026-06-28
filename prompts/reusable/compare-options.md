# Prompt: Comparar opciones

**Uso:** Comparar dos o más opciones de forma estructurada para facilitar una decisión.

## Prompt

```
Comparamos las siguientes opciones para [describir la decisión]:

OPCIÓN A: [Describir opción A]
OPCIÓN B: [Describir opción B]
OPCIÓN C (opcional): [Describir opción C]

Generá una comparación estructurada con:
1. **Tabla comparativa:** Criterios relevantes vs. cada opción (usar ✓, ✗ o escala 1-5).
2. **Ventajas de cada opción:** Lista corta por opción.
3. **Desventajas de cada opción:** Lista corta por opción.
4. **Recomendación:** Con cuál opción avanzar y por qué (si el análisis lo permite).

Criterios a comparar: [Listar los criterios más importantes para esta decisión]

Contexto adicional: [Agregar cualquier restricción, preferencia o dato relevante]
```

## Instrucciones de uso

1. Completar los placeholders entre corchetes.
2. El output puede usarse directamente en el decision-log del proyecto.
3. Los criterios a comparar deben ser específicos para la decisión (costo, tiempo, riesgo, impacto visual, etc.).

## Notas

- Útil para decisiones de diseño, elección de proveedores, estrategia comercial.
- Para decisiones financieras complejas, complementar con el agente `finanzas`.
