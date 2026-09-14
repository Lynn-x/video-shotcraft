/* Regenerate the theme textures from self-contained fictional HTML pages.
 * Uses the existing local Playwright and Chromium installation; no dependencies are installed.
 * No source image is transformed or recolored. Full pages and slices share identical DOM geometry.
 */
const fs=require('node:fs');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'../..');
const {chromium}=require(process.env.SHOTCRAFT_PLAYWRIGHT || 'playwright');
const {render,palettes}=require('../themes/ui.cjs');
const L=JSON.parse(fs.readFileSync(path.join(root,'template/src/aifl/live-layout.json'),'utf8'));
const executablePath=process.env.SHOTCRAFT_BROWSER;
const fixtureDir=path.join(root,'template/themes/previews');
const layoutClip=b=>({x:b.x,y:b.y,width:b.w,height:b.h});
// Match the retained screenshot set: rasterize each CSS boundary to the nearest
// pixel before multiplying by device scale, rather than truncating clip width.
const clip=b=>({x:Math.round(b.x),y:Math.round(b.y),width:Math.round(b.x+b.w)-Math.round(b.x),height:Math.round(b.y+b.h)-Math.round(b.y)});
function dimensions(file){const b=fs.readFileSync(file);return {width:b.readUInt32BE(16),height:b.readUInt32BE(20),bytes:b.length};}
async function main(){
 fs.mkdirSync(fixtureDir,{recursive:true});
 const browser=await chromium.launch({executablePath,headless:true,args:['--disable-gpu','--font-render-hinting=none']});
 const report={source:'New browser-rendered HTML demo UI, not an image recolor',layout:'template/src/aifl/live-layout.json',deviceScale:2,heroScale:4,themes:{}};
 try{
  for(const theme of Object.keys(palettes)){
   const out=path.join(root,'template/public/themes',theme,'textures/live');fs.mkdirSync(out,{recursive:true});
   const context=await browser.newContext({viewport:{width:L.pageW,height:1080},deviceScaleFactor:2});
   const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
   const records=[];const geometry=[];const geometryChecks=[];const textOverflow=[];
   async function checkGeometry(selector,expected){
    const actual=await page.locator(selector).evaluateAll(els=>els.map(e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height}}));
    const matches=actual.length===expected.length&&actual.every((b,i)=>['x','y','w','h'].every(k=>Math.abs(b[k]-expected[i][k])<0.02));
    geometryChecks.push({selector,count:actual.length,matches});
    if(!matches)throw Error(`${theme}: ${selector} does not match retained layout coordinates`);
   }
   async function checkText(kind,selector){
    const found=await page.locator(selector).evaluateAll(els=>els.map(e=>({text:e.textContent.slice(0,100),width:e.clientWidth,scrollWidth:e.scrollWidth})).filter(e=>e.scrollWidth>e.width+1));
    textOverflow.push(...found.map(e=>({page:kind,...e})));
   }
   async function save(name,b){const file=path.join(out,name);await page.screenshot({path:file,clip:clip(b),animations:'disabled'});records.push({name,...dimensions(file),css:layoutClip(b),capturedClip:clip(b)});}
   async function open(kind,h){const file=path.join(fixtureDir,`${theme}-${kind}.html`);fs.writeFileSync(file,render(theme,kind,L),'utf8');await page.setViewportSize({width:L.pageW,height:h});await page.goto(pathToFileURL(file).href);await page.evaluate(()=>document.fonts.ready);}
   await open('projects',L.projects.pageH);
   await checkGeometry('.project-card',L.projects.cards);
   await checkText('projects','.project-card h3,.card-desc,.card-stats strong');
   geometry.push(await page.locator('.project-card').evaluateAll(els=>els.map(e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height}})));
   await save('projects-full.png',{x:0,y:0,w:L.pageW,h:L.projects.pageH});
   for(const b of L.projects.cards)await save(b.file,b);
   for(const b of L.float)await save(b.file,b);
   await save('nav.png',L.projects.header);
   await page.locator('.project-card').evaluateAll(els=>els.forEach(e=>e.style.visibility='hidden'));
   await save('projects-empty.png',{x:0,y:0,w:L.pageW,h:L.projects.pageH});
   await open('detail',L.detail.pageH);await checkGeometry('.research-row',L.detail.rows);await checkText('detail','.research-row h4');await save('detail-full.png',{x:0,y:0,w:L.pageW,h:L.detail.pageH});
   await open('papers',L.papers.pageH);await checkGeometry('.paper-card',L.papers.cards);await checkText('papers','.paper-heading h3');await save('papers-full.png',{x:0,y:0,w:L.pageW,h:L.papers.pageH});
   for(let i=0;i<L.papers.cards.length;i++)await save(`paper${i+1}.png`,L.papers.cards[i]);
   await open('wbr',L.wbr.pageH);await save('wbr-full.png',{x:0,y:0,w:L.pageW,h:L.wbr.pageH});
   await checkGeometry('.weekly-block',L.wbr.blocks);await checkGeometry('.left-rail',[L.wbr.leftRail]);await checkGeometry('.right-rail',[L.wbr.rightRail]);await checkText('wbr','.weekly-block');
   const overflow=await page.locator('.weekly-block').evaluateAll(els=>els.map((e,i)=>({i,scrollWidth:e.scrollWidth,clientWidth:e.clientWidth,scrollHeight:e.scrollHeight,clientHeight:e.clientHeight})).filter(r=>r.scrollHeight>r.clientHeight+1));
   await open('experiments',L.detail.expPageH);await save('detail-experiments.png',{x:0,y:0,w:L.pageW,h:L.detail.expPageH});
   const heroContext=await browser.newContext({viewport:{width:L.pageW,height:L.projects.pageH},deviceScaleFactor:4});const heroPage=await heroContext.newPage();
   await heroPage.goto(pathToFileURL(path.join(fixtureDir,`${theme}-projects.html`)).href);await heroPage.evaluate(()=>document.fonts.ready);
   const heroFile=path.join(out,'card4-hires.png');await heroPage.screenshot({path:heroFile,clip:clip(L.projects.cards[3]),animations:'disabled'});records.push({name:'card4-hires.png',...dimensions(heroFile),css:layoutClip(L.projects.cards[3]),capturedClip:clip(L.projects.cards[3]),scale:4});await heroContext.close();
   const dimensionErrors=records.filter(r=>{const original=dimensions(path.join(root,'template/public/textures/live',r.name));return r.width!==r.capturedClip.width*(r.scale||2)||r.height!==r.capturedClip.height*(r.scale||2)||r.width!==original.width||r.height!==original.height;});
   report.themes[theme]={textures:records.length,files:records,projectGeometry:geometry[0],geometryChecks,textOverflow,dimensionErrors,weeklyVerticalOverflow:overflow,pageErrors:errors,palette:palettes[theme]};
   await context.close();console.log(`${theme}: ${records.length} textures generated; page errors=${errors.length}; text overflow=${textOverflow.length}; weekly overflow=${overflow.length}; geometry checks=${geometryChecks.length}`);
  }
 }finally{await browser.close();}
 fs.writeFileSync(path.join(root,'template/themes/capture-validation.json'),JSON.stringify(report,null,2)+'\n','utf8');
 if(Object.values(report.themes).some(t=>t.textures!==27||t.pageErrors.length||t.weeklyVerticalOverflow.length||t.textOverflow.length||t.dimensionErrors.length))process.exitCode=1;
}
main().catch(e=>{console.error(e);process.exitCode=1});
