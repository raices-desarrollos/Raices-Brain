# Prompt: Extraer decisiones

**Uso:** Identificar y extraer decisiones de un documento, reunión o conversación.

## Prompt

```
Analizá el siguiente texto e identificá todas las decisiones tomadas.

Para cada decisión, extraé:
- **Qué se decidió:** La decisión en una línea clara.
- **Contexto:** Por qué se tomó esta decisión (si está mencionado).
- **Quién:** Quién tomó la decisión o quién estaba presente (si se menciona).
- **Fecha:** Si se menciona alguna fecha.
- **Impacto o próximos pasos:** Qué acciones implica esta decisión.

Formato de salida: Una entrada por decisión, en Markdown.

TEXTO:
[Pegar el texto aquí]
```

## Instrucciones de uso

1. Pegar el texto de la reunión, conversación o documento.
2. El output puede guardarse directamente en el `decision-log/` del proyecto correspondiente.
3. Usar el template de `skills/actualizar-decision-log/decision-template.md` para el formato final.

## Notas

- Ideal para usar después de una reunión antes de redactar la minuta formal.
- También útil para procesar hilos de WhatsApp o email donde se tomaron decisiones.
