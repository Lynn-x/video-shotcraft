import { createContext, useContext, type FC, type ReactNode } from 'react';
import { staticFile } from 'remotion';

export type ThemeId = 'ink-press' | 'modern-light' | 'midnight' | 'solar-pop' | 'coral-burst' | 'color-play';
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
  'solar-pop': {
    id: 'solar-pop', page: '#fff36b', surface: '#fffde8', field: '#e5f6bd',
    text: '#182b24', muted: '#4d6045', accent: '#166447', border: '#a3b765',
    shadowRgb: '24,43,36', pageRgb: '255,243,107', lightRgb: '255,253,232',
    accentRgb: '22,100,71', stage: '#deef8c', font,
  },
  'coral-burst': {
    id: 'coral-burst', page: '#ff9c83', surface: '#fff5ed', field: '#ffe1d3',
    text: '#442139', muted: '#805267', accent: '#ad2450', border: '#dc947e',
    shadowRgb: '68,33,57', pageRgb: '255,156,131', lightRgb: '255,245,237',
    accentRgb: '173,36,80', stage: '#ed7792', font,
  },
  'color-play': {
    id: 'color-play', page: '#c8b8ff', surface: '#fff9ef', field: '#e6dcff',
    text: '#30205a', muted: '#65547f', accent: '#6134bb', border: '#aa90d5',
    shadowRgb: '48,32,90', pageRgb: '200,184,255', lightRgb: '255,249,239',
    accentRgb: '97,52,187', stage: '#94e0d8', font,
  },
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
