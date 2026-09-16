#!/usr/bin/env python3
"""Extract commercial floor plans from the SGA brochure.

Crops to the drawing, drops dimension strings and ticks.
Does not recolor rooms or add entrance marks.
"""
from __future__ import annotations

import re
from pathlib import Path

import fitz
import numpy as np
import math

from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage

LIQUEN = (126, 142, 95, 255)  # --liquen #7E8E5F
MUSGO = (83, 98, 69, 255)  # --musgo #536245

# Minimalist entry arrow. Angle: 0 right, 90 down, 180 left, 270 up.
ENTRY_MARKS = {
    "unidad-a-horiz.png": {"xy": (0.772, 0.428), "angle": 270, "scale": 0.058},
    "unidad-b-horiz.png": {"xy": (0.112, 0.905), "angle": 270, "scale": 0.118},
    "unidad-c-horiz.png": {"xy": (0.068, 0.472), "angle": 0, "scale": 0.072},
}

BASE = Path(__file__).resolve().parent
ARCH = BASE.parents[2] / "architecture" / "arquitectura_31082026.pdf"
DPI = 230
ZOOM = DPI / 72.0
DIM_RE = re.compile(r"^[+\-]?\d+([.,]\d+)?(m2|m²)?$", re.I)
INDEX_RE = re.compile(r"^\d{1,2}$")

JOBS = [
    {"page": 3, "name": "planta-baja-solo.png", "rotate": 90, "pad": 14},
    {"page": 4, "name": "planta-tipo-solo.png", "rotate": 90, "pad": 12},
    {"page": 6, "name": "planta-terraza-solo.png", "rotate": 90, "pad": 12},
    {"page": 8, "name": "unidad-a-horiz.png", "rotate": 0, "pad": 16},
    {"page": 9, "name": "unidad-b-horiz.png", "rotate": 0, "pad": 16},
    {"page": 10, "name": "unidad-c-horiz.png", "rotate": 0, "pad": 16},
]


def disk(r: int) -> np.ndarray:
    y, x = np.ogrid[-r : r + 1, -r : r + 1]
    return x * x + y * y <= r * r


def lum_of(rgb: np.ndarray) -> np.ndarray:
    return 0.299 * rgb[..., 0] + 0.587 * rgb[..., 1] + 0.114 * rgb[..., 2]


def keep_large(mask: np.ndarray, min_area: int) -> np.ndarray:
    labeled, n = ndimage.label(mask)
    if n == 0:
        return mask
    sizes = ndimage.sum(mask, labeled, range(1, n + 1))
    keep = np.zeros(n + 1, dtype=bool)
    keep[1:] = np.array(sizes) >= min_area
    return keep[labeled]


def floor_bbox(page: fitz.Page) -> fitz.Rect:
    rects = []
    for dr in page.get_drawings():
        fill = dr.get("fill")
        if not fill or isinstance(fill, (int, float)) or len(fill) < 3:
            continue
        r, g, b = fill[:3]
        if abs(r - g) < 0.05 and abs(g - b) < 0.05 and 0.50 <= r <= 0.90:
            rects.append(dr["rect"])
    if not rects:
        return page.rect
    return fitz.Rect(
        min(r.x0 for r in rects),
        min(r.y0 for r in rects),
        max(r.x1 for r in rects),
        max(r.y1 for r in rects),
    )


def hide_perimeter_dims(page: fitz.Page, floor: fitz.Rect) -> None:
    """Cover leftover dimension ticks sitting on the drawing perimeter."""
    outer = floor + 28
    inner = fitz.Rect(floor.x0 + 10, floor.y0 + 10, floor.x1 - 10, floor.y1 - 10)
    for dr in page.get_drawings():
        r = dr["rect"]
        if min(r.width, r.height) > 1.8:
            continue
        if max(r.width, r.height) < 6 or max(r.width, r.height) > 48:
            continue
        cx = (r.x0 + r.x1) / 2
        cy = (r.y0 + r.y1) / 2
        if floor.contains(fitz.Point(cx, cy)):
            continue
        if not r.intersects(outer) or inner.contains(r):
            continue
        page.draw_rect(r + 1.4, color=(1, 1, 1), fill=(1, 1, 1), overlay=True)


