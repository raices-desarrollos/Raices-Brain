#!/usr/bin/env python3
"""Crop commercial floor plans from the current SGA brochure PDF."""
from __future__ import annotations

from pathlib import Path

import fitz
from PIL import Image, ImageFilter

BASE = Path(__file__).resolve().parent
ARCH = BASE.parents[2] / "architecture" / "arquitectura_18092026.pdf"
DPI = 230
ZOOM = DPI / 72.0

JOBS = [
    {"page": 3, "name": "planta-baja-solo.png", "rotate": 90, "pad": 14},
    {"page": 4, "name": "planta-tipo-solo.png", "rotate": 90, "pad": 12},
    {"page": 6, "name": "planta-terraza-solo.png", "rotate": 90, "pad": 12},
    {"page": 8, "name": "unidad-a-horiz.png", "rotate": 0, "pad": 16},
    {"page": 9, "name": "unidad-b-horiz.png", "rotate": 0, "pad": 28},
    {"page": 10, "name": "unidad-c-horiz.png", "rotate": 0, "pad": 16},
    {
        "page": 7,
        "name": "corte-aa.png",
        "rotate": 0,
        "clip": (48, 22, 1148, 798),
        "cover": [(50, 18, 400, 118)],
    },
]


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


def process_job(job: dict) -> Image.Image:
    doc = fitz.open(ARCH)
    page = doc[job["page"]]
    if "clip" in job:
        clip = fitz.Rect(*job["clip"]) & page.rect
    else:
        bb = floor_bbox(page)
        pad = job["pad"]
        clip = fitz.Rect(bb.x0 - pad, bb.y0 - pad, bb.x1 + pad, bb.y1 + pad) & page.rect
    for rect in job.get("cover", []):
        page.draw_rect(fitz.Rect(*rect), color=(1, 1, 1), fill=(1, 1, 1), overlay=True)
    pix = page.get_pixmap(matrix=fitz.Matrix(ZOOM, ZOOM), clip=clip, alpha=False)
    img = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
    doc.close()
    if job.get("rotate"):
        img = img.rotate(job["rotate"], expand=True)
    return img.filter(ImageFilter.UnsharpMask(radius=0.5, percent=28, threshold=4))


def main() -> None:
    for job in JOBS:
        dest = BASE / job["name"]
        print(f"build {job['name']}", flush=True)
        img = process_job(job)
        img.save(dest, optimize=True)
        print(f"  {img.size}")


if __name__ == "__main__":
    main()
