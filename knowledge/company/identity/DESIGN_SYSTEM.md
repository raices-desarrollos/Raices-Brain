# Raíces Desarrolladores · Design System V2

Documento interno para sostener la identidad visual y verbal de Raíces Desarrolladores.
Cubre web, redes sociales, materiales de venta y publicidad. No es público.

---

## 1. Idea Rectora

Raíces Desarrolladores crea edificios que expanden naturaleza a través de la ciudad. La marca trabaja con la metáfora de raíces que se extienden y árboles que crecen allí donde la desarrolladora interviene.

Cada proyecto lleva el nombre de un árbol autóctono: Ceibo, Jacarandá, Ombú, entre otros.

**Propósito de la marca en una línea:**

> Naturaleza urbana con criterio: edificios con arraigo, verde integrado desde el proyecto e identidad propia.

---

## 2. Tono y Voz

Raíces habla con calma, precisión y convicción. No usa el lenguaje del mercado inmobiliario genérico.

**Usar:**

- Naturaleza urbana.
- Identidad propia.
- Verde pensado desde el proyecto.
- Edificios con arraigo.
- Desarrollo inmobiliario con criterio.
- Frases cortas, sin subordinadas innecesarias.
- Verbos activos. Afirmaciones, no promesas.

**Evitar:**

- Lujo accesible.
- Oportunidad única.
- Producto premium genérico.
- Amenities de ensueño.
- Lenguaje inmobiliario de template.
- Exclamaciones y superlativos.
- "Te esperamos", "no te lo pierdas", "ideal para vos".

**Ejemplos de tono correcto:**

- "Un edificio bajo, claro y vegetal."
- "Verde pensado como sistema, no como maceta suelta."
- "La naturaleza no es decoración. Es parte del proyecto."
- "Ceibo Vidal. Vidal 3849. PB + 4 pisos."

**Ejemplos de tono incorrecto:**

- "¡El proyecto que estabas esperando!"
- "Lujo y naturaleza al alcance de tu mano."
- "Unidades únicas con amenities de primer nivel."

---

## 3. Paleta de Color

| Token      | Nombre | Hex       | Uso principal                            |
| ---------- | ------ | --------- | ---------------------------------------- |
| `--ink`    | Tinta  | `#1A1A18` | Texto principal, fondos oscuros, footer  |
| `--lino`   | Lino   | `#F0EDE6` | Navbar, fondos cálidos claros            |
| `--blanco` | Blanco | `#F8F7F4` | Superficies limpias, secciones           |
| `--suelo`  | Suelo  | `#E8E3DA` | Bandas suaves, bloques secundarios       |
| `--tierra` | Tierra | `#856040` | Profundidad, acentos cálidos             |
| `--arena`  | Arena  | `#C4A97D` | Líneas, detalles técnicos, separadores   |
| `--liquen` | Liquen | `#7E8E5F` | Acento vegetal principal                 |
| `--musgo`  | Musgo  | `#536245` | Verde profundo, textos sobre fondo claro |
| `--ceibo`  | Ceibo  | `#B85C42` | Señal del proyecto Ceibo Vidal           |
| `--niebla` | Niebla | `#8F9089` | Texto auxiliar, captions, metadatos      |

**Pares de contraste validados:**

- Tinta sobre Lino ✓
- Tinta sobre Blanco ✓
- Tinta sobre Suelo ✓
- Blanco sobre Tinta ✓
- Tierra sobre Blanco ✓ (cuerpo de texto cálido: `#5F4632`)
- Musgo sobre Blanco ✓ (textos de acento verde)

**Para impresión:** convertir a CMYK antes de enviar a imprenta. Los valores RGB pueden variar según perfil de color del proveedor.

---

## 4. Logo

### Archivos disponibles

| Archivo                        | Fondo                            | Uso                                                      |
| ------------------------------ | -------------------------------- | -------------------------------------------------------- |
| `raices_logo_transparente.png` | Transparente                     | **Versión principal.** Web, documentos digitales, redes. |
| `raices_logo.png`              | Sólido                           | Favicon, contextos donde se necesita fondo propio.       |
| `favicon-rounded.svg`          | Transparente con clip redondeado | Solo para favicon de browser.                            |

### Uso sobre fondos claros (Lino, Blanco, Suelo)

- Usar `raices_logo_transparente.png` sin filtros.
- El logo aparece con sus colores naturales (verde oscuro y tinta).

### Uso sobre fondos oscuros (Tinta, fondos negros)

- Usar `raices_logo_transparente.png` con filtro CSS: `filter: brightness(0) invert(1)` para versión blanca.
- O solicitar versión blanca del logo al diseñador.

### Tamaños mínimos

- Digital: 28px de alto como mínimo.
- Impresión: 15mm de alto como mínimo.

### Zona de respeto

- Dejar un margen libre equivalente a la altura de la "R" en todos los lados del logo.

### No hacer

