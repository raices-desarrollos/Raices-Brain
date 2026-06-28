# Prompt: Generar ítems de acción

**Uso:** Extraer tareas y compromisos concretos de un texto, reunión o decisión.

## Prompt

```
Analizá el siguiente texto e identificá todos los ítems de acción: tareas pendientes, compromisos asumidos y próximos pasos.

Para cada ítem de acción, indicá:
- **Acción:** Qué hay que hacer (verbo en infinitivo, concreto y accionable).
- **Responsable:** Quién debe ejecutarlo (si se menciona; si no, poner "A asignar").
- **Fecha límite:** Cuándo debe estar hecho (si se menciona; si no, poner "Sin fecha").
- **Proyecto/contexto:** A qué proyecto o área pertenece.

Formato de salida: Tabla Markdown.

TEXTO:
[Pegar el texto aquí]
```

## Instrucciones de uso

1. Pegar el texto de la reunión, conversación o documento.
2. La tabla generada puede copiarse directamente al directorio `tasks/` del proyecto.
3. Asignar responsables y fechas si el modelo no los pudo inferir.

## Notas

- Ideal para procesar minutas de reunión y extraer el checklist de tareas.
- Para gestión de tareas más compleja, usar una herramienta de PM dedicada.