def dim_cover_boxes(page: fitz.Page, clip: fitz.Rect) -> list[tuple[int, int, int, int]]:
    boxes = []
    data = page.get_text("dict")
    for block in data["blocks"]:
        if block.get("type") != 0:
            continue
        for line in block.get("lines", []):
            text = "".join(s["text"] for s in line["spans"]).strip()
            if not text:
                continue
            compact = text.replace(" ", "")
            if not (DIM_RE.match(compact) or INDEX_RE.match(compact)):
                continue
            rects = [fitz.Rect(line["bbox"])]
            if "." in compact or "," in compact:
                try:
                    seed = fitz.Rect(line["bbox"]) + 30
                    for hit in page.search_for(text):
                        if hit.intersects(seed):
                            rects.append(hit)
                except Exception:
                    pass
            dx, dy = line.get("dir") or (1.0, 0.0)
            is_dim = bool(DIM_RE.match(compact))
            for rect in rects:
                x0 = int((rect.x0 - clip.x0) * ZOOM)
                y0 = int((rect.y0 - clip.y0) * ZOOM)
                x1 = int((rect.x1 - clip.x0) * ZOOM)
                y1 = int((rect.y1 - clip.y0) * ZOOM)
                # CAD insertion boxes sit beside the glyphs, not on them.
                if abs(dy) > abs(dx):
                    if is_dim:
                        x0 -= 8
                        x1 += 220
                        y0 -= 18
                        y1 += 22
                    else:
                        x0 -= 10
                        x1 += 28
                        y0 -= 10
                        y1 += 12
                else:
                    x0 -= 14
                    x1 += 18
                    y0 -= 28 if is_dim else 12
                    y1 += 16
                boxes.append((x0, y0, x1, y1))
    return boxes


def cover_boxes(rgb: np.ndarray, boxes: list[tuple[int, int, int, int]]) -> np.ndarray:
    out = rgb.copy()
    h, w = out.shape[:2]
    lum = lum_of(out)
    for x0, y0, x1, y1 in boxes:
        x0, y0 = max(0, x0), max(0, y0)
        x1, y1 = min(w, x1), min(h, y1)
        if x1 <= x0 or y1 <= y0:
            continue
        sx0, sy0 = max(0, x0 - 18), max(0, y0 - 18)
        sx1, sy1 = min(w, x1 + 18), min(h, y1 + 18)
        sample = out[sy0:sy1, sx0:sx1]
        slum = lum[sy0:sy1, sx0:sx1]
        bg = slum > 170
        if int(bg.sum()) < 20:
            fill = 255
        else:
            fill = np.median(sample[bg], axis=0)
        out[y0:y1, x0:x1] = fill
    return out


