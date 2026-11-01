const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{chromium}=require('playwright');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
for(const width of [320,390,1280])test(`Live Timer indicator follows running activity on the other tab at ${width}px`,async t=>{
 const browser=await chromium.launch({headless:true});t.after(()=>browser.close());
 const page=await browser.newPage({viewport:{width,height:1000},reducedMotion:'reduce'}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',r=>{const u=new URL(r.request().url());if(u.href==='http://indicator.test/')return r.fulfill({contentType:'text/html',body:html});if(u.origin==='http://indicator.test'&&u.pathname.startsWith('/assets/'))return r.fulfill({body:fs.readFileSync(path.join(__dirname,'..',u.pathname))});return r.abort()});
 await page.addInitScript(()=>{if(!localStorage.getItem('loyly-journal-v1'))localStorage.setItem('loyly-journal-v1',JSON.stringify({profile:{appearance:{dailyIntro:false}},visits:[]}))});
 await page.goto('http://indicator.test/');await page.evaluate(()=>nav('journal'));
 const live=page.getByRole('tab',{name:'Live Timer',exact:true}),guided=page.getByRole('tab',{name:'Guided Session',exact:true}),dot=page.locator('.live-timer-indicator');
 assert.equal(await dot.isVisible(),false);await guided.click();assert.equal(await dot.isVisible(),false);
 for(const [type,color] of [['sauna','rgb(209, 133, 89)'],['cold','rgb(110, 159, 171)'],['rest','rgb(129, 147, 136)']]){
  await live.click();await page.locator(`.activity-btn[data-type=${type}]`).click();assert.equal(await dot.isVisible(),false);
  const before=await page.evaluate(()=>({id:draft.id,type:draft.current.type,startedAt:draft.current.startedAt}));
  await guided.click();assert.equal(await dot.isVisible(),true);assert.equal(await dot.getAttribute('data-type'),type);assert.equal(await dot.evaluate(e=>getComputedStyle(e).backgroundColor),color);assert.match(await live.getAttribute('aria-description'),/timer running/);
  assert.deepEqual(await page.evaluate(()=>({id:draft.id,type:draft.current.type,startedAt:draft.current.startedAt})),before);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  await live.click();await page.getByRole('button',{name:'Pause',exact:true}).click();await guided.click();assert.equal(await dot.isVisible(),false);assert.equal(await live.getAttribute('aria-description'),null);
  await live.click();await page.getByRole('button',{name:'Resume',exact:true}).click();await guided.click();assert.equal(await dot.isVisible(),true);
 }
 await page.reload();await page.evaluate(()=>nav('journal'));await guided.click();assert.equal(await dot.getAttribute('data-type'),'rest');assert.equal(await dot.isVisible(),true);
 await live.click();await page.evaluate(()=>finishLive());await page.locator('#modalRoot').getByRole('button',{name:'End Visit',exact:true}).click();await page.evaluate(()=>closeModal());await guided.click();assert.equal(await dot.isVisible(),false);
 assert.deepEqual(errors,[]);
});
