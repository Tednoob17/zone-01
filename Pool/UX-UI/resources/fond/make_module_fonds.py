#!/usr/bin/env python3
"""Convertit chaque SVG assigné en PNG A4 filigrane (2480×3508), dilution 30 % sur blanc.

Lit Pool/UX-UI/watermark-mapping.txt. WCAG contraste texte noir ≥ 4.5.
"""

from __future__ import annotations

import re
import struct
import subprocess
import sys
import tempfile
import zlib
from pathlib import Path

import numpy as np
from PIL import Image

# .../Pool/UX-UI/resources/fond/this.py → parents[4] = repo root
ROOT = Path(__file__).resolve().parents[4]
UXUI = Path(__file__).resolve().parents[2]
OUT_DIR = Path(__file__).resolve().parent
MAPPING = UXUI / "watermark-mapping.txt"
WIDTH, HEIGHT = 2480, 3508
DILUTION = 0.30


def contrast_against_black(rgb: np.ndarray) -> np.ndarray:
    def lin(c):
        c = c / 255.0
        return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)

    r, g, b = lin(rgb[:, :, 0]), lin(rgb[:, :, 1]), lin(rgb[:, :, 2])
    L = 0.2126 * r + 0.7152 * g + 0.0722 * b
    return (L + 0.05) / 0.05


def write_png(path: Path, rgb: np.ndarray) -> None:
    h, w, _ = rgb.shape
    raw = b"".join(b"\x00" + rgb[y].tobytes() for y in range(h))

    def chunk(tag: bytes, data: bytes) -> bytes:
        return (
            struct.pack(">I", len(data))
            + tag
            + data
            + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)
        )

    ihdr = struct.pack(">IIBBBBB", w, h, 8, 2, 0, 0, 0)
    path.write_bytes(
        b"\x89PNG\r\n\x1a\n"
        + chunk(b"IHDR", ihdr)
        + chunk(b"IDAT", zlib.compress(raw, 9))
        + chunk(b"IEND", b"")
    )


def parse_mapping() -> list[tuple[str, str]]:
    rows = []
    for line in MAPPING.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        parts = re.split(r"\t+", line)
        if len(parts) != 2:
            raise SystemExit(f"ligne mapping invalide: {line!r}")
        rows.append((parts[0].strip(), parts[1].strip()))
    return rows


def svg_to_a4_rgb(svg_path: Path) -> np.ndarray:
    """Rasterise en cover A4 (recadrage centré, pas d'étirement)."""
    with tempfile.TemporaryDirectory() as td:
        tmp = Path(td) / "raw.png"
        # Largeur forcée ; hauteur suit le ratio SVG, puis cover-crop.
        subprocess.run(
            [
                "rsvg-convert",
                "-w",
                str(WIDTH),
                "--keep-aspect-ratio",
                "-o",
                str(tmp),
                str(svg_path),
            ],
            check=True,
        )
        im = Image.open(tmp).convert("RGB")
        src_w, src_h = im.size
        scale = max(WIDTH / src_w, HEIGHT / src_h)
        nw, nh = max(WIDTH, int(round(src_w * scale))), max(
            HEIGHT, int(round(src_h * scale))
        )
        im = im.resize((nw, nh), Image.Resampling.LANCZOS)
        left = max(0, (nw - WIDTH) // 2)
        top = max(0, (nh - HEIGHT) // 2)
        im = im.crop((left, top, left + WIDTH, top + HEIGHT))
        if im.size != (WIDTH, HEIGHT):
            im = im.resize((WIDTH, HEIGHT), Image.Resampling.LANCZOS)
        return np.asarray(im, dtype=np.float64)


def dilute(rgb: np.ndarray) -> np.ndarray:
    diluted = rgb * DILUTION + 255.0 * (1.0 - DILUTION)
    return np.rint(diluted).clip(0, 255).astype(np.uint8)


def main() -> int:
    rows = parse_mapping()
    if len(rows) != 16:
        print(f"attendu 16 modules, obtenu {len(rows)}", file=sys.stderr)
    seen_img = set()
    for module, svg_name in rows:
        if svg_name in seen_img:
            raise SystemExit(f"image dupliquée dans le mapping: {svg_name}")
        seen_img.add(svg_name)
        svg_path = ROOT / svg_name
        if not svg_path.is_file():
            raise SystemExit(f"SVG manquant: {svg_path}")
        rgb = dilute(svg_to_a4_rgb(svg_path))
        ratio = contrast_against_black(rgb)
        worst = float(ratio.min())
        if worst < 4.5:
            raise SystemExit(f"{module}: contraste WCAG insuffisant ({worst:.2f})")
        out = OUT_DIR / f"{module}.png"
        write_png(out, rgb)
        print(f"OK {module} <- {svg_name}  contrast_min={worst:.2f}  -> {out.name}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
