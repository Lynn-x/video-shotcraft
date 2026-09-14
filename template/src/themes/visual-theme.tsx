import { createContext, useContext, type FC, type ReactNode } from 'react';
import { staticFile } from 'remotion';

export type ThemeId = 'ink-press' | 'modern-light' | 'midnight';
const font = '"Segoe UI Variable", "Segoe UI", "Microsoft YaHei", Arial, sans-serif';
export const THEME = {
  id: 'modern-light', page: '#f4f7fb', surface: '#ffffff', field: '#edf2f8',
  text: '#142238', muted: '#5c6b82', accent: '#2563eb', border: '#d8e2ef',
  shadowRgb: '20,34,56', pageRgb: '244,247,251', lightRgb: '239,245,255',
  accentRgb: '37,99,235', stage: '#142238', font,
};
export type VisualTheme = typeof THEME;
export const VISUAL_THEMES: Record<ThemeId, VisualTheme> = {
  'ink-press': {...THEME, id: 'ink-press', page: '#f2eee6'},
  'modern-light': THEME,
  midnight: {
    id: 'midnight', page: '#090f1a', surface: '#111c2c', field: '#162438',
    text: '#f0f5ff', muted: '#9babbe', accent: '#61d9ef', border: '#293b52',
    shadowRgb: '0,4,12', pageRgb: '9,15,26', lightRgb: '97,217,239',
    accentRgb: '97,217,239', stage: '#182c42', font,
  },
};
export const resolveTheme = (id?: string): VisualTheme =>
  VISUAL_THEMES[id as ThemeId] ?? VISUAL_THEMES['ink-press'];
const ThemeContext = createContext(VISUAL_THEMES['ink-press']);
export const VisualThemeProvider: FC<{theme?: string; children: ReactNode}> = ({theme, children}) =>
  <ThemeContext.Provider value={resolveTheme(theme)}>{children}</ThemeContext.Provider>;
export const useVisualTheme = () => useContext(ThemeContext);
export const rgba = (color: string, alpha: number) =>
  `color-mix(in srgb, ${color} ${Math.max(0, Math.min(1, alpha)) * 100}%, transparent)`;
export const themeAsset = (theme: VisualTheme, src: string) =>
  staticFile(src.startsWith('textures/live/') && theme.id !== 'ink-press' ? `themes/${theme.id}/${src}` : src);
/** Material adapter for existing Ink Press CSS. Returning the input verbatim keeps
 * the default preset backward compatible, including its original gradients. */
export const themePaint = (theme: VisualTheme, css: string): string => {
  if (theme.id === 'ink-press') return css;
  const hex: Record<string, string> = {
    '#f2eee6': theme.page, '#faf7f2': theme.page, '#f9f6f1': theme.page,
    '#fdfcfa': theme.page, '#fefcf9': theme.field, '#fff': theme.surface,
    '#13110f': theme.text, '#1f2937': theme.text, '#955905': theme.accent,
    '#ae6700': theme.accent, '#b5651d': theme.accent,
    '#65635f': theme.muted, '#575552': theme.muted, '#6b7280': theme.muted, '#9ca3af': theme.muted,
  };
  return css.replace(/#[\da-f]{3,8}\b/gi, c => hex[c.toLowerCase()] ?? c)
    .replace(/oklch\(\s*([\d.]+)%?[^)]+\)/g, (cssColor, lightness) => {
      const l = Number(lightness) <= 1 ? Number(lightness) * 100 : Number(lightness);
      const color = l >= 94 ? theme.page : l >= 80 ? theme.border : l >= 40 ? theme.accent : theme.text;
      const alpha = cssColor.match(/\/\s*([\d.]+)(%)?/);
      return alpha ? rgba(color, Number(alpha[1]) / (alpha[2] ? 100 : 1)) : color;
    })
    .replace(/rgba?\(\s*(\d+),\s*(\d+),\s*(\d+)/g, (_c, r, g, b) => {
      const channels = +r > 230 && +g > 230 && +b > 220 ? theme.pageRgb
        : +r > 120 && +r > +b * 1.15 ? theme.accentRgb
        : +r < 90 && +g < 90 && +b < 90 ? theme.shadowRgb : `${r},${g},${b}`;
      return `rgba(${channels}`;
    });
};

/** Per-preset defaults, shared by direct rendering and the workbench manifest. */
export const sceneDefaults = <T extends Record<string, unknown>>(theme: VisualTheme, key: string, defaults: T): T => {
  if (theme.id === 'ink-press') return defaults;
  const mapped = Object.fromEntries(Object.entries(defaults).map(([k,v]) =>
    [k, typeof v === 'string' && /^(#|oklch|rgba)/.test(v) ? themePaint(theme, v) : v]));
  const sizes: Record<string, Record<string, unknown>> = {
    morning: {wordmarkSize: 116, kickerSize: 44}, outro: {wordmarkSize: 124, taglineSize: 44},
    caption: {fontSize: 76, color: theme.text}, wbr: {kicker: ''},
  };
  return {...mapped, ...sizes[key]} as T;
};
