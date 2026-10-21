#!/usr/bin/env python3
"""Regenerate only exercises/fr/*.tex from 01-edu READMEs + translation maps.

Does not touch EN files or fr.subject.tex wrappers.
"""
from __future__ import annotations

import ast
import json
import sys
from pathlib import Path

POOL = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(POOL / "resources"))
import gen_piscine as gp  # noqa: E402


def load_full_map() -> dict[str, str]:
    mapping = dict(gp.load_maps())
    fond = POOL / "resources/fond"
    for path in sorted(fond.glob("_chunk_*.json")):
        mapping.update(json.loads(path.read_text(encoding="utf-8")))
    extra = fond / "fr_lines_full.json"
    if extra.exists():
        mapping.update(json.loads(extra.read_text(encoding="utf-8")))
    return mapping


def main() -> None:
    mapping = load_full_map()
    missing: set[str] = set()
    translated_files = 0
    for module in gp.MODULES:
        subject = POOL / module["dir"] / "subject"
        for index, folder in enumerate(module["ex"]):
            number = f"{index:02d}"
            en_title, md = gp.read_exercise(module, folder)
            fr_md = gp.translate_md(md, mapping, missing)
            fr_title = en_title
            for line in fr_md.splitlines():
                if line.startswith("# "):
                    fr_title = line[2:].strip()
                    break
            fr_body = gp.md_to_tex(fr_md)
            turn_fr = gp.files_to_turn_in(fr_md, number, "fr")
            out = subject / "exercises" / "fr" / f"ex{number}.tex"
            out.write_text(
                gp.exercise_tex(
                    number,
                    gp.render_inline(gp.normalize(fr_title)),
                    gp.latex_escape(turn_fr),
                    fr_body,
                    lang="fr",
                ),
                encoding="utf-8",
            )
            translated_files += 1
    miss_path = POOL / "resources/fond/fr_untranslated.txt"
    miss_path.write_text(
        "\n".join(sorted(missing)) + ("\n" if missing else ""),
        encoding="utf-8",
    )
    print(f"wrote {translated_files} fr exercise files")
    print(f"still untranslated lines: {len(missing)}")
    if missing:
        sample = sorted(missing)[:20]
        print("sample:")
        for s in sample:
            print(" ", s[:100])


if __name__ == "__main__":
    main()
