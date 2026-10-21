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

Valores vigentes, tomados de la carpeta de venta de Ceibo Vidal.

| Token      | Nombre | Hex       | Uso principal                                              |
| ---------- | ------ | --------- | ---------------------------------------------------------- |
| `--ink`    | Tinta  | `#21201E` | Texto principal, fondos oscuros (páginas, guarda, portada) |
| `--lino`   | Lino   | `#F0EDE6` | Navbar, fondos cálidos claros, base de planos sobre oscuro |
| `--blanco` | Blanco | `#F8F7F4` | Superficies limpias, texto sobre fondo oscuro              |
| `--suelo`  | Suelo  | `#E8E3DA` | Bandas suaves, páginas de precios y mercado                |
| `--tierra` | Tierra | `#5F4632` | Texto de lectura (cuerpo cálido), cifras secundarias       |
| `--arena`  | Arena  | `#C4A97D` | Trazo firma, kickers sobre oscuro, detalles técnicos       |
| `--liquen` | Liquen | `#7E8E5F` | Acento vegetal principal                                   |
| `--musgo`  | Musgo  | `#536245` | Verde profundo, totales y destacados sobre fondo claro     |
| `--ceibo`  | Ceibo  | `#B85C42` | Señal del proyecto Ceibo Vidal                             |
| `--niebla` | Niebla | `#6E6F68` | Texto auxiliar, captions, metadatos, pies de página        |

**Líneas y divisores:**

| Uso                         | Valor                      |
| --------------------------- | -------------------------- |
| Línea sobre fondo claro     | `rgba(133, 96, 64, 0.22)`  |
| Línea sobre fondo oscuro    | `rgba(248, 247, 244, 0.14)`|
| Grosor                      | 0.75px                     |
| Radio de esquina (bloques)  | 8px                        |

`#856040` (el Tierra anterior) ya no es un token: aparece solo como base de las líneas.

**Pares de contraste validados:**

- Tinta sobre Lino ✓
- Tinta sobre Blanco ✓
- Tinta sobre Suelo ✓
- Blanco sobre Tinta ✓
- Tierra sobre Blanco ✓ (texto de lectura)
- Tierra sobre Suelo ✓ (texto de lectura en páginas de precios y mercado)
- Musgo sobre Blanco ✓ (textos de acento verde)
- Niebla sobre Blanco y Suelo ✓ (metadatos y pies)

**Para impresión:** convertir a CMYK antes de enviar a imprenta. Los valores RGB pueden variar según perfil de color del proveedor.

---

## 4. Logo

El logo vigente es una marca lineal en negro sobre fondo transparente: ilustración (edificio y raíces) más wordmark `RAÍCES` / `DEVELOPERS`. Los archivos canónicos viven en `knowledge/company/identity/logo/`.

### Archivos disponibles

| Archivo                   | Contenido                         | Uso                                                                 |
| ------------------------- | --------------------------------- | ------------------------------------------------------------------- |
| `raices_logo_completo.png` | Ilustración + wordmark           | **Versión principal.** Portadas, firma de marca, piezas institucionales. |
| `raices_logo_texto.png`   | Solo wordmark                    | Encabezados, carpeta de venta, pie de materiales.                  |
| `raices_logo_icono.png`   | Solo ilustración                 | Marca reducida, cuando el wordmark no entra.                       |

### Uso sobre fondos claros (Lino, Blanco, Suelo)

- Usar el archivo sin filtros. El trazo es negro.

### Uso sobre fondos oscuros (Tinta, fondos negros)

- Usar el mismo archivo con filtro CSS: `filter: brightness(0) invert(1)` para versión blanca.

### Tamaños mínimos

- Digital: 28px de alto como mínimo.
- Impresión: 15mm de alto como mínimo.

### Zona de respeto

- Dejar un margen libre equivalente a la altura de la "R" en todos los lados del logo.

### No hacer

