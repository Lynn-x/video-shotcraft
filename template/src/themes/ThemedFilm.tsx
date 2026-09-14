import { AiflMain } from '../aifl/Main';
import { resolveTheme, VisualThemeProvider } from './visual-theme';

export const ThemedFilm: React.FC<{theme?: string}> = ({theme}) => {
  const selected = resolveTheme(theme);
  return <VisualThemeProvider theme={selected.id}><AiflMain /></VisualThemeProvider>;
};