- No distorsionar proporciones.
- No aplicar sombras ni efectos.
- No colocar sobre fondos con textura sin verificar legibilidad.
- No usar versión de color sobre fondos oscuros sin ajuste.

---

## 5. Tipografía

### Fuentes

| Rol                       | Familia       | Pesos              | Fuente       |
| ------------------------- | ------------- | ------------------ | ------------ |
| Display / Títulos grandes | Noto Serif JP | 200, 300           | Google Fonts |
| Interfaz / Cuerpo         | Inter         | 300, 400, 500, 600 | Google Fonts |

### Jerarquía tipográfica

| Nivel             | Fuente        | Tamaño                   | Peso    | Color                              |
| ----------------- | ------------- | ------------------------ | ------- | ---------------------------------- |
| H1 hero           | Noto Serif JP | clamp(56px, 8vw, 120px)  | 200     | Blanco o Tinta                     |
| H2 sección        | Noto Serif JP | clamp(32px, 4.5vw, 56px) | 300     | Tinta                              |
| H3 componente     | Inter         | clamp(18px, 2vw, 24px)   | 500     | Tinta                              |
| Cuerpo            | Inter         | 16px                     | 400     | `#5F4632`                          |
| Kicker / etiqueta | Inter         | 10–11px                  | 600     | Liquen o Niebla                    |
| Caption           | Inter         | 8–8.5px                  | 500–600 | Niebla, uppercase, tracking amplio |

### Criterios

- Los títulos grandes son livianos (200–300): editoriales, no decorativos.
- Body siempre en Inter 400, nunca por debajo de 15px sobre fondos claros.
- Uppercase solo para etiquetas pequeñas, captions y navegación. Nunca en párrafos.
- Letter-spacing amplio (0.15–0.32em) en elementos uppercase pequeños.

---

## 6. Componentes Web

### Navbar

- Fondo: Lino `#F0EDE6`.
- Logo: `raices_logo_transparente.png` a 36px de altura + texto "RAÍCES / Desarrolladores".
- Links en uppercase, Inter 500, tracking amplio.
- Se compacta al hacer scroll (transición suave).

### Hero

- Imagen de fachada a pantalla completa con overlay oscuro gradiente.
- Título H1 en blanco, serif liviano.
- Dos botones: primario claro (borde blanco) y secundario WhatsApp.
- Línea de cota inferior con nombre del proyecto y dirección.

### Botones

- Primario claro: borde 1px blanco, texto blanco, sobre fondos oscuros.
- Primario oscuro: borde 1px Tinta, texto Tinta, sobre fondos claros.
- Borde-radius: 2px. Texto uppercase, Inter 500, tracking 0.12em.
- Sin relleno de fondo sólido: el estilo es de contorno (outline).

### Tarjetas (spec-card, typology-card)

- Fondo: Blanco con borde Arena fino (0.5px).
- Border-radius: 4px (ficha técnica) / 8px (tipologías y planos).
- Sombra suave: `0 8px 32px rgba(26,26,24,0.07)`.

### Líneas de cota

- Líneas finas (0.5–1px) en Arena o Niebla.
- Firma visual técnica del sistema: marcan distancias, separaciones, datos de proyecto.
- No sobrecargar: una o dos por sección como máximo.

### Footer

- Fondo: Tinta `#1A1A18`.
- Logo en versión blanca (filtro invert) a 28px de altura.
- Texto uppercase, Inter 500, 8.5px, tracking amplio, Blanco al 54%.

---

## 7. Imagen y Fotografía

La fotografía o render debe mostrar vegetación **integrada** al edificio, no plantas como decoración aislada.

**Priorizar:**

- Fachadas claras con balcones verdes.
- Terrazas verdes con agua, sombra y vegetación densa.
- Detalles de trepadoras, tensores, riego y jardineras integradas.
- Luz natural, paleta clara, textura real.
- Escala barrial: edificios bajos en contexto urbano cotidiano.

**Evitar:**

- Imágenes oscuras o excesivamente aspiracionales.
- Renders de lujo genérico (lobbies marmolados, vistas de rascacielos).
- Verde decorativo sin sistema constructivo visible.
- Filtros de alto contraste o saturación artificial.
- Personas en poses de stock.

**Paleta fotográfica:**

- Blancos cálidos, no fríos.
- Verdes naturales, no saturados digitalmente.
- Cielo claro o nublado suave. Sin cielos dramáticos de atardecer.

---

## 8. Instagram y Redes Sociales

### Formatos

| Tipo               | Dimensiones                          | Uso                          |
| ------------------ | ------------------------------------ | ---------------------------- |
| Post cuadrado      | 1080 × 1080 px                       | Feed principal               |
| Post vertical      | 1080 × 1350 px                       | Feed con más presencia       |
| Story / Reel       | 1080 × 1920 px                       | Contenido efímero, novedades |
| Cover de highlight | 1080 × 1080 px (recortado a círculo) | Archivos por tema            |

### Estructura visual de un post

