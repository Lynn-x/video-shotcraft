import assets from './palette-assets.json';

// Bounded cache: color-picker changes must not retain an unlimited number of SVGs.
const cache = new Map<string,string>();
export const paletteAsset = (colors: Record<string,string>, name: string): string | undefined => {
  const clip = assets.clips[name as keyof typeof assets.clips];
  if (!clip) return undefined;
  const keys = ['page','surface','field','text','muted','accent','border'];
  const values = keys.map(k => /^#[0-9a-f]{6}$/i.test(colors[k]) ? colors[k] : '#ffffff');
  const key = name + values.join('');
  if (cache.has(key)) return cache.get(key);
  const style = keys.map((k,i) => `--${k}:${values[i]}`).join(';');
  const markup = assets.pages[clip.kind as keyof typeof assets.pages];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${clip.w*2}" height="${clip.h*2}" viewBox="${clip.x} ${clip.y} ${clip.w} ${clip.h}"><foreignObject x="0" y="0" width="1920" height="5000"><div xmlns="http://www.w3.org/1999/xhtml" style="${style};width:1920px"><style>${clip.empty ? '.project-card{visibility:hidden!important}' : ''}</style>${markup}</div></foreignObject></svg>`;
  const uri = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  if (cache.size >= 128) cache.delete(cache.keys().next().value!);
  cache.set(key,uri);
  return uri;
};
