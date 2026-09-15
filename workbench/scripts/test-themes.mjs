import { createRequire } from 'node:module';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import test from 'node:test';
import ts from 'typescript';

// Run the small pure state/props adapter using the project's existing compiler.
const require = createRequire(import.meta.url);
require.extensions['.ts'] = (mod, filename) => mod._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020},
}).outputText, filename);
const {switchTheme, themedProps, inheritedProps, selectedTheme, themedBackground, upgradeLegacyTheme} = require('../src/theme.ts');
const card = {themeKey: 'title', schema: [{key:'ink',default:'#111'},{key:'text',default:'Title'}]};
const manifest = {themeProp:'__theme', defaultTheme:'paper', themes:[
  {id:'paper',background:'#fff',unitDefaults:{title:{ink:'#111'}}},
  {id:'dark',background:'#111',unitDefaults:{title:{ink:'#eee'}}},
]};
test('palette edits reach props and background, preserve clip overrides, and reset on preset switch', () => {
  const m={...manifest,paletteProp:'__palette',themes:[{id:'dark',palette:{page:'#111111',text:'#eeeeee',accent:'#999999'},unitDefaults:{title:{ink:'#eeeeee',amber:'#999999'}}}]};
  const colors={page:'#fefefe',text:'#222222',accent:'#2255aa',font:'evil',border:'url(x)'};
  const props=themedProps(m,card,'dark',{ink:'#123456'},colors);
  assert.equal(props.ink,'#123456');
  assert.equal(props.amber,'#2255aa');
  assert.deepEqual(props.__palette,{page:'#fefefe',text:'#222222',accent:'#2255aa'});
  assert.equal(themedBackground({themeId:'dark',themeColors:colors},m),'#fefefe');
  const project={themeId:'dark',themeColors:colors,tracks:[]};
  const reset=switchTheme(project,m,'dark');
  assert.equal(reset.themeColors,undefined);
  assert.equal(reset.tracks,project.tracks);
  assert.equal(JSON.parse(JSON.stringify(project)).themeColors.accent,'#2255aa');
  assert.equal(themedProps(m,{schema:[]},'dark',{},colors).__palette,undefined);
});
test('a theme change preserves the complete edit tree and round-trips in JSON', () => {
  const project = {name:'Edited',tracks:[{id:'t',clips:[{start:17,duration:90,props:{text:'My copy',ink:'#c0ffee'}}]}]};
  const changed = switchTheme(project, manifest, 'dark');
  assert.equal(changed.tracks,project.tracks);
  assert.equal(project.themeId,undefined);
  assert.equal(JSON.parse(JSON.stringify(changed)).themeId,'dark');
  assert.equal(themedBackground(changed,manifest),'#111');
});
test('explicit edits take precedence even when equal to another preset default', () => {
  assert.deepEqual(themedProps(manifest,card,'dark',{ink:'#111',text:'Edited'}),{ink:'#111',text:'Edited',__theme:'dark'});
  assert.equal(themedProps(manifest,card,'dark',{ink:'#c0ffee'}).ink,'#c0ffee');
  assert.deepEqual(inheritedProps(manifest,'title',{ink:'#111',text:'Edited'}),{text:'Edited'});
});
test('old JSON is normalized once, subsequent explicit default-colored edits survive', () => {
  const old={tracks:[{clips:[{cardId:'title',props:{ink:'#111',text:'Edited'}}]}]};
  const upgraded=upgradeLegacyTheme(old,manifest,{title:card});
  assert.equal(upgraded.themeId,'paper');
  assert.deepEqual(upgraded.tracks[0].clips[0].props,{text:'Edited'});
  upgraded.tracks[0].clips[0].props.ink='#111';
  assert.equal(upgradeLegacyTheme(upgraded,manifest,{title:card}),upgraded);
  assert.equal(old.tracks[0].clips[0].props.ink,'#111');
});
test('missing or unknown IDs use the default and invalid switches are no-ops', () => {
  const project={tracks:[]};
  assert.equal(selectedTheme(manifest,'unknown').id,'paper');
  assert.equal(switchTheme(project,manifest,'unknown'),project);
  assert.equal(themedProps(manifest,card).ink,'#111');
});
test('ordinary manifests and non-theme cards retain their original behavior', () => {
  assert.deepEqual(themedProps(null,card,undefined,{text:'Edited'}),{ink:'#111',text:'Edited'});
  assert.deepEqual(themedProps(manifest,{schema:card.schema},'dark'),{ink:'#111',text:'Title'});
  assert.deepEqual(inheritedProps({},'title',{ink:'#111'}),{ink:'#111'});
});
const {parsePalette,paletteFromProject,applyPalette}=require('../src/palettePresets.ts');
test('portable palettes validate schema and round-trip without changing clips',()=>{
 const m={themes:[{id:'dark',label:'Dark',palette:{page:'#111111',text:'#eeeeee'}}]};
 const p={themeId:'dark',themeColors:{text:'#ffffff'},tracks:[]};
 const saved=paletteFromProject(m,p,'My theme');
 assert.deepEqual(parsePalette(JSON.stringify(saved),m),saved);
 assert.equal(applyPalette(p,saved).tracks,p.tracks);
 for(const bad of [{...saved,version:2},{...saved,baseThemeId:'missing'},{...saved,colors:{page:'url(x)',text:'#eeeeee'}},{...saved,colors:{page:'#111111'}}])assert.throws(()=>parsePalette(JSON.stringify(bad),m));
 assert.throws(()=>parsePalette('not json',m));
 assert.throws(()=>parsePalette(' '.repeat(65537),m));
});
