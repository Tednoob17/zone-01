# Circular_graph — Documentation

This module provides tools to generate circular SVG maps representing modules, projects, "piscines" and checkpoints, with support for "classic" (single value) and "distribution" (statistics) visualizations.

---
## Overview

- Main module: `circular_graph.modular_graph` — the `modular_graph` class that builds and renders a circular SVG map.
- Color utilities: `circular_graph.color_tools` — functions for interpolation and hex/RGB conversion, and generation of a gradient HTML block.
- Utilities: `circular_graph.tools` — helper functions for rendering (info cards, text conversion, SVG helpers).

---
## Important structure

- `circular_graph/`
  - `modular_graph.py` — `modular_graph` class (main API).
  - `color_tools/`
    - `color_conversion.py` — color conversions and value → color mapping.
    - `gradient.py` — generates an HTML/CSS/JS block for a gradient legend.
  - `tools/`
    - `renderer_utils.py` — JS strings for info-cards.
    - `text_conversion.py` — slugification utilities and key replacement.

---
## Quick installation

```bash
pip install git+https://github.com/01-edu/vizard.git
```

---
## Usage example (notebook)

```python
from circular_graph.modular_graph import modular_graph
from circular_graph.color_tools.color_conversion import value_to_color

# graph_json: string containing the structural description (see examples)
data_map = {"project-a": 10, "project-b": 3, "project-c": 7}
piscines = ["piscine-1"]
checkpoints = ["checkpoint-1"]
mandatory = ["project-a"]

g = modular_graph(graph_json, data_map, piscines, checkpoints, mandatory, kind="classic")
g.show()  # displays the SVG in Jupyter
```

For "custom" visualization with multiple metrics, provide dictionary values and optionally specify which key to use for coloring:

```python
# Custom mode with multiple metrics per project
custom_data = {
    "project-a": {"completion": 85, "quality": 92, "speed": 78},
    "project-b": {"completion": 70, "quality": 88, "speed": 95},
    "project-c": {"completion": 95, "quality": 75, "speed": 80}
}

# Default: uses first key (completion) for colors
g1 = modular_graph(graph_json, custom_data, piscines, checkpoints, mandatory, kind="custom")

# Explicit: use "quality" for colors
g2 = modular_graph(graph_json, custom_data, piscines, checkpoints, mandatory, 
                   kind="custom", color_key="quality")
g2.show()
```

---
## API summary

- class `modular_graph(graph_json: str, data: dict, piscines_list: list, checkpoints_list: list, mandatory_list: list, kind: "classic"|"custom"="classic", color_key: str|None=None)`
  - Renders the map and exposes `graph_svg_text` (SVG string).
  - Parameters:
    - `graph_json` — JSON string describing the graph structure
    - `data` — Project data (dict for classic/custom modes)
    - `piscines_list`, `checkpoints_list`, `mandatory_list` — Project lists
    - `kind` — Visualization mode: "classic" (single value) or "custom" (dictionary values)
    - `color_key` — (Custom mode only) Which dictionary key to use for color mapping. Defaults to first key if not specified. Must be a valid key present in all data dictionaries.
  - Notable methods:
    - `show()` — displays the SVG in Jupyter.
    - `set_gradient_colors(start_color_hex, mid_color_hex, end_color_hex)` — updates the color palette and re-renders the graph.

- `tools.text_conversion`
  - `to_slug(text, mapping)` — slugifies or uses a mapping.
  - `replace_keys(dict, mapping)` — replaces dict keys with slugs.


## License
01 Data Science Team (DTF)

