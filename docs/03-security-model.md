# Modelo de Seguridad

Define qué información es sensible, cómo se protege y quién puede acceder a qué.

## Clasificación de información

| Nivel            | Descripción                          | Ejemplos                                     | Almacenamiento               |
| ---------------- | ------------------------------------ | -------------------------------------------- | ---------------------------- |
| **Público**      | Se puede compartir sin restricciones | Renders aprobados, descripción de proyectos  | Este repo                    |
| **Interno**      | Solo para el equipo Raíces           | Decisiones, briefings, estrategia            | Este repo (privado)          |
| **Confidencial** | Restringido a roles específicos      | Finanzas detalladas, términos de contratos   | Este repo + redacción en RAG |
| **Secreto**      | Nunca en texto plano en repo         | Escrituras, datos de compradores, claves API | Fuera del repo / vault       |

## Reglas de seguridad

1. **Nunca commitear** claves API, tokens, contraseñas ni credenciales.
2. **Nunca commitear** datos personales de compradores o inversores.
3. **Nunca commitear** escrituras o documentos notariales originales.
4. Los archivos `.env` están en `.gitignore`. Solo commitear `.env.example`.
5. Las carpetas `knowledge/*/legal/` contienen solo **referencias** a documentos, no los documentos originales.

## Permisos de agentes

| Agente    | Puede leer                                | No puede leer                     |
| --------- | ----------------------------------------- | --------------------------------- |
| General   | Identidad, estrategia, proyectos públicos | Finanzas detalladas, legales      |
| Proyecto  | Todo lo del proyecto                      | Datos de compradores individuales |
| Finanzas  | Finanzas propias del proyecto             | Finanzas de otros proyectos       |
| Legal     | Resúmenes legales                         | Escrituras originales             |
| Comercial | Todo lo comercial y de renders            | Finanzas internas                 |

## Implementación

- `src/lib/security/permissions.ts` — control de acceso por rol
- `src/lib/security/redaction.ts` — redacción automática de campos sensibles antes de indexar
- `src/lib/security/audit.ts` — log de auditoría de consultas a agentes
