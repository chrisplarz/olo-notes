const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const html=fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8');
const script=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(m=>m[1]).find(s=>s.includes('const CLOUDKEY='));
function boot(){
 const nodes=new Map(),storage=new Map(),ticks=[];let count=0;
 const el=id=>{if(id==='weatherControl')return null;if(!nodes.has(id))nodes.set(id,{id,innerHTML:'',textContent:'',value:'',dataset:{},classList:{toggle(){},add(){},remove(){}},style:{},setAttribute(){},removeAttribute(){},focus(){},querySelectorAll:()=>[]});return nodes.get(id)};
 const context=vm.createContext({requestAnimationFrame:()=>1,cancelAnimationFrame(){},Date,Math,JSON,Map,Set,Object,Number,String,Array,Boolean,Error,structuredClone,crypto:{randomUUID:()=>`test-${++count}`},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},document:{body:{dataset:{}},getElementById:el,querySelectorAll:selector=>selector==='.page'?['home','journal','insights','profile'].map(p=>el('page-'+p)):[],querySelector:()=>null,addEventListener(){},removeEventListener(){},documentElement:{classList:{add(){},remove(){}}}},window:{addEventListener(){},scrollTo(){}},navigator:{onLine:false},setTimeout:()=>1,clearTimeout(){},setInterval(fn,ms){ticks.push({fn,ms});return ticks.length},console});
 const start=script.lastIndexOf("navRender();nav('home');");const clock=script.slice(script.lastIndexOf("setInterval(()=>{if(view==="));vm.runInContext(script.slice(0,start)+"navRender();nav('home');"+clock,context);
 return {ctx:context,el,storage,run:s=>vm.runInContext(s,context),tick:()=>ticks.find(t=>t.ms===500).fn()};
}
test('desktop and mobile navigation lead to one Visits page with controls before history',()=>{
 const h=boot();h.ctx.nav('journal');for(const id of ['sideNav','bottomNav']){assert.match(h.el(id).innerHTML,/Visits/);assert.doesNotMatch(h.el(id).innerHTML,/Sessions/)}
 const content=h.el('page-journal').innerHTML;assert.match(content,/<h1>Visits<\/h1>/);assert.equal((content.match(/role="tablist"/g)||[]).length,1);assert.ok(content.indexOf('Live Timer<span')<content.indexOf('Guided Session<span'));assert.ok(content.indexOf('Guided Session<span')<content.indexOf('visitLog'));assert.doesNotMatch(content,/Post-visit entry<\/button>/);assert.doesNotMatch(h.el('sessionArea').innerHTML,/role="tablist"/);assert.match(h.el('sessionArea').innerHTML,/Begin sauna/);assert.doesNotMatch(html,/page-session/);
 h.ctx.beginManual();assert.match(h.el('sessionArea').innerHTML,/Sauna · total minutes/);assert.match(h.el('page-journal').innerHTML,/Recent Visits/);
});
test('Home start opens Visits and the running timer continues updating there',()=>{
 const h=boot();h.ctx.beginLive();assert.equal(h.run('view'),'journal');h.ctx.startInterval('sauna');h.run('draft.current.startedAt=Date.now()-65000');h.tick();assert.match(h.el('liveClock').textContent,/01:05/);assert.match(h.el('currentIntervalLabel').textContent,/1.1 min/);
 h.ctx.pauseResume();assert.equal(h.run('draft.current.running'),false);h.ctx.setSessionTab('manual');h.ctx.setSessionTab('timer');assert.equal(h.run('draft.current.running'),false);assert.match(h.el('sessionArea').innerHTML,/Timer paused/);
});
test('post-visit save and history edit stay on Visits without changing unrelated records',()=>{
 const h=boot();h.ctx.beginManual();assert.equal(h.run('view'),'journal');h.el('manualHeat').value='15';h.el('manualCold').value='2';h.ctx.saveManual();assert.equal(h.run('db.visits.length'),1);const id=h.run('db.visits[0].id');assert.match(h.el('page-journal').innerHTML,/1 recorded visit/);
 h.ctx.editVisit(id);assert.equal(h.run('view'),'journal');assert.match(h.el('sessionArea').innerHTML,/Edit your visit/);h.el('manualNotes').value='Updated';h.ctx.saveManual();assert.equal(h.run('db.visits.length'),1);assert.equal(h.run('db.visits[0].notes'),'Updated');assert.equal(JSON.parse(h.storage.get('loyly-journal-v1')).visits.length,1);
});


test('visit goal completion counts distinct days and prorates longer periods',()=>{
 const h=boot(),p=h.ctx.visitGoalProgress;
 const visits=[{date:'2026-10-25'},{date:'2026-10-25'},{date:'2026-10-26'},{date:'2026-10-27'}];
 assert.equal(p('2026-10-25','2026-10-31','week',4,visits).percent,75);
 assert.equal(p('2026-10-25','2026-10-31','week',1,visits).percent,100);
 assert.equal(p('2026-10-01','2026-10-31','month',4,[]).target,18);
 assert.equal(p('2026-01-01','2026-10-31','year',4,[]).target,174);
 assert.equal(p('2026-10-31','2026-10-30','week',4,[]).percent,0);
});