- No distorsionar proporciones.
- No aplicar sombras ni efectos.
- No colocar sobre fondos con textura sin verificar legibilidad.
- No recolorear el trazo. Sobre fondo oscuro, solo la versión blanca.

---

## 5. Tipografía

### Fuentes

El sistema usa dos familias, ambas de Google Fonts. No sumar una tercera.

| Rol                          | Familia    | Pesos usados  |
| ---------------------------- | ---------- | ------------- |
| Display: títulos y métricas  | M PLUS U   | 300, 400, 500 |
| Cuerpo, labels y nombre      | Montserrat | 400, 500, 600 |

El logo Raíces Developers está compuesto en Montserrat Medium.

### Jerarquía tipográfica

Medidas de la carpeta de venta (página A4 de 794 px de ancho). Para web, escalar con `clamp()` manteniendo las proporciones.

| Nivel                | Fuente     | Tamaño     | Peso | Detalle                                         | Color            |
| -------------------- | ---------- | ---------- | ---- | ----------------------------------------------- | ---------------- |
| Nombre del proyecto  | Montserrat | 48px       | 500  | Mayúscula, tracking 0.1em, interlineado 1       | Blanco           |
| Título de página     | M PLUS U   | 34–38px    | 400  | Tracking 0.02em, interlineado 1.08              | Tinta o Blanco   |
| Subtítulo / bloque   | M PLUS U   | 22–28px    | 400  | Tracking -0.03em                                | Tinta o Blanco   |
| Métrica destacada    | M PLUS U   | 38–56px    | 400  | Tracking -0.045em a -0.05em                     | Tinta o Musgo    |
| Cuerpo               | Montserrat | 14.5px     | 400  | Interlineado 1.62                               | Tierra           |
| Kicker               | Montserrat | 11px       | 500  | Mayúscula, tracking 0.08em                      | Arena            |
| Label / metadato     | Montserrat | 9–10.5px   | 500  | Mayúscula, tracking 0.08em a 0.10em             | Niebla           |
| Identificador de pág.| Montserrat | 12px       | 500  | Mayúscula, tracking 0.1em                       | Tinta o Blanco   |
| Pie de página        | Montserrat | 9.5px      | 500  | Mayúscula, tracking 0.1em                       | Niebla           |
| Nota / legal         | Montserrat | 11px       | 400  | Interlineado 1.55                               | Niebla           |

### Criterios

- Display para títulos y métricas. Cuerpo para lectura funcional.
- Los títulos son de peso regular, nunca en negrita: editoriales, no decorativos.
- Uppercase solo para labels, kickers, pies y el nombre del proyecto. Nunca en párrafos.
- Tracking de labels entre 0.08em y 0.12em. No usar 0.16em o más.
- Escribir siempre m². No usar m2.

---

## 6. Componentes Web

Especificación de componentes para el sitio. Usan los mismos colores y tipografías del sistema.

### Navbar

- Fondo: Lino `#F0EDE6`.
- Logo: `raices_logo_texto.png` a 36px de altura. El wordmark ya incluye DEVELOPERS.
- Links en uppercase, Montserrat 500, tracking 0.1em.
- Se compacta al hacer scroll (transición suave).

### Hero

- Imagen de fachada a pantalla completa con overlay oscuro gradiente.
- Título H1 en blanco, M PLUS U regular.
- Dos botones: primario claro (borde blanco) y secundario WhatsApp.
- Línea de cota inferior con nombre del proyecto y dirección.

### Botones

- Primario claro: borde 1px blanco, texto blanco, sobre fondos oscuros.
- Primario oscuro: borde 1px Tinta, texto Tinta, sobre fondos claros.
- Borde-radius: 2px. Texto uppercase, Montserrat 500, tracking 0.1em.
- Sin relleno de fondo sólido: el estilo es de contorno (outline).

### Tarjetas (spec-card, typology-card)

