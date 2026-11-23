#!/usr/bin/env python3
"""Generate the three centered lower-body FitCore portraits from atlas batch 2.

Only the matching 192x192 atlas cell is extracted for each muscle.
Each generated 360px SVG embeds its own compressed WebP portrait, not the atlas.

Requires Pillow: python -m pip install Pillow
Run: python scripts/build-centered-muscle-icons.py
"""
from __future__ import annotations

import base64
import io
import math
from pathlib import Path
from xml.sax.saxutils import escape

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ASSET_DIR = ROOT / "src/main/resources/static/fitcore-lab"
ATLAS = ASSET_DIR / "muscle-icons-premium-2.webp"
CELL = 192
SIZE = 360
SCALE = 348
RADIUS = 174
FEATHER = 12
BG = (231, 242, 227)

# The midline of the actual anatomy is to the right of the sprite cell centre.
# Horizontal translations are measured in source pixels.
SPECS = (
    ("QUADRICEPS", "Cuádriceps", "muscle-icon-quadriceps.svg", 1, -9),
    ("HAMSTRINGS", "Isquiotibiales", "muscle-icon-hamstrings.svg", 2, -17),
    ("GLUTES", "Glúteos", "muscle-icon-glutes.svg", 3, -18),
)


def crop_and_center(atlas: Image.Image, col: int, offset_x: int) -> Image.Image:
    source = atlas.crop((col * CELL, 0, (col + 1) * CELL, CELL))
    artwork = source.resize((SCALE, SCALE), Image.Resampling.LANCZOS)
    foreground = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    x = round((SIZE - SCALE) / 2 + offset_x * SCALE / CELL)
    y = (SIZE - SCALE) // 2
    foreground.alpha_composite(artwork, (x, y))

    fg_alpha = foreground.getchannel("A")
    fa = fg_alpha.load()
    circle = Image.new("RGBA", (SIZE, SIZE), (*BG, 0))
    ba = circle.getchannel("A")
    cp = ba.load()

    for py in range(SIZE):
        for px in range(SIZE):
            distance = math.hypot(px - 179.5, py - 179.5)
            cp[px, py] = round(max(0, min(1, (RADIUS + 0.5 - distance) / 1.5)) * 255)
            fa[px, py] = round(fa[px, py] * max(0, min(1, (RADIUS - distance) / FEATHER)))

    circle.putalpha(ba)
    foreground.putalpha(fg_alpha)
    return Image.alpha_composite(circle, foreground)


def build() -> None:
    with Image.open(ATLAS) as original:
        atlas = original.convert("RGBA")
    if atlas.size != (768, 384):
        raise ValueError(f"Unexpected atlas dimensions: {atlas.size}")

    for code, name, filename, col, shift_x in SPECS:
        portrait = crop_and_center(atlas, col, shift_x)
        buffer = io.BytesIO()
        portrait.save(buffer, format="WEBP", quality=91, method=6)
        webp = buffer.getvalue()
        if len(webp) >= 30_000:
            raise ValueError(f"Unexpectedly large {code} crop ({len(webp)} bytes)")

        embedded = base64.b64encode(webp).decode("ascii")
        svg = (
            '<?xml version="1.0" encoding="UTF-8"?>\n'
            '<svg xmlns="http://www.w3.org/2000/svg" width="360" height="360" '
            'viewBox="0 0 360 360">\n'
            f'  <title>{escape(name)}</title>\n'
            '  <image x="0" y="0" width="360" height="360" '
            'preserveAspectRatio="xMidYMid meet" '
            f'href="data:image/webp;base64,{embedded}"/>\n'
            '</svg>\n'
        )
        (ASSET_DIR / filename).write_text(svg, encoding="utf-8")
        print(f"{code:12} {len(webp):6} WebP bytes -> {len(svg):6} SVG bytes")


if __name__ == "__main__":
    build()
