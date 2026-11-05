const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{chromium}=require('playwright');
const root=path.join(__dirname,'..');
async function boot(t,width=390){
 const browser=await chromium.launch({headless:true});t.after(()=>browser.close());
 const page=await browser.newPage({viewport:{width,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:1,reducedMotion:'reduce',timezoneId:'America/Denver'});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));t.after(()=>assert.deepEqual(errors,[]));
 await page.route('**/*',route=>{const url=new URL(route.request().url());if(url.origin!=='http://olo.test')return route.abort();const file=path.join(root,url.pathname==='/'?'index.html':url.pathname);return fs.existsSync(file)?route.fulfill({path:file}):route.abort()});
 await page.addInitScript(()=>localStorage.setItem('loyly-journal-v1',JSON.stringify({profile:{goal:4,appearance:{dailyIntro:false}},visits:[]})));
 await page.goto('http://olo.test/');await page.evaluate(()=>document.fonts.ready);return page;
}
async function swipe(page,dx,dy=0){
 await page.locator('.week-grid').scrollIntoViewIfNeeded();const box=await page.locator('.week-grid').boundingBox(),x=box.x+box.width/2,y=box.y+box.height/2;
 const cdp=await page.context().newCDPSession(page);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
 for(let i=1;i<=8;i++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+dx*i/8,y:y+dy*i/8}]});await new Promise(r=>setTimeout(r,20))}
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await cdp.detach();
}
for(const width of [320,390,430,768,1280])test('calendar sizing, plan spacing and control order at '+width+'px',async t=>{
 const page=await boot(t,width);await page.evaluate(()=>{db.plannedVisits=[{id:'qa-plan',date:localDate(),time:'12:00',timeZone:'America/Denver',duration:60,startMs:Date.now()+3600000}];renderHome()});
 const geometry=await page.locator('.home-week').evaluate(card=>{
  const circle=card.querySelector('.has-plan .day-circle'),number=circle.querySelector('.day-number'),b=circle.getBoundingClientRect(),n=number.getBoundingClientRect(),style=getComputedStyle(circle),dot=getComputedStyle(circle,'::after'),cw=card.clientWidth-parseFloat(getComputedStyle(card).paddingLeft)-parseFloat(getComputedStyle(card).paddingRight),original=Math.min(60,Math.max(26,cw*.08));
  return {width:b.width,ratio:b.width/original,compact:cw<=560,gap:b.top+parseFloat(style.borderTopWidth)+parseFloat(dot.top)-n.bottom,color:dot.backgroundColor,sauna:getComputedStyle(card).getPropertyValue('--sauna').trim(),rowFits:card.scrollWidth<=card.clientWidth,actions:[...card.querySelectorAll('[data-week-action]')].map(n=>n.dataset.weekAction),circles:[...card.querySelectorAll('.day-circle')].map(n=>{const r=n.getBoundingClientRect();return {left:r.left,right:r.right}})};
 });
 if(geometry.compact)assert.ok(geometry.ratio>=1.15&&geometry.ratio<=1.2,JSON.stringify(geometry));else assert.ok(Math.abs(geometry.ratio-1)<.01);
 assert.ok(Math.abs(geometry.gap-3)<.1,JSON.stringify(geometry));assert.equal(geometry.color,'rgb(240, 223, 212)');assert.equal(geometry.rowFits,true);
 assert.deepEqual(geometry.actions,['previous','next','reset']);assert.ok(geometry.circles.every((r,i,a)=>!i||r.left>a[i-1].right));assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 if(process.env.OLO_CALENDAR_QA_SCREENSHOT){await page.locator('.home-week').screenshot({path:process.env.OLO_CALENDAR_QA_SCREENSHOT+'-'+width+'.png'})}
});
test('native horizontal swipes browse once in each direction, including disabled past days, and preserve data',async t=>{
 const page=await boot(t),initial=await page.locator('.home-week').getAttribute('data-week'),data=await page.evaluate(()=>JSON.stringify(db));
 await swipe(page,90);const previous=await page.locator('.home-week').getAttribute('data-week');assert.notEqual(previous,initial);assert.equal(await page.evaluate(()=>dayStart(homeWeekStart()).getTime()<dayStart(startOfWeek()).getTime()),true);assert.equal(await page.getByRole('dialog').count(),0);
 await swipe(page,-90);assert.equal(await page.locator('.home-week').getAttribute('data-week'),initial);
 await swipe(page,-90);assert.equal(await page.evaluate(()=>dayStart(homeWeekStart()).getTime()>dayStart(startOfWeek()).getTime()),true);assert.equal(await page.getByRole('dialog').count(),0);
 await page.getByRole('button',{name:'Return to today',exact:true}).click();assert.equal(await page.locator('.home-week').getAttribute('data-week'),initial);assert.equal(await page.evaluate(()=>JSON.stringify(db)),data);
});
test('vertical and diagonal gestures scroll without browsing; taps still open dates',async t=>{
 const page=await boot(t),week=await page.locator('.home-week').getAttribute('data-week');await page.locator('.week-grid').scrollIntoViewIfNeeded();const before=await page.evaluate(()=>scrollY);
 await swipe(page,8,-100);assert.equal(await page.locator('.home-week').getAttribute('data-week'),week);assert.ok(await page.evaluate(()=>scrollY)>before);assert.equal(await page.getByRole('dialog').count(),0);
 await swipe(page,55,-90);assert.equal(await page.locator('.home-week').getAttribute('data-week'),week);
 await swipe(page,20,0);assert.equal(await page.locator('.home-week').getAttribute('data-week'),week);
 await page.locator('.week-day[aria-current="date"]').tap();assert.equal(await page.getByRole('dialog').count(),1);
});
test('cancelled and multi-touch gestures cannot browse',async t=>{
 const page=await boot(t),week=await page.locator('.home-week').getAttribute('data-week');
 await page.locator('.week-grid').evaluate(row=>{const touch=(id,x)=>new Touch({identifier:id,target:row,clientX:x,clientY:20});const a=touch(1,10),b=touch(2,40);row.dispatchEvent(new TouchEvent('touchstart',{bubbles:true,touches:[a]}));row.dispatchEvent(new TouchEvent('touchstart',{bubbles:true,touches:[a,b]}));row.dispatchEvent(new TouchEvent('touchend',{bubbles:true,touches:[],changedTouches:[touch(1,100)]}));row.dispatchEvent(new TouchEvent('touchstart',{bubbles:true,touches:[a]}));row.dispatchEvent(new TouchEvent('touchcancel',{bubbles:true,touches:[],changedTouches:[a]}));row.dispatchEvent(new TouchEvent('touchend',{bubbles:true,touches:[],changedTouches:[touch(1,100)]}))});
 assert.equal(await page.locator('.home-week').getAttribute('data-week'),week);
});