- Fondo: Blanco con borde fino de 0.75px (línea sobre fondo claro).
- Border-radius: 8px.
- Sin sombra en la carpeta. En web, si hace falta, una sola muy suave: `0 8px 32px rgba(33,32,30,0.07)`.

### Líneas de cota

- Líneas finas (0.5–1px) en Arena o Niebla.
- Firma visual técnica del sistema: marcan distancias, separaciones, datos de proyecto.
- No sobrecargar: una o dos por sección como máximo.

### Footer

- Fondo: Tinta `#21201E`.
- Logo en versión blanca (filtro invert) a 28px de altura.
- Texto uppercase, Montserrat 500, 9.5px, tracking 0.1em, Blanco al 42–54%.

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

### Carpeta de venta (digital/PDF)

La referencia es la carpeta de Ceibo Vidal: `knowledge/projects/ceibo-vidal/commercial/carpeta-de-venta.html`. Las demás carpetas siguen la misma estructura y reglas.

**Formato**

- A4 vertical: 794 × 1123 px (210 × 297 mm). Las plantas van en A4 apaisado: 1123 × 794 px.
- Márgenes laterales de 52 px. Encabezado de 52 px. Pie de 44 px.
- Un solo archivo HTML genera las dos ediciones y los PDFs.

**Estructura de páginas**

| Orden | Página                 | Fondo                   |
| ----- | ---------------------- | ----------------------- |
| —     | Guarda de marca        | Tinta                   |
| —     | Portada                | Tinta, con render       |
| 01    | El proyecto            | Blanco                  |
| 02    | Ubicación              | Tinta                   |
| 03    | Unidades y amenities   | Suelo                   |
| 04    | Planta baja (apaisada) | Tinta                   |
| 05    | Planta tipo (apaisada) | Tinta                   |
| 06    | Terrazas (apaisada)    | Tinta                   |
| 07    | Corte                  | Tinta                   |
| 08–10 | Una página por unidad  | Lino                    |
| 11    | Lista de precios *     | Suelo                   |
| 12    | El mercado *           | Suelo                   |
| Final | Contacto               | Tinta, con render       |

\* Solo en la edición completa.

**Ediciones**

- **Comercial** (para clientes): sin lista de precios ni mercado.
- **Completa** (interna): incluye ambas páginas. Se abre con `?edicion=completa`.
- La numeración "01 / NN" se recalcula sola según la edición. La guarda y la portada no se numeran.

**Guarda de marca**

- Primera hoja del PDF. Fondo Tinta `#21201E`, logo completo en blanco a 410 px de alto, centrado un poco por encima del centro geométrico.
- Una sola línea al pie: Montserrat 500, 9px, mayúscula, tracking 0.1em, Blanco al 50%. Dice "Carpeta de venta · [Proyecto]".
- Sin encabezado, pie ni numeración. La misma hoja sirve de portada para otras carpetas (por ejemplo, "Carpeta inversores · Ceibo Vidal"): solo cambia la línea.

**Portada**

- Render de fachada a página completa, con degradado oscuro arriba y abajo.
- Wordmark blanco de 32 px arriba a la izquierda y "Carpeta de venta" a la derecha.
- Nombre del proyecto en Montserrat 500, 48px, mayúscula, tracking 0.1em, con el trazo arena debajo.
- Datos clave (dirección, unidades, ambientes, entrega) y logos de los socios al pie.

**Encabezado y pie de página**

- Encabezado: wordmark `raices_logo_texto.png` a 30 px de alto, a la izquierda, y el nombre del proyecto a la derecha (Montserrat 500, 12px, mayúscula).
- Sobre fondo oscuro, el wordmark va en blanco (`filter: brightness(0) invert(1)`).
- Pie: nombre de la sección a la izquierda y número a la derecha, en Niebla. Línea de 0.75px encima.

**Diseño**