def building_mask(rgb: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    lum = lum_of(rgb)
    walls = lum < 138
    floor = (lum >= 150) & (lum <= 220)
    core = ndimage.binary_closing(walls | floor, structure=disk(3))
    core = keep_large(core, 1800)
    built = ndimage.binary_fill_holes(core)
    thick = ndimage.binary_opening(lum < 245, structure=disk(2))
    thick = keep_large(thick, 2500)
    thick = ndimage.binary_fill_holes(ndimage.binary_closing(thick, structure=disk(6)))
    built = keep_large(built | thick, 4000)
    return built, walls & built


def wipe_outside(rgb: np.ndarray, built: np.ndarray) -> np.ndarray:
    out = rgb.copy()
    rim = ndimage.binary_dilation(built, structure=disk(2))
    out[~rim] = 255
    lum = lum_of(out)
    edge = rim & ~ndimage.binary_erosion(built, structure=disk(4))
    thin = (lum < 90) & edge
    thin = thin & ~ndimage.binary_opening(thin, structure=disk(2))
    out[thin] = 255
    return out


def clip_outer_ticks(rgb: np.ndarray, built: np.ndarray, margin: int = 4) -> np.ndarray:
    h, w = built.shape
    ys, xs = np.where(built)
    x0, x1 = int(xs.min()), int(xs.max())
    y0, y1 = int(ys.min()), int(ys.max())
    out = rgb.copy()
    out[:, : max(x0 - margin, 0)] = 255
    out[:, min(x1 + margin + 1, w) :] = 255
    out[: max(y0 - margin, 0), :] = 255
    out[min(y1 + margin + 1, h) :, :] = 255
    return out


def erase_stray_ink(rgb: np.ndarray, walls: np.ndarray) -> np.ndarray:
    """Drop leftover dimension numbers/ticks on paper and gray floor."""
    out = rgb.copy()
    lum = lum_of(out)
    paper = (lum > 246) & ~ndimage.binary_dilation(walls, structure=disk(4))
    floor = (lum > 155) & (lum < 235) & ~walls
    ink = (lum < 120) & (paper | floor)
    labeled, n = ndimage.label(ink)
    if n == 0:
        return out
    slices = ndimage.find_objects(labeled)
    for i, slc in enumerate(slices, 1):
        if slc is None:
            continue
        sub = labeled[slc] == i
        area = int(sub.sum())
        bh = slc[0].stop - slc[0].start
        bw = slc[1].stop - slc[1].start
        thin = min(bh, bw) <= 3 and max(bh, bw) >= 14
        if area <= 380 or (thin and area < 2800):
            region = out[slc]
            if np.median(lum[slc][sub]) < 140 and np.median(lum_of(region)) < 200:
                fill = np.median(region.reshape(-1, 3), axis=0)
            else:
                fill = 255
            out[slc][sub] = fill
    return out


def tight_crop(rgb: np.ndarray, built: np.ndarray, pad: int = 18) -> np.ndarray:
    ys, xs = np.where(built)
    h, w = built.shape
    y0 = max(int(ys.min()) - pad, 0)
    y1 = min(int(ys.max()) + pad + 1, h)
    x0 = max(int(xs.min()) - pad, 0)
    x1 = min(int(xs.max()) + pad + 1, w)
    return rgb[y0:y1, x0:x1]


def _rot(pts: list[tuple[float, float]], origin: tuple[float, float], ang: float) -> list[tuple[int, int]]:
    s, c = math.sin(ang), math.cos(ang)
    ox, oy = origin
    out = []
    for x, y in pts:
        dx, dy = x - ox, y - oy
        out.append((int(round(ox + dx * c - dy * s)), int(round(oy + dx * s + dy * c))))
    return out


def draw_entry_arrow(img: Image.Image, x: float, y: float, angle_deg: float, scale: float) -> Image.Image:
    """Slim wayfinding arrow in Raíces liquen, pointing into the unit."""
    w, h = img.size
    s = max(int(scale * min(w, h)), 22)
    hi = 4
    side = int(s * 2.2 * hi)
    canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    draw = ImageDraw.Draw(canvas)
    ox = oy = side / 2
    ss = float(s * hi)

    def body(inset: float) -> list[tuple[float, float]]:
        t = 0.11 * ss + inset
        head_h = 0.34 * ss + inset
        stem_l = 0.48 * ss + inset
        tip = 0.64 * ss + inset
        neck = 0.16 * ss
        local = [
            (-stem_l, -t),
            (neck, -t),
            (neck, -head_h),
            (tip, 0.0),
            (neck, head_h),
            (neck, t),
            (-stem_l, t),
        ]
        return [(ox + px, oy + py) for px, py in local]

    ang = math.radians(angle_deg)
    draw.polygon(_rot(body(0.05 * ss), (ox, oy), ang), fill=MUSGO)
    draw.polygon(_rot(body(0.0), (ox, oy), ang), fill=LIQUEN)

    arrow = canvas.resize((side // hi, side // hi), Image.Resampling.LANCZOS)
    overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    cx, cy = int(round(x * w)), int(round(y * h))
    overlay.alpha_composite(arrow, (cx - arrow.size[0] // 2, cy - arrow.size[1] // 2))
    base = img.convert("RGBA")
    base.alpha_composite(overlay)
    return base.convert("RGB")


def process_job(job: dict) -> Image.Image:
    doc = fitz.open(ARCH)
    page = doc[job["page"]]
    bb = floor_bbox(page)
    pad = job["pad"]
    clip = fitz.Rect(bb.x0 - pad, bb.y0 - pad, bb.x1 + pad, bb.y1 + pad) & page.rect
    boxes = dim_cover_boxes(page, clip)
    pix = page.get_pixmap(matrix=fitz.Matrix(ZOOM, ZOOM), clip=clip, alpha=False)
    rgb = np.frombuffer(pix.samples, dtype=np.uint8).reshape(pix.height, pix.width, 3).astype(np.float32)
    rgb = cover_boxes(rgb, boxes)
    img = Image.fromarray(np.clip(rgb, 0, 255).astype(np.uint8))
    doc.close()
    if job["rotate"]:
        img = img.rotate(job["rotate"], expand=True)
    rgb = np.array(img.convert("RGB"), dtype=np.float32)
    built, walls = building_mask(rgb)
    rgb = wipe_outside(rgb, built)
    rgb = clip_outer_ticks(rgb, built)
    rgb = erase_stray_ink(rgb, walls)
    rgb = tight_crop(rgb, built)
    out = Image.fromarray(np.clip(rgb, 0, 255).astype(np.uint8))
    return out.filter(ImageFilter.UnsharpMask(radius=0.6, percent=40, threshold=4))


def main() -> None:
    overlay_only = "--overlay" in __import__("sys").argv
    for job in JOBS:
        dest = BASE / job["name"]
        if overlay_only:
            if job["name"] not in ENTRY_MARKS:
                continue
            img = Image.open(dest).convert("RGB")
            print(f"overlay {job['name']}", flush=True)
        else:
            print(f"build {job['name']}", flush=True)
            img = process_job(job)
        mark = ENTRY_MARKS.get(job["name"])
        if mark:
            img = draw_entry_arrow(img, mark["xy"][0], mark["xy"][1], mark["angle"], mark["scale"])
        img.save(dest, optimize=True)
        print(f"  {img.size}")


if __name__ == "__main__":
    main()
