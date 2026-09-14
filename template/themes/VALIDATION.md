# Theme preset validation

Local verification on Windows, Node 24.14.1, Remotion 4.0.484, Chromium headless (2026-09-15). AI-assisted implementation received an independent code/visual review; the following are measured checks, not claims about all platforms or arbitrary user content.

- Template and workbench TypeScript checks: passed.
- Workbench production build with the themed template linked: passed. Existing large-bundle warning remains.
- `workbench/scripts/test-themes.mjs`: 5 tests passed, including one-time legacy migration and explicit overrides equal to another preset's defaults.
- Real browser interaction: three presets, unchanged edit tree, custom copy/color preservation, undo, redo, and reload persistence passed; no page errors.
- Original Ink Press versus upstream `5e71af35a2daee492dd3ea93e5e8903f32dcd13c`: frames 65, 160, 680, 845, 1045 passed. Four frames were byte-identical; the outro differed by at most 1/255 per color channel.
- Direct composition versus workbench composition: frames 65, 160, 500, 680, 845, 1045 for all three presets passed (18 comparisons). Maximum channel difference: 1/255. These are sampled-frame checks, not an assertion that every frame was compared.
- Modern Light and Midnight: 14 rendered keyframes each visually reviewed. Serif title regression, overlapping weekly-report heading, and low-contrast member names were corrected.
- Both complete workbench compositions rendered to H.264/AAC MP4, 1920×1080, 30 fps, 1085 video frames (36.17 seconds). Existing sound cues were retained. Full continuous playback and human audio listening were not part of this review.
- Portable texture regeneration succeeded: 27 captures per preset, zero page errors, text overflows, dimension mismatches, or geometry failures. See `capture-validation.json`.

Local Windows launcher/export compatibility fixes were used for the test environment and are intentionally outside the theme contribution. macOS/Linux execution and remote CI have not been run for this branch.
