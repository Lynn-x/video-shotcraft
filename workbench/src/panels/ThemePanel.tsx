import { useEffect, useState } from 'react';
import { MANIFEST } from '../cards/projectCards';
import { useStore } from '../store';
import { selectedTheme, switchTheme, validThemeColors } from '../theme';

const fields = [['page','背景'],['surface','卡片'],['text','文字'],['muted','次要文字'],['accent','强调色'],['field','浅色填充'],['border','边框']] as const;
const ColorField = ({label,value,onChange}: {label:string;value:string;onChange:(value:string)=>void}) => {
  const [draft,setDraft] = useState(value);
  useEffect(()=>setDraft(value),[value]);
  const valid = /^#[0-9a-f]{6}$/i.test(draft);
  const commit = () => { if(valid && draft !== value) onChange(draft); else setDraft(value); };
  return <label className="theme-color-row"><span>{label}</span>
    <input type="color" aria-label={`${label}取色`} value={value} onChange={e=>onChange(e.target.value)} />
    <input type="text" aria-label={`${label}色值`} value={draft} maxLength={7} spellCheck={false}
      aria-invalid={!valid} onChange={e=>setDraft(e.target.value)} onBlur={commit}
      onKeyDown={e=>{if(e.key==='Enter')e.currentTarget.blur();if(e.key==='Escape')setDraft(value);}} />
  </label>;
};

export const ThemePanel = () => {
  const project = useStore(s=>s.project);
  const themes = MANIFEST?.themes ?? [];
  const current = selectedTheme(MANIFEST,project.themeId);
  const custom = validThemeColors(MANIFEST,project.themeId,project.themeColors);
  const modified = Object.keys(custom).length > 0;
  const palette = {...current?.palette,...custom};
  const updateColor = (key:string,value:string) => {
    const store = useStore.getState();
    const next = {...validThemeColors(MANIFEST,store.project.themeId,store.project.themeColors),[key]:value};
    if(value.toLowerCase()===current?.palette?.[key]?.toLowerCase()) delete next[key];
    store.setPreview(null);
    store.setProject({...store.project,themeColors:Object.keys(next).length ? next : undefined});
  };
  return <section className="theme-panel" aria-label="影片主题">
    <div className="theme-panel-heading">预设主题</div>
    <p className="theme-panel-hint">选择一套风格，再调整配色。</p>
    {themes.length ? <div className="theme-options">{themes.map(theme=>{
      const active=theme.id===current?.id;
      const colors=theme.palette ?? {page:theme.background ?? '#f2eee6',text:'#13110f',accent:'#955905'};
      return <button key={theme.id} className={`theme-option${active?' active':''}`} aria-label={theme.label} aria-pressed={active}
        onClick={()=>{const store=useStore.getState();store.setPreview(null);if(!active)store.setProject(switchTheme(store.project,MANIFEST,theme.id));}}>
        <span className="theme-palette" aria-hidden="true">{[colors.page,colors.surface ?? colors.page,colors.accent].map((c,i)=><span key={i} style={{background:c}} />)}</span>
        <span className="theme-option-label"><strong>{theme.label.split(' · ')[0]}</strong><span>{active?'✓':''}</span></span>
      </button>;
    })}</div> : <p className="theme-panel-empty">当前工程尚未提供主题。</p>}
    <div className="theme-editor" aria-label="替换配色">
      <div className="theme-editor-heading"><span className="theme-panel-heading">替换配色</span><button className="theme-reset" disabled={!modified} onClick={()=>{const s=useStore.getState();s.setPreview(null);s.setProject({...s.project,themeColors:undefined});}}>恢复预设</button></div>
      {current?.palette ? <>
        <p className="theme-panel-hint">{modified?'已自定义 · ':'点击色块或输入 HEX · '}切换预设会重置配色</p>
        {fields.filter(([key])=>palette[key]).map(([key,label])=><ColorField key={`${current.id}:${key}`} label={label} value={palette[key]} onChange={value=>updateColor(key,value)} />)}
        <p className="theme-panel-note">同步预览与导出，可撤销。单独调整过的镜头颜色优先保留。</p>
      </> : <p className="theme-panel-note">{themes.length?'纸质主题保留原始截图质感。选择其他预设后，可调整整套配色。':'工程提供可编辑配色后，会在这里显示。'}</p>}
    </div>
  </section>;
};
