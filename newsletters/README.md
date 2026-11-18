# Newsletters

HTML autónomo, pensado para clientes de correo: tablas, CSS inline, sin JavaScript. No usa Next.js.

```text
newsletters/
├── README.md
├── shared/
│   └── assets/fonts/        # M PLUS U Light y Montserrat Medium (OFL), para componer imágenes
└── ceibo-vidal/lanzamiento/
    ├── index.html           # fuente: es lo que se copia a la plataforma de envío
    ├── preview.html         # derivado, solo para ver en el navegador
    ├── plain-text.txt
    ├── build-assets.cjs     # genera hero, aérea e íconos
    └── assets/              # todo lo que hay que publicar
```

## Ceibo Vidal — lanzamiento

`index.html` carga las imágenes desde `{{public_url}}`, así que no se ven al abrirlo directo. Para revisarlo, abrir `preview.html`, que es el mismo HTML apuntando a `assets/`. Después de editar `index.html`, regenerarlo:

```bash
cd newsletters/ceibo-vidal/lanzamiento
sed 's#{{public_url}}#assets#g' index.html > preview.html
```

Antes de enviar, reemplazar `{{public_url}}`, `{{unsubscribe_url}}` y `{{legal_address}}`.

### Dirección de arte

La idea que une la pieza es el lenguaje del plano sobre la fotografía: el nombre escrito en el cielo, una línea de referencia que señala el edificio, íconos de trazo fino y barras de dos etiquetas.

- **Hero.** La fachada con el logo de Ceibo en Lino y la línea «VIDAL 3849 · SAAVEDRA» integrados en el cielo, bajo la etiqueta «Nuevo desarrollo». El render se extiende hacia arriba y se funde hacia abajo en Carbón, así el titular HTML continúa la imagen. Se recortan 100 px de asfalto al pie; la arquitectura no se toca.
- **Titular.** M PLUS U Light a 54 px (40 px en mobile) sobre Carbón, con «aire libre» en verde.
- **Atributos.** Franja Musgo `#4A5A3C` con seis íconos de la misma familia y separadores finos.
- **Espacios.** Sobre Carbón, una imagen ancha de las unidades y debajo SUM y terraza a la par, cada una con una etiqueta de dos líneas. La misma composición sirve en desktop y mobile, sin apilar.
- **Saavedra.** La aérea a sangre, con «SAAVEDRA» en el cielo y Ceibo Vidal señalado con etiqueta y línea de referencia. El pie se funde en Carbón hacia los llamados a la acción.
- **Cierre.** Dos barras a todo el ancho: sitio (Carbón) y WhatsApp (Musgo).
- **Footer.** Carbón, con los dos logos, los cinco canales oficiales y el texto legal al mínimo.

La pieza es mayormente oscura a propósito: los logos e íconos claros siguen leyéndose cuando Gmail u Outlook invierten colores en dark mode.

Tipografías: M PLUS U y Montserrat se cargan con `@font-face` solo donde el cliente lo permite (Apple Mail, iOS Mail). En Gmail y Outlook se ven los fallbacks: Helvetica Neue, Helvetica, Arial.

### Recursos

Todo `lanzamiento/assets/` (19 archivos, ~920 KB) va a `{{public_url}}`. Ninguno tiene URL pública todavía.

| Pieza | Archivo |
| --- | --- |
| Hero: fachada + logo Ceibo + ubicación, 1200×1700 JPG, ~330 KB | `imagen_fachada_perfil_v1_hero.jpg` |
| Aérea: Saavedra + referencia a Ceibo Vidal, 1200×1396 JPG, ~275 KB | `imagen_aerea_dia_v1_saavedra.jpg` |
| Espacios: unidades 1008×504, SUM y terraza 492×492 JPG, ~125 KB en total | `espacio_unidades.jpg`, `espacio_sum.jpg`, `espacio_terraza.jpg` |
| Íconos de atributos (Lino, 144 px) | `icon_ambientes.png`, `icon_balcon.png`, `icon_terraza.png`, `icon_sum.png`, `icon_cocheras.png`, `icon_entrega.png` |
| Íconos de las barras de acción (Lino, 96 px) | `icon_flecha.png`, `icon_whatsapp.png` |
| Íconos de contacto (Caliza, 120 px) | `contacto_whatsapp.png`, `contacto_telefono.png`, `contacto_email.png`, `contacto_instagram.png`, `contacto_web.png` |
| Logo Raíces Caliza, 888×258 PNG | `raices_logo_texto_caliza.png` |

El logo G&D blanco ya es público: https://www.raices.dev/assets/partners/gyd-wordmark-white.png

Las dos imágenes y los íconos se generan con `node newsletters/ceibo-vidal/lanzamiento/build-assets.cjs` a partir de los originales de `knowledge/projects/ceibo-vidal/commercial/assets/` (`imagen_fachada_perfil_v1.jpg`, `ceibo_logo_lino.png` y, de `renders/v1/`, `imagen_aerea_dia_v1.jpg`, `imagen_2amb_v1.jpg`, `imagen_sum_v1.jpg`, `imagen_terraza_noche_v1.jpg`), que no se modifican. Los textos dentro de las imágenes («VIDAL 3849 · SAAVEDRA», «SAAVEDRA», «CEIBO VIDAL») están repetidos en el HTML y en los `alt`.

Canales usados: WhatsApp y teléfono +54 9 11 3699-4200, raicesdevelopers@gmail.com (ambos de la web), Instagram `@raices.dev` (de la carpeta de venta) y www.raices.dev.

### Qué falta antes de enviar

1. Subir los 19 archivos de `lanzamiento/assets/` a un HTTPS público y poner esa base en `{{public_url}}`.
2. Completar `{{unsubscribe_url}}` (es el `href` del enlace «Desuscribirme») y `{{legal_address}}` en la plataforma.
3. Probar en clientes reales: Gmail web, Android e iOS, Outlook de escritorio y Apple Mail, en modo claro y oscuro. La vista en navegador no reemplaza esa prueba.
