// Genera los recursos gráficos del newsletter a partir de los renders y logos originales.
// Uso (desde la raíz del repo): node newsletters/ceibo-vidal/lanzamiento/build-assets.cjs
// No modifica los originales de knowledge/. Escribe en lanzamiento/assets/
// (o en la carpeta indicada en la variable de entorno NL_OUT, para probar sin pisar nada).

const path = require('path');
const sharp = require('sharp');

const ROOT = path.resolve(__dirname, '../../..');
const SRC = path.join(ROOT, 'knowledge/projects/ceibo-vidal/commercial/assets');
const OUT = process.env.NL_OUT ? path.resolve(process.env.NL_OUT) : path.join(__dirname, 'assets');
const FONTS = path.join(ROOT, 'newsletters/shared/assets/fonts');

const CARBON = '#101210';
const LINO = '#F0EDE6';
const CALIZA = '#D1C7BA';
const W = 1200;

// Degradé vertical de Carbón con caída suave. y0/y1 en px; alpha de a0 a a1.
function fade(id, y0, y1, a0, a1) {
  const ease = [0, 0.25, 0.5, 0.75, 1].map((t) => {
    const k = t * t * (3 - 2 * t);
    return `<stop offset="${t}" stop-color="${CARBON}" stop-opacity="${(a0 + (a1 - a0) * k).toFixed(3)}"/>`;
  });
  return {
    def: `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="0" y1="${y0}" x2="0" y2="${y1}">${ease.join('')}</linearGradient>`,
    rect: `<rect x="0" y="${y0}" width="${W}" height="${y1 - y0}" fill="url(#${id})"/>`,
  };
}

// Texto compuesto con las fuentes de shared/assets/fonts.
// Los nombres de familia son los que declaran esos TTF («… Thin Light», «… Thin Medium»).
async function text(markup, font, fontfile) {
  const img = sharp({ text: { text: markup, font, fontfile, rgba: true, dpi: 72 } }).png();
  const buf = await sharp(await img.toBuffer()).trim().png().toBuffer();
  const meta = await sharp(buf).metadata();
  return { buf, width: meta.width, height: meta.height };
}

// ── Hero: fachada con el logo de Ceibo y la ubicación integrados en el cielo ──
async function hero() {
  const EXT = 240; // franja Carbón por encima del render
  const ZOOM = 1.12; // acercamiento moderado: el edificio gana protagonismo sin perder entorno ni planta baja
  const CROP = 1560;
  const H = EXT + CROP;
  const render = await sharp(path.join(SRC, 'imagen_fachada_perfil_v1.jpg'))
    .resize({ width: Math.round(W * ZOOM) })
    .extract({ left: 30, top: 190, width: W, height: CROP })
    .toBuffer();
  const top = fade('t', EXT, EXT + 450, 1, 0); // cubre el cielo recortado y deja VIDAL sobre negro
  const bottom = fade('b', H - 230, H, 0, 1);
  const overlay = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><defs>${top.def}${bottom.def}</defs>${top.rect}${bottom.rect}</svg>`
  );
  const logoW = 540;
  const logo = await sharp(path.join(SRC, 'ceibo_logo_lino.png')).resize({ width: logoW }).toBuffer();
  const place = await text(
    `<span foreground="${LINO}" letter_spacing="${Math.round(0.14 * 38 * 1024)}">VIDAL 3849</span>`,
    'Montserrat Thin Medium 38',
    path.join(FONTS, 'Montserrat-Medium.ttf')
  );
  await sharp({ create: { width: W, height: H, channels: 3, background: CARBON } })
    .composite([
      { input: render, left: 0, top: EXT },
      { input: overlay, left: 0, top: 0 },
      { input: logo, left: Math.round((W - logoW) / 2), top: 58 },
      { input: place.buf, left: Math.round((W - place.width) / 2), top: 314 },
    ])
    .jpeg({ quality: 80, mozjpeg: true })
    .toFile(path.join(OUT, 'imagen_fachada_perfil_v1_hero.jpg'));
}

// ── Aérea: Ceibo Vidal señalado con una línea de referencia ──
async function aerea() {
  const base = await sharp(path.join(SRC, 'renders/v1/imagen_aerea_dia_v1.jpg')).resize({ width: W }).toBuffer();
  const H = (await sharp(base).metadata()).height;
  const top = fade('t', 0, 560, 0.66, 0);
  const bottom = fade('b', H - 170, H, 0, 0.9); // funde el pie con la barra Carbón que sigue

  const logoW = 158; // 10 % menos que 176
  const logo = await sharp(path.join(SRC, 'ceibo_logo_lino.png')).resize({ width: logoW }).toBuffer();
  const logoH = (await sharp(logo).metadata()).height;

  // Punto sobre la terraza del edificio (coordenadas en la imagen de 1200 px de ancho).
  const px = 470;
  const py = 968;
  const tagW = logoW + 36;
  const tagH = logoH + 26;
  const tagX = px - Math.round(tagW / 2);
  const tagY = 648;
  const marks = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><defs>${top.def}${bottom.def}</defs>${top.rect}${bottom.rect}
      <line x1="${px}" y1="${tagY + tagH}" x2="${px}" y2="${py - 12}" stroke="${CARBON}" stroke-opacity="0.35" stroke-width="5"/>
      <line x1="${px}" y1="${tagY + tagH}" x2="${px}" y2="${py - 12}" stroke="${LINO}" stroke-width="2"/>
      <circle cx="${px}" cy="${py}" r="12" fill="${CARBON}" fill-opacity="0.35" stroke="${LINO}" stroke-width="2.5"/>
      <circle cx="${px}" cy="${py}" r="3.5" fill="${LINO}"/>
      <rect x="${tagX}" y="${tagY}" width="${tagW}" height="${tagH}" rx="20" ry="20" fill="${CARBON}"/>
    </svg>`
  );
  await sharp(base)
    .composite([
      { input: marks, left: 0, top: 0 },
      // Centrado horizontal. Un leve ajuste hacia abajo compensa la hoja sobre la palabra.
      { input: logo, left: tagX + Math.round((tagW - logoW) / 2), top: tagY + Math.round((tagH - logoH) / 2) - 4 },
    ])
    .jpeg({ quality: 80, mozjpeg: true })
    .toFile(path.join(OUT, 'imagen_aerea_dia_v1_saavedra.jpg'));
}