1. **Imagen o fondo** — Fotografía de proyecto o fondo de color de la paleta.
2. **Zona de texto** — Máximo 2–3 líneas. Nunca tapar la imagen con texto en exceso.
3. **Logo** — Esquina inferior derecha o izquierda. Pequeño, sin competir con el mensaje.
4. **Hashtags / datos** — En el caption, nunca sobre la imagen.

### Tipos de contenido

- **Proyecto:** render o foto + nombre del edificio + dirección. Sin precio.
- **Concepto:** frase de marca sobre fondo de color + logo. Sin foto.
- **Detalle:** macro de vegetación, textura o material. Sin texto sobre imagen o mínimo.
- **Dato técnico:** tipografía sobre fondo Lino o Suelo. Datos de m², pisos, tipologías.
- **Obra en progreso:** foto real del avance + fecha + nombre del proyecto.

### Tono en caption

- Frases cortas. Un concepto por post.
- Sin emojis decorativos. Máximo uno funcional si aplica.
- Hashtags al final, en bloque separado. No dentro del texto.
- Llamada a acción simple: "Más info en el link de bio." o "Escribinos por WhatsApp."

---

## 9. Materiales de Venta

### Carpeta de proyecto (digital/PDF)

**Estructura recomendada:**

1. Tapa — Nombre del proyecto (ej. "Ceibo Vidal"), dirección, imagen de fachada.
2. La desarrolladora — Párrafo corto sobre Raíces (filosofía, trayectoria).
3. El proyecto — Descripción, barrio, conexiones, entorno.
4. Tipologías — Planos con tabla de superficies por unidad.
5. Verde edilicio — Descripción del sistema de vegetación.
6. Ficha técnica — m², pisos, anticipo, forma de pago, estado de obra.
7. Contacto — WhatsApp, email, dirección de la desarrolladora.

**Diseño:**

- Paleta: Lino como fondo principal, Tinta para texto, Arena para separadores.
- Tipografía: Noto Serif JP para títulos, Inter para cuerpo.
- Márgenes generosos. Poco texto por página. Las imágenes respiran.
- Tamaño: A4 vertical (210 × 297 mm) para impresión y pantalla.

### Lámina técnica (planos)

- Fondo blanco puro.
- Líneas en Tinta o Arena según jerarquía.
- Cotas en Inter 7–8px, uppercase.
- Logo en esquina inferior derecha, pequeño.
- Sin color de fondo en las habitaciones: el plano habla solo.

---

## 10. Publicidad

### Display digital / Banner

| Formato          | Dimensiones  |
| ---------------- | ------------ |
| Leaderboard      | 728 × 90 px  |
| Medium Rectangle | 300 × 250 px |
| Half Page        | 300 × 600 px |
| Billboard        | 970 × 250 px |

**Estructura:**

- Imagen o fondo de color de la paleta.
- Frase corta (máximo 8 palabras).
- Logo visible pero sin dominar.
- CTA simple: "Ver proyecto" o "Consultar".
- Sin precio en el banner. Llevar a la web o WhatsApp.

### Cartel de obra

- Fondo: Lino o Tinta.
- Logo en tamaño prominente.
- Nombre del proyecto (H1 serif liviano).
- Dirección.
- Sin imágenes de renders en el cartel: solo tipografía y color.
- Tamaño mínimo recomendado: 120 × 80 cm.

### Criterios generales de publicidad

- No prometer lo que no está construido. Si es render, aclararlo.
- El mensaje vende concepto (naturaleza, identidad, arraigo), no características genéricas.
- Nunca usar precio como gancho principal.
- La marca se construye con consistencia: mismo tono en todos los touchpoints.

---

## 11. Naming de Proyectos

Cada edificio se nombra con un árbol autóctono argentino seguido del nombre de la calle.

**Formato:** `[Árbol] [Calle]`
**Ejemplos:** Ceibo Vidal · Jacarandá Thames · Ombú Virrey del Pino

**Árboles en reserva (no usar hasta que haya proyecto asignado):**
Jacarandá · Ombú · Tipa · Lapacho · Algarrobo · Quebracho · Palo Borracho

El nombre del árbol va en primer lugar siempre. La calle contextualiza; el árbol identifica.

---

## 12. Archivos y Versionado

| Archivo                        | Descripción                                      |
| ------------------------------ | ------------------------------------------------ |
| `raices_logo_transparente.png` | Logo principal, fondo transparente               |
| `raices_logo.png`              | Logo con fondo (para favicon y usos específicos) |
| `favicon-rounded.svg`          | Favicon con esquinas redondeadas (solo para web) |
| `DESIGN_SYSTEM.md`             | Este documento                                   |

Cuando se genere material nuevo (carpeta, banner, post), guardar en la carpeta del proyecto correspondiente con el nombre: `[proyecto]-[tipo]-[versión].ext`
Ejemplo: `ceibo-vidal-carpeta-v2.pdf`
