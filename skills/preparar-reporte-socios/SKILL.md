# SKILL: Preparar Reporte de Socios

**Nombre:** preparar-reporte-socios  
**Versión:** 1.0

## Descripción

Esta skill guía la preparación del reporte periódico para socios e inversores de los proyectos de Raíces Desarrollos.

## Cuándo usar esta skill

- Mensualmente o trimestralmente para cada proyecto activo.
- Cuando hay un hito importante que comunicar (inicio de obra, aprobación de planos, etc.).
- Antes de pedir una cuota o desembolso a los inversores.

## Inputs requeridos

| Input               | Descripción                          |
| ------------------- | ------------------------------------ |
| Período             | Mes o trimestre que cubre el reporte |
| Estado del proyecto | Resumen del avance                   |
| Hitos del período   | Qué se logró                         |
| Financiero          | Estado de caja, presupuesto vs. real |
| Próximos hitos      | Qué viene                            |
| Alertas             | Riesgos o retrasos a comunicar       |

## Proceso

1. Recopilar los datos del período.
2. Usar el prompt `prompts/reusable/prepare-investor-update.md`.
3. Completar y revisar con el equipo.
4. Revisar con el contador si hay datos financieros.
5. Aprobar y enviar.

## Dónde guardar el reporte

`knowledge/company/commercial/investor-materials/YYYY-MM-[proyecto]-update.md`

## Output esperado

Documento de 1-2 páginas con estado, hitos, financiero resumido y próximos pasos.

## Archivos relacionados

- `report-template.md` — Template del reporte
