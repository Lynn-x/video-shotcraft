# Palette editor validation

This supersedes the bright preset designs described in BRIGHT-VALIDATION.md.

- Replaced the three bright experiments with Sage, Coral, and Iris; retained their saved IDs.
- Shared seven-color JSON feeds scene materials, fixture captures, and the manifest palette editor.
- Recompiled five trusted fixture pages into 27 recolorable SVG crop definitions. Refreshed the three replacement presets' PNG snapshots; capture geometry, dimensions, and overflow checks passed.
- Six pure workbench tests passed, including palette validation, per-clip precedence, JSON serialization, and reset on preset switch. Template type check and workbench production build passed. The build retains its existing large-bundle advisory.
- Browser validated two sidebar sections, HEX editing, invalid-input recovery, matching SVG color variables, unchanged timeline edits, undo/redo, browser reload, restore preset, reset when switching presets, and no sidebar horizontal overflow at 1100 × 760.
- Loaded 20 preview samples across the five editable presets (frames 160, 425, 680, 913); no page errors or failed HTTP responses. Paper correctly retains its original fixed assets and displays the editing limitation.
- Exported four 1920 × 1080 custom-palette stills (frames 160, 425, 680, 913) through the workbench Main composition and a 30-frame H.264 sample (150–179). Visually inspected the custom hero card and title-card exports. Full-length exports and cross-browser SVG parity were not rerun.

## Additional dark presets

Deep Ocean and Obsidian Violet were added using the shared palette source and runtime assets. Both passed preview checks at frames 160, 425, 680, and 913, custom accent editing, reset, timeline preservation, and reload persistence. Hero previews were visually inspected. Template type checking and all six theme tests passed. No additional full-length exports were performed.
