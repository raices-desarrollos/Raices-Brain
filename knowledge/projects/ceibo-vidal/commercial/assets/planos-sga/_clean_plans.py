#!/usr/bin/env python3
"""Editorial sales plans from SGA CAD extracts.

Keeps walls, rooms, furniture, vegetation and openings.
Drops dimension strings, section cuts, grid bubbles, hatching and index numbers.
"""
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

LINO = np.array([240, 237, 230], dtype=np.float32)
FLOOR = np.array([230, 224, 211], dtype=np.float32)
WALL = np.array([32, 30, 27], dtype=np.float32)
INK = np.array([26, 26, 24], dtype=np.float32)

BASE = Path(__file__).resolve().parent

JOBS = [
    ("planta-baja-solo.png", "planta-baja-editorial.png"),
    ("planta-tipo-solo.png", "planta-tipo-editorial.png"),
    ("planta-terraza-solo.png", "planta-terraza-editorial.png"),
    ("unidad-a-horiz.png", "unidad-a-editorial.png"),
    ("unidad-b-horiz.png", "unidad-b-editorial.png"),
    ("unidad-c-horiz.png", "unidad-c-editorial.png"),
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
    sizes = np.bincount(labeled.ravel())
    sizes[0] = 0
    return sizes[labeled] >= min_area


def bbox_of(mask: np.ndarray, pad: int, h: int, w: int) -> tuple[int, int, int, int]:
    ys, xs = np.where(mask)
    if ys.size == 0:
        return 0, 0, w, h
    y0 = max(int(ys.min()) - pad, 0)
    y1 = min(int(ys.max()) + pad + 1, h)
    x0 = max(int(xs.min()) - pad, 0)
    x1 = min(int(xs.max()) + pad + 1, w)
    return x0, y0, x1, y1


def filter_ink(ink: np.ndarray, wall: np.ndarray) -> np.ndarray:
    """Drop filled numbers / bubbles. Keep furniture, plants and door swings."""
    wall_touch = ndimage.binary_dilation(wall, structure=disk(2))
    h, w = ink.shape
    edge = np.zeros_like(ink)
    m = 22
    edge[:m] = True
    edge[-m:] = True
    edge[:, :m] = True
    edge[:, -m:] = True

    labeled, n = ndimage.label(ink)
    keep = np.zeros(ink.shape, dtype=bool)
    if n == 0:
        return keep
    slices = ndimage.find_objects(labeled)
    for i, slc in enumerate(slices, 1):
        if slc is None:
            continue
        sub = labeled[slc] == i
        area = int(sub.sum())
        hh, ww = sub.shape
        solidity = area / float(hh * ww)
        aspect = max(hh, ww) / max(min(hh, ww), 1)
        touches = bool((sub & wall_touch[slc]).any())
        on_edge = bool((sub & edge[slc]).any())
        if area < 12:
            continue
        if on_edge and not touches:
            continue
        if on_edge and area < 280:
            continue
        # Room index numbers and bubbles
        if area < 9000 and solidity >= 0.32 and aspect <= 3.4 and not touches:
            continue
        keep[slc][sub] = True
    return keep


def clean(path: Path) -> Image.Image:
    rgb = np.array(Image.open(path).convert("RGB"), dtype=np.float32)
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    lum = lum_of(rgb)

    is_red = (r > 145) & (g < 125) & (b < 125) & (r > g + 28) & (r > b + 28)
    rgb[is_red] = 255
    lum = lum_of(rgb)

    wall = keep_large((lum >= 108) & (lum <= 155), 180)
    wall = ndimage.binary_closing(wall, structure=disk(2))
    floor = keep_large((lum >= 198) & (lum <= 218), 220)
    floor = ndimage.binary_opening(floor, structure=disk(1))

    core = wall | floor
    building = ndimage.binary_closing(core, structure=disk(14))
    building = ndimage.binary_fill_holes(building)
    building = keep_large(building, 2500) if building.any() else building
    building = ndimage.binary_dilation(building, structure=disk(2))

    h, w = lum.shape
    x0, y0, x1, y1 = bbox_of(building, 10, h, w)
    rgb = rgb[y0:y1, x0:x1]
    lum = lum[y0:y1, x0:x1]
    building = building[y0:y1, x0:x1]
    wall = wall[y0:y1, x0:x1]
    floor = floor[y0:y1, x0:x1]

    wall = wall & building
    floor = floor & building
    arch = ndimage.binary_dilation(wall | floor, structure=disk(4))
    ink = (lum < 78) & building & ~wall & arch
    ink = filter_ink(ink, wall)

    hh, ww = lum.shape
    out = np.zeros((hh, ww, 3), dtype=np.float32)
    out[:] = LINO
    out[building & ~wall] = FLOOR
    out[floor] = FLOOR
    walls_draw = ndimage.binary_dilation(wall, structure=disk(1))
    out[walls_draw] = WALL
    out[ink] = INK

    content = building | walls_draw | ink
    x0, y0, x1, y1 = bbox_of(content, 8, hh, ww)
    out = out[y0:y1, x0:x1]
    return Image.fromarray(np.clip(out, 0, 255).astype(np.uint8))


def main():
    for src_name, dst_name in JOBS:
        src = BASE / src_name
        dst = BASE / dst_name
        print(f"clean {src_name} → {dst_name}", flush=True)
        img = clean(src)
        img.save(dst, optimize=True)
        print(f"  {img.size}")


if __name__ == "__main__":
    main()
