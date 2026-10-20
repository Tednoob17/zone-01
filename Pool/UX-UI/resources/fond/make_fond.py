#!/usr/bin/env python3
"""Fond a paliers pour les sujets LaTeX de la piscine UX/UI.

Parametres de norme_fond_paliers_30, non modifies :
  C1 = #FA7268 en haut, C2 = #B0235F en bas
  6 niveaux interpoles lineairement
  11 colonnes, largeur = ceil(largeur / 11)
  un decalage gaussien par colonne, sigma 0.9, numpy default_rng(42)
  indice de niveau de 0 en haut a 5 en bas, arrondi, borne a [0, 5]
  dilution 30 % sur blanc : pixel = couleur * 0.30 + 255 * 0.70
  pas de cadre noir (le cadre de page reste celui de training.cls)

Sortie : PNG A4 300 dpi, 2480 x 3508.
"""

import math
import struct
import zlib
from pathlib import Path

import numpy as np

WIDTH = 2480
HEIGHT = 3508
N_COLS = 11
N_LEVELS = 6
DILUTION = 0.30
C1 = np.array([0xFA, 0x72, 0x68], dtype=np.float64)
C2 = np.array([0xB0, 0x23, 0x5F], dtype=np.float64)


def column_offsets():
    rng = np.random.default_rng(42)
    return rng.normal(0.0, 0.9, size=N_COLS)


def level_colors():
    steps = np.linspace(0.0, 1.0, N_LEVELS)
    return C1[None, :] + (C2 - C1)[None, :] * steps[:, None]


def render():
    offsets = column_offsets()
    colors = level_colors()
    col_w = math.ceil(WIDTH / N_COLS)
    xs = np.arange(WIDTH)
    ys = np.arange(HEIGHT)
    cols = np.minimum(xs // col_w, N_COLS - 1)
    # 0 en haut, 5 en bas, puis decalage de colonne, arrondi, borne.
    frac = ys / (HEIGHT - 1)
    raw = frac[:, None] * (N_LEVELS - 1) + offsets[cols][None, :]
    idx = np.clip(np.rint(raw), 0, N_LEVELS - 1).astype(np.int32)
    rgb = colors[idx]
    diluted = rgb * DILUTION + 255.0 * (1.0 - DILUTION)
    return np.rint(diluted).clip(0, 255).astype(np.uint8), offsets, col_w


def contrast_against_black(rgb):
    def lin(c):
        c = c / 255.0
        return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)

    r, g, b = lin(rgb[:, :, 0]), lin(rgb[:, :, 1]), lin(rgb[:, :, 2])
    L = 0.2126 * r + 0.7152 * g + 0.0722 * b
    return (L + 0.05) / 0.05


def write_png(path, rgb):
    h, w, _ = rgb.shape
    raw = b"".join(b"\x00" + rgb[y].tobytes() for y in range(h))

    def chunk(tag, data):
        return (
            struct.pack(">I", len(data))
            + tag
            + data
            + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)
        )

    ihdr = struct.pack(">IIBBBBB", w, h, 8, 2, 0, 0, 0)
    png = b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", ihdr) + chunk(
        b"IDAT", zlib.compress(raw, 9)
    ) + chunk(b"IEND", b"")
    path.write_bytes(png)


def main():
    rgb, offsets, col_w = render()
    ratio = contrast_against_black(rgb)
    worst = float(ratio.min())
    if worst < 4.5:
        raise SystemExit(f"contraste WCAG insuffisant : {worst:.2f}")
    out = Path(__file__).resolve().parent / "norme_fond_paliers_30.png"
    write_png(out, rgb)
    print(f"wrote {out} {rgb.shape[1]}x{rgb.shape[0]}")
    print(f"col_w={col_w} offsets={np.array2string(offsets, precision=6)}")
    print(f"contrast min={worst:.2f} max={float(ratio.max()):.2f}")


if __name__ == "__main__":
    main()
