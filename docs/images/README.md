# Illustrations and screenshots

The `screenshots/` folder holds real captures from a running Home Assistant, in English (`en/`) and German (`de/`), each in `light/` and `dark/`. The README of the matching language uses them via `<picture>`, so the browser picks the mode; the gallery pages [`../screenshots.md`](../screenshots.md) and [`../screenshots.de.md`](../screenshots.de.md) show all of them.

The SVG files below are different:

The README uses the SVG illustrations in this folder. They are drawn by hand, not captured from a
running instance, and are deliberately schematic: they show the card's layout and what this fork
adds, without pretending to be a screenshot of anyone's dashboard.

| File | Shows |
| --- | --- |
| `banner.svg` | README header |
| `social-preview.svg` / `.png` | GitHub social preview (1280×640) |
| `card-preview.svg` | Headline image — three PV sources, two batteries, docked breakdown |
| `demo-grid-only.svg` | Minimal setup: grid only |
| `demo-solar-and-grid.svg` | Grid + solar |
| `demo-grid-solar-battery.svg` | Grid + solar + battery |
| `minimal-config.svg` | Result of the "Minimal Configuration" example |
| `demo-full.svg` | Fully configured card |
| `demo-individual-devices.svg` | More individual devices than the upstream limit of four |
| `ui-editor.svg` | The visual card editor |
