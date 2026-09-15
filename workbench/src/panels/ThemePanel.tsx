import { MANIFEST } from '../cards/projectCards';
import { useStore } from '../store';
import { selectedTheme, switchTheme } from '../theme';

/** Theme selection shares the library's existing space and the project's undo history. */
export const ThemePanel = () => {
  const project = useStore(s => s.project);
  const themes = MANIFEST?.themes ?? [];
  const current = selectedTheme(MANIFEST, project.themeId);
  return (
    <section className="theme-panel" aria-label="影片主题">
      <div className="theme-panel-heading">影片主题</div>
      <p className="theme-panel-hint">点击应用，直接预览效果。</p>
      {themes.length ? (
        <div className="theme-options">
          {themes.map(theme => {
            const defaults = Object.values(theme.unitDefaults ?? {});
            const color = (key: string, fallback: string) => {
              const value = defaults.find(d => typeof d[key] === 'string')?.[key];
              return typeof value === 'string' ? value : fallback;
            };
            const active = theme.id === current?.id;
            const [name, subtitle] = theme.label.split(' · ');
            return (
              <button key={theme.id} className={`theme-option${active ? ' active' : ''}`}
                aria-label={theme.label} aria-pressed={active}
                onClick={() => {
                  const store = useStore.getState();
                  store.setPreview(null);
                  if (!active) store.setProject(switchTheme(project, MANIFEST, theme.id));
                }}>
                <span className="theme-palette" aria-hidden="true">
                  {[theme.background ?? '#ffffff', color('ink', '#202020'), color('accent', color('amber', '#888888')), color('muted', '#777777')]
                    .map((value, i) => <span key={i} style={{background: value}} />)}
                </span>
                <span className="theme-option-label"><strong>{name}</strong><span>{active ? '✓ 已应用' : subtitle}</span></span>
              </button>
            );
          })}
        </div>
      ) : <p className="theme-panel-empty">当前工程尚未提供可切换的主题。</p>}
      {!!themes.length && <p className="theme-panel-note">保留文案、剪辑和单独调整的样式。主题作用于已支持的镜头，导出使用当前选择。</p>}
    </section>
  );
};
