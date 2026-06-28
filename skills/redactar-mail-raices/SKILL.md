# SKILL: Redactar Mail Raíces

**Nombre:** redactar-mail-raices  
**Versión:** 1.0  
**Agente principal:** `agents/comercial/`

## Descripción

Esta skill genera emails en el tono de voz de Raíces Desarrollos: directos, concretos y sin lenguaje corporativo vacío.

## Cuándo usar esta skill

- Para redactar emails a inversores, compradores, arquitectos, proveedores.
- Para crear templates de email reutilizables para el equipo.
- Para revisar y ajustar emails existentes al tono de Raíces.

## Inputs requeridos

| Input           | Descripción                                                     |
| --------------- | --------------------------------------------------------------- |
| Destinatario    | Quién recibe el mail (rol, no nombre)                           |
| Propósito       | Qué objetivo tiene el email                                     |
| Datos clave     | La información principal que debe transmitir                    |
| Tono específico | ¿Más formal o más cercano? (por defecto: directo y profesional) |

## Proceso

1. Definir el propósito y los datos clave del email.
2. Usar el agente `comercial` con el contexto de la skill.
3. Revisar el output con `tone.md` y `agents/comercial/tone.md`.
4. Ajustar y enviar.

## Output esperado

Email listo para enviar o template con placeholders para completar.

## Archivos relacionados

- `tone.md` — Guía de tono específica para emails
- `examples.md` — Ejemplos de emails en el tono de Raíces