// ── Espacios: unidades, SUM y terraza, recortados de los renders v1 ──────────
async function espacios() {
  const R = path.join(SRC, 'renders/v1');
  const crops = [
    // [salida, origen, recorte sobre el original, tamaño final]
    // 2 ambientes: imagen completa (8000×3000), sin recorte
    ['espacio_unidades.jpg', 'imagen_2amb_v1.jpg', { left: 0, top: 0, width: 8000, height: 3000 }, [1008, 378]],
    // SUM con personas (3970×4900): cuadrado, sesgado hacia el piso
    ['espacio_sum.jpg', '../imagen_sum_v1_personas.jpg', { left: 0, top: 900, width: 3970, height: 3970 }, [492, 492]],
    ['espacio_terraza.jpg', 'imagen_terraza_noche_v1.jpg', { left: 0, top: 1500, width: 4000, height: 4000 }, [492, 492]],
  ];
  for (const [out, src, box, [w, h]] of crops) {
    await sharp(path.join(R, src), { limitInputPixels: false })
      .extract(box)
      .resize(w, h)
      .jpeg({ quality: 80, mozjpeg: true })
      .toFile(path.join(OUT, out));
  }
}

// ── Logos institucionales de la franja superior (originales de knowledge/) ──
async function logos() {
  await sharp(path.join(SRC, 'raices_logo_completo_caliza.png'))
    .extract({ left: 31, top: 30, width: 728, height: 796 })
    .resize({ width: 156 })
    .png({ compressionLevel: 9 })
    .toFile(path.join(OUT, 'header_raices_logo.png'));
  await sharp(path.join(SRC, 'partners/gyd-wordmark-white.png'))
    .extract({ left: 4, top: 4, width: 1408, height: 693 })
    .resize({ width: 192 })
    .png({ compressionLevel: 9 })
    .toFile(path.join(OUT, 'header_gyd_logo.png'));
}

