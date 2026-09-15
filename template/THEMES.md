# Visual themes

The template offers **Ink Press**, **Modern Light**, **Midnight**, **Solar Pop**, **Coral Burst**, and **Color Play**. In the workbench, open the **主题 (Themes)** tab in the left sidebar and click a theme to preview it immediately. Export uses the same selection. There is one scene tree and one timeline; switching does not render a new video or copy a project.

- Ink Press remains the default, including for old projects.
- Solar Pop pairs a lemon-yellow canvas with deep green; Coral Burst pairs coral with berry accents; Color Play combines lavender with mint, pink, and yellow cards.
- A project stores only `themeId`. Switching is undoable and survives JSON export/import and browser reload.
- Text, timing, audio, and explicit per-clip style edits remain intact. A custom color can intentionally override a preset.
- Pre-theme JSON is normalized once when loaded: values matching the original defaults become inherited styles. After migration, explicit edits are never inferred or discarded.
- These are **film themes**, not themes for the editor's own interface.

## Render without the workbench

From `template/`:

```sh
npm run render -- --props=themes/modern-light.json
npm run render -- --props=themes/midnight.json
```

All presets use the existing `AiflPromo` composition. Omitting `theme` selects Ink Press; unknown IDs fall back to Ink Press.

## Implementation

`src/themes/visual-theme.tsx` contains the palettes, material/asset resolution, and per-scene size defaults. React context keeps concurrent players isolated. Existing scene geometry, camera paths, layout coordinates, audio cues, and total duration remain shared. Paper-specific decoration is conditionally disabled for the other presets.

The workbench manifest extension is optional: `themes`, `defaultTheme`, `themeProp`, and each unit's `themeKey`. Each preset may declare a background and `unitDefaults`. The workbench resolves schema defaults → theme defaults → explicit clip props in the inspector, library preview, timeline preview, and export. Manifests without themes keep their existing behavior.

To add a preset, add its palette/ID and manifest label, then supply matching texture files under `public/themes/<id>/textures/live/`. A new palette alone cannot remove paper styling baked into a screenshot; these bundled presets include their own screen captures rather than applying a color-inversion filter.

## Demo assets

`themes/ui.cjs` is a shared fictional research-workspace fixture. Its pages are labelled as demonstrations; they do not represent a connected service or real research results. Each preset has 27 browser-rendered textures. Their dimensions and card/row coordinates match `src/aifl/live-layout.json`; full pages are captured at 2× and the hero card at 4×. Original Ink Press assets and existing audio are retained under their existing license/attribution terms. The new fixture code and captures are contributed under this repository's Apache-2.0 license.

The checked-in PNG files are ready to use: no extra browser or capture dependency is required to switch themes. To regenerate them, install Playwright in a development environment and run `node scripts/capture-themes.cjs`. Optional `SHOTCRAFT_PLAYWRIGHT` selects a locally installed Playwright module and `SHOTCRAFT_BROWSER` selects a Chromium executable. Generation writes a geometry/overflow report to `themes/capture-validation.json`; temporary HTML goes to ignored `themes/previews/`.

## Verification

From `workbench/`, run `npm run test:themes` and `npx tsc --noEmit`. From `template/`, run `npx tsc --noEmit`. The pure tests cover edit preservation, old JSON migration, fallback behavior, and unthemed projects. Browser and render validation results for this contribution are recorded in the contribution notes.
