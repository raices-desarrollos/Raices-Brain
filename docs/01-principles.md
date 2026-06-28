# Principios de Raíces Brain

Estos principios rigen cómo se estructura, mantiene y utiliza el conocimiento en este repositorio.

## 1. Conocimiento primero, código después

Antes de escribir una línea de código, el conocimiento debe estar documentado. Los agentes son tan buenos como la calidad de lo que ingieren.

## 2. Una fuente de verdad

Cada dato vive en un único lugar. No hay duplicación. Si algo cambia, se actualiza en su fuente original y el sistema lo propaga.

## 3. Todo tiene contexto

Cada documento, decisión o archivo debe tener suficiente contexto para ser comprendido sin necesidad de consultar a quien lo creó.

## 4. Trazabilidad total

Toda decisión tiene fecha, autor, alternativas consideradas y razón de elección. El log de decisiones es sagrado.

## 5. Separación de capas

| Capa         | Contenido                               |
| ------------ | --------------------------------------- |
| `knowledge/` | Conocimiento humano en lenguaje natural |
| `agents/`    | Comportamiento de los agentes IA        |
| `prompts/`   | Instrucciones para generación           |
| `data/`      | Datos estructurados y schemas           |
| `src/`       | Código de la aplicación                 |

## 6. Seguridad por defecto

Información sensible (datos de compradores, escrituras, contratos) nunca se commitea en texto plano. Ver `docs/03-security-model.md`.

## 7. Iteración continua

Este repositorio es un organismo vivo. Cada reunión, cada decisión, cada render aprobado enriquece el cerebro.