// ── Íconos: una sola familia de trazo fino ───────────────────────────────────
const stroke = (color, body, sw = 1.4) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><g fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${body}</g></svg>`;

const WA =
  'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z';

const ring = '<circle cx="24" cy="24" r="22.6" stroke-width="1.1"/>';
const glyph = (body) => `<g transform="translate(13.8 13.8) scale(0.85)" stroke-width="1.6">${body}</g>`;

const ICONS = {
  // Atributos del edificio (Lino, sobre Musgo)
  icon_ambientes: [144, stroke(LINO, '<rect x="8" y="9" width="32" height="30"/><path d="M24 9V25"/><path d="M8 25H27M33 25H40"/><path d="M33 25V31A6 6 0 0 1 27 25"/>')],
  icon_balcon: [144, stroke(LINO, '<path d="M14 26V7H34V26M24 7V26"/><path d="M7 26H41"/><path d="M8 26V36M12 26V36M16 26V36M20 26V36M24 26V36M28 26V36M32 26V36M36 26V36M40 26V36"/><path d="M4 36H44V40H4Z"/>')],
  icon_terraza: [144, stroke(LINO, '<circle cx="34" cy="13" r="4.5"/><path d="M34 4.5V6M34 20V21.5M25.5 13H27M41 13H42.5M28 7L29 8M39 18L40 19M40 7L39 8M29 18L28 19"/><path d="M8 33H24L33 23"/><path d="M11 33V40M22 33V40"/><path d="M5 40H43"/>')],
  icon_terraza_privada: [144, stroke(LINO, '<path d="M6 18H30L40 10"/><path d="M10 18V30M18 18V30M26 18V30M34 14V30"/><path d="M4 30H44"/><path d="M14 34H34"/><path d="M20 34V40M28 34V40"/><path d="M16 40H32"/>')],
  icon_sum: [144, stroke(LINO, '<path d="M5 13H43"/><path d="M9 13V39M39 13V39"/><path d="M5 39H43"/><path d="M16 28H32M19 28V39M29 28V39"/><path d="M24 13V18"/><path d="M20.5 21.5A3.5 3.5 0 0 1 27.5 21.5Z"/>')],
  icon_cocheras: [144, stroke(LINO, '<path d="M13 23L15.6 16.2A2.5 2.5 0 0 1 17.9 14.6H30.1A2.5 2.5 0 0 1 32.4 16.2L35 23"/><rect x="8" y="23" width="32" height="10" rx="2.5"/><path d="M11.5 33V36.5H16V33M32 33V36.5H36.5V33"/><circle cx="13.5" cy="28" r="1.6"/><circle cx="34.5" cy="28" r="1.6"/><path d="M19.5 28H28.5"/>')],
  icon_entrega: [144, stroke(LINO, '<circle cx="14" cy="24" r="7"/><circle cx="14" cy="24" r="1.6"/><path d="M21 24H42M35.5 24V30M40.5 24V28.5"/>')],
  // Llamados a la acción (Lino, sobre Carbón y Musgo)
  icon_flecha: [96, stroke(LINO, '<path d="M5 24H43M31 12L43 24L31 36"/>')],
  icon_whatsapp: [96, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="${LINO}" d="${WA}"/></svg>`],
  // Canales de contacto del footer (Caliza, sobre Carbón)
  contacto_whatsapp: [120, stroke(CALIZA, `${ring}<g transform="translate(14.4 14.4) scale(0.8)" stroke="none" fill="${CALIZA}"><path d="${WA}"/></g>`)],
  contacto_telefono: [120, stroke(CALIZA, `${ring}${glyph('<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>')}`)],
  contacto_email: [120, stroke(CALIZA, `${ring}${glyph('<rect x="2.5" y="5" width="19" height="14" rx="2"/><path d="M2.5 7.5L12 13.5L21.5 7.5"/>')}`)],
  contacto_instagram: [120, stroke(CALIZA, `${ring}${glyph(`<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.4" cy="6.6" r="0.7" fill="${CALIZA}" stroke="none"/>`)}`)],
  contacto_web: [120, stroke(CALIZA, `${ring}${glyph('<circle cx="12" cy="12" r="9.5"/><ellipse cx="12" cy="12" rx="4.2" ry="9.5"/><path d="M2.5 12H21.5"/>')}`)],
};

async function icons() {
  for (const [name, [size, svg]] of Object.entries(ICONS)) {
    await sharp(Buffer.from(svg), { density: 72 * (size / 48) * 2 })
      .resize(size, size)
      .png({ compressionLevel: 9 })
      .toFile(path.join(OUT, `${name}.png`));
  }
}

(async () => {
  // NL_ONLY=hero,logos regenera solo esos recursos.
  const only = process.env.NL_ONLY ? process.env.NL_ONLY.split(',') : null;
  const run = (n) => !only || only.includes(n);
  if (run('hero')) await hero();
  if (run('logos')) await logos();
  if (run('aerea')) await aerea();
  if (run('espacios')) await espacios();
  if (run('icons')) await icons();
  console.log('Recursos generados en', path.relative(ROOT, OUT));
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