- Los fondos alternan Tinta, Blanco, Suelo y Lino para dar ritmo. Lino es el fondo base de la página. Un protagonista por página.
- Poco texto por página. Los renders y planos respiran.
- Tipografía y colores: secciones 3 y 5. Reglas finas en "Editorial rules".

### Generación de PDFs

- Se exportan desde `carpeta-de-venta.html` con Chrome headless (`--print-to-pdf`, sin encabezado ni pie del navegador).
- Edición comercial: el HTML tal cual. Edición completa: el HTML con `?edicion=completa`.
- Nombres: `Ceibo-Vidal-carpeta-de-venta.pdf` y `Ceibo-Vidal-carpeta-de-venta-completa.pdf`.
- Después de cambiar el HTML, los PDFs se regeneran: no se editan a mano.

### Lámina técnica (planos)

- Los planos se presentan sobre Lino, dentro de un bloque con radio de 8px, en páginas apaisadas de fondo Tinta.
- Líneas en Tinta o Arena según jerarquía.
- Cotas y leyendas en Montserrat 500, uppercase.
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
- Nombre del proyecto (H1 en M PLUS U regular).
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

| Archivo                         | Descripción                                                |
| ------------------------------- | ---------------------------------------------------------- |
| `logo/raices_logo_completo.png` | Logo principal: ilustración + wordmark, fondo transparente |
| `logo/raices_logo_texto.png`    | Wordmark, fondo transparente                               |
| `logo/raices_logo_icono.png`    | Ilustración sola, fondo transparente                       |
| `DESIGN_SYSTEM.md`              | Este documento                                             |

Material de cada proyecto, en `knowledge/projects/[proyecto]/commercial/`:

| Archivo                                          | Descripción                                    |
| ------------------------------------------------ | ---------------------------------------------- |
| `carpeta-de-venta.html`                          | Fuente de la carpeta. Genera las dos ediciones |
| `[Proyecto]-carpeta-de-venta.pdf`                | Edición comercial, para clientes               |
| `[Proyecto]-carpeta-de-venta-completa.pdf`       | Edición completa, interna                      |
| `[Proyecto]-portada-[destino].png` / `.pdf`      | Portada suelta (ej. `portada-inversores`)      |
| `assets/`                                        | Imágenes, planos, logos y renders de la carpeta |

Los logos que usa la carpeta viven en `assets/` como copia de `logo/`. Si cambia el logo, actualizar ambas ubicaciones y regenerar los PDFs.

Material nuevo (banner, post, cartel): guardar en la carpeta del proyecto con el nombre `[Proyecto]-[tipo]-[destino].ext`. Las versiones congeladas se marcan con sufijo, por ejemplo `-V4`.

---

## Editorial rules

Reglas finas de la carpeta de venta. Complementan las secciones 3, 5 y 9.

El sistema usa dos familias: M PLUS U para títulos y métricas, Montserrat para lectura, labels, metadatos y el nombre del proyecto.

El logo Raíces Developers está compuesto en Montserrat Medium. En el wordmark, la A de RAÍCES no lleva barra: es un ajuste del logo, no otra familia.

- Display para títulos y métricas. Body para lectura funcional.
- Labels en mayúscula con tracking de 0.08em a 0.12em. No usar 0.16em–0.18em.
- El nombre "CEIBO VIDAL" (portada y encabezado) va en Montserrat Medium, mayúscula, tracking 0.1em.
- Evitar más de dos familias.
- Escribir siempre m². No usar m2.
- El trazo arena es la firma visual de Ceibo Vidal: 28 × 2 px, color `--arena`, 12 px bajo el título. No repetirlo en cada bloque.
- En planos apaisados el trazo puede subir a 10 px para no competir con el plano.
- Precio en Medium (500). Anticipo y cuota en Regular (400), mismo tono, tamaño apenas menor.
- Jerarquía limpia: un protagonista por página. Amenities, disponibles y forma de pago quedan por debajo de las tipologías.
- Evitar saturación de cards, sombras, bordes pesados e iconografía de interfaz.
