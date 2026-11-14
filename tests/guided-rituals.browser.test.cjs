const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),{chromium}=require('playwright');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
async function boot(t,width=390){
  const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,headless:true,args:['--no-sandbox']});t.after(()=>browser.close());
  const page=await browser.newPage({viewport:{width,height:950},reducedMotion:'reduce'}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));t.after(()=>assert.deepEqual(errors,[]));
  await page.clock.install({time:new Date('2026-10-31T16:00:00Z')});await page.clock.pauseAt(new Date('2026-10-31T16:00:01Z'));
  await page.route('**/*',r=>{
    const url=new URL(r.request().url());
    if(url.href==='http://olo-rituals.test/')return r.fulfill({contentType:'text/html',body:html});
    if(url.origin==='http://olo-rituals.test'&&/^\/assets\/rituals\/[a-z-]+\.(jpg|png|svg)$/.test(url.pathname))return r.fulfill({contentType:'image/jpeg',body:fs.readFileSync(path.join(__dirname,'..',url.pathname))});
    return r.abort();
  });
  await page.addInitScript(()=>{if(!localStorage.getItem('loyly-journal-v1'))localStorage.setItem('loyly-journal-v1',JSON.stringify({profile:{goal:3,appearance:{dailyIntro:false}},visits:[]}));});
  await page.goto('http://olo-rituals.test/');await page.evaluate(()=>nav('journal'));
  await page.getByRole('tab',{name:'Guided Session',exact:true}).click();return page;
}
for(const width of [320,390,1280])test(`presets, editing and independent Live Timer at ${width}px`,async t=>{
  const page=await boot(t,width);assert.equal(await page.locator('.guided-preset').count(),4);
  assert.equal(await page.getByRole('tablist',{name:'Session experience'}).count(),1);
  assert.deepEqual((await page.getByRole('tablist',{name:'Session experience'}).getByRole('tab').allTextContents()).map(text=>text.trim()),['Live Timer','Guided Session']);
  assert.equal(await page.locator('#liveSessionTab svg').count(),1);
  assert.equal(await page.locator('.guided-preset img.guided-thumb').count(),4);
  await page.waitForFunction(()=>[...document.querySelectorAll('.guided-preset img.guided-thumb')].every(img=>img.complete&&img.naturalWidth>0));
  assert.equal(await page.locator('.guided-preset img.guided-thumb').evaluateAll(images=>images.every(img=>img.complete&&img.naturalWidth>0&&img.width===(innerWidth<=480?64:80)&&img.height===(innerWidth<=480?64:80)&&img.alt==='')),true);
  assert.equal(await page.getByRole('button',{name:'Post-visit entry',exact:true}).count(),0);
  assert.match(await page.locator('.guided-presets').textContent(),/19m/);assert.match(await page.locator('.guided-presets').textContent(),/10m 30s/);
  await page.getByRole('button',{name:/Mindful Reset/}).click();
  const preview=page.getByRole('dialog',{name:'Mindful Reset'});
  assert.equal(await preview.locator('.sheet-rows li').count(),3);
  assert.equal(await page.evaluate(()=>guidedPreview===null&&db.guidedRitual==null),true);
  if(width<=600){const box=await preview.boundingBox();assert.ok(box.y>200&&Math.abs(box.y+box.height-950)<1);}
  await page.keyboard.press('Escape');
  assert.equal(await page.getByRole('button',{name:/Mindful Reset/}).evaluate(e=>e===document.activeElement),true);
  await page.getByRole('button',{name:/Mindful Reset/}).click();
  await preview.getByRole('button',{name:'Customize'}).click();
  assert.equal(await page.evaluate(()=>guidedPreview.phase),'preview');assert.equal(await page.evaluate(()=>guidedPreview.startedAt),null);assert.equal(await page.evaluate(()=>draft),null);assert.equal(await page.evaluate(()=>db.guidedRitual==null),true);
  await page.getByRole('button',{name:/Increase step 1 by 30 seconds/}).click();assert.equal(await page.evaluate(()=>guidedPreview.steps[0].plannedMs),510000);
  await page.getByRole('button',{name:'Add step',exact:true}).click();assert.equal(await page.locator('.guided-step').count(),4);
  await page.locator('#guidedActivity3').selectOption('cold');await page.getByRole('button',{name:'Reorder step 4',exact:true}).press('ArrowUp');
  assert.equal(await page.evaluate(()=>guidedPreview.steps[2].activity),'cold');
  await page.getByRole('button',{name:'Remove step 3',exact:true}).click();
  page.once('dialog',d=>d.accept());await page.getByRole('button',{name:'Restore preset',exact:true}).click();
  assert.equal(await page.evaluate(()=>OloRituals.plannedMs(guidedPreview)),1140000);
  await page.getByRole('tab',{name:'Live Timer',exact:true}).click();await page.getByRole('button',{name:'Begin sauna',exact:true}).click();
  const liveId=await page.evaluate(()=>draft.id);await page.clock.runFor(30000);
  await page.getByRole('tab',{name:'Guided Session',exact:true}).click();assert.equal(await page.evaluate(()=>draft.id),liveId);assert.equal(await page.evaluate(()=>draft.current.running),true);assert.equal(await page.evaluate(()=>guidedPreview.phase),'preview');
  await page.getByRole('button',{name:'Start Ritual',exact:true}).click();await page.clock.runFor(30000);
  await page.getByRole('tab',{name:'Live Timer',exact:true}).click();assert.equal(await page.locator('#liveClock').textContent(),'01:00');
  await page.getByRole('tab',{name:'Guided Session',exact:true}).click();assert.equal(await page.locator('#guidedActual').textContent(),'00:30');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  assert.equal(await page.locator('.guided-experience').evaluate(e=>getComputedStyle(e).animationName),'none');
});
test('Add visit opens manual entry and the single selector returns to either session',async t=>{
  const page=await boot(t);
  await page.getByRole('button',{name:'Add visit',exact:true}).click();
  await page.locator('#manualNotes').fill('Remember this visit.');
  assert.equal(await page.getByRole('tablist',{name:'Session experience'}).count(),1);
  assert.equal(await page.locator('#liveSessionTab[aria-selected="false"]').count(),1);
  assert.equal(await page.locator('#guidedSessionTab[aria-selected="false"]').count(),1);
  await page.getByRole('tab',{name:'Live Timer',exact:true}).click();
  assert.equal(await page.getByRole('button',{name:'Begin sauna',exact:true}).count(),1);
  assert.equal(await page.evaluate(()=>manualNotes),'Remember this visit.');
  await page.getByRole('tab',{name:'Live Timer',exact:true}).press('ArrowRight');
  assert.equal(await page.locator('#guidedSessionTab').getAttribute('aria-selected'),'true');
  assert.equal(await page.locator('.guided-preset').count(),4);
  assert.equal(await page.evaluate(()=>db.visits.length),0);
});
test('pause, recovery, cold confirmation, partial review, edits and duplicate prevention',async t=>{
  const page=await boot(t);await page.getByRole('button',{name:/Nordic Contrast/}).click();await page.getByRole('button',{name:'Start Ritual',exact:true}).click();
  const live=page.getByRole('tab',{name:'Live Timer',exact:true}),guided=page.getByRole('tab',{name:'Guided Session',exact:true});
  const dot=guided.locator('.live-timer-indicator');
  async function checkGuidedIndicator(type,color){
    await live.click();
    assert.equal(await dot.isVisible(),Boolean(type));
    if(type){
      assert.equal(await dot.getAttribute('data-type'),type);
      assert.equal(await dot.evaluate(e=>getComputedStyle(e).backgroundColor),color);
      assert.match(await guided.getAttribute('aria-description'),/timer running/);
    }
    assert.equal(await page.locator('.guided-resume-note').count(),0);
    await guided.click();
    assert.equal(await dot.isVisible(),false);
  }
  await checkGuidedIndicator('sauna','rgb(209, 133, 89)');
  await page.clock.runFor(61000);await page.getByRole('button',{name:'Pause',exact:true}).click();await page.clock.runFor(120000);await checkGuidedIndicator();
  assert.equal(await page.evaluate(()=>OloRituals.elapsed(db.guidedRitual)),61000);await page.reload();await page.evaluate(()=>nav('journal'));
  assert.equal(await page.getByRole('button',{name:'Resume',exact:true}).count(),1);assert.equal(await page.evaluate(()=>OloRituals.elapsed(db.guidedRitual)),61000);
  await page.getByRole('button',{name:'Resume',exact:true}).click();await page.clock.runFor(30000);await page.getByRole('button',{name:'Complete & Next',exact:true}).click();
  await checkGuidedIndicator('rest','rgb(129, 147, 136)');
  await page.getByRole('button',{name:'Skip Step',exact:true}).click();assert.equal(await page.evaluate(()=>db.guidedRitual.awaitingCold),true);
  await checkGuidedIndicator();
  await page.clock.runFor(120000);assert.equal(await page.evaluate(()=>OloRituals.elapsed(db.guidedRitual)),0);
  await page.getByRole('button',{name:'Begin Cold Plunge…',exact:true}).click();await page.getByRole('button',{name:'Keep waiting',exact:true}).click();assert.equal(await page.evaluate(()=>db.guidedRitual.runningSince),null);
  await page.getByRole('button',{name:'Begin Cold Plunge…',exact:true}).click();await page.getByRole('dialog').getByRole('button',{name:'Begin Cold Plunge',exact:true}).click();
  await checkGuidedIndicator('cold','rgb(110, 159, 171)');
  await page.clock.runFor(45000);await page.getByRole('button',{name:'Complete & Next',exact:true}).click();await page.clock.runFor(10000);
  await page.getByRole('button',{name:'End Ritual',exact:true}).click();await page.getByRole('button',{name:'End & review',exact:true}).click();
  assert.equal(await page.evaluate(()=>db.visits.length),0);assert.equal(await page.evaluate(()=>db.guidedRitual.steps[0].actualMs),91000);
  assert.deepEqual(await page.evaluate(()=>db.guidedRitual.steps.map(s=>s.status)),['completed','skipped','completed','partial','pending','pending']);
  await page.locator('.guided-corrections summary').click();await page.locator('#guidedActual0').fill('1.5');await page.locator('#guidedActual0').press('Tab');
  await page.locator('#guidedNotes').fill('A calm partial ritual.');await page.getByRole('button',{name:'Save visit',exact:true}).click();
  assert.equal(await page.evaluate(()=>db.visits.length),1);const visit=await page.evaluate(()=>db.visits[0]);
  assert.equal(visit.ritual.steps[0].recordedMs,91000);assert.equal(visit.ritual.steps[0].actualMs,90000);assert.equal(visit.ritual.steps[0].corrected,true);
  assert.equal(visit.intervals.find(x=>x.type==='cold').durationMs,45000);
  await page.evaluate(()=>saveGuidedVisit());assert.equal(await page.evaluate(()=>db.visits.length),1);
  assert.equal(await page.evaluate(()=>{let backup;const original=downloadFile;downloadFile=content=>backup=content;try{exportJSON();return parseBackup(backup).visits[0].ritual.steps[0].recordedMs;}finally{downloadFile=original;}}),91000);
  await page.evaluate(()=>editVisit(db.visits[0].id));await page.locator('#guidedNotes').fill('Corrected reflection.');await page.getByRole('button',{name:'Update visit',exact:true}).click();
  assert.equal(await page.evaluate(()=>db.visits.length),1);assert.equal(await page.evaluate(()=>db.visits[0].notes),'Corrected reflection.');
});
test('storage failure preserves the temporary preview or committed review',async t=>{
  const page=await boot(t);await page.getByRole('button',{name:/Pure Sauna/}).click();
  await page.evaluate(()=>{const original=Storage.prototype.setItem;window.ritualFailWrites=true;Storage.prototype.setItem=function(k,v){if(window.ritualFailWrites&&k===KEY)throw Error('quota');return original.call(this,k,v);};});
  await page.getByRole('button',{name:'Start Ritual',exact:true}).click();assert.equal(await page.evaluate(()=>guidedPreview===null),true);
  assert.equal(await page.getByRole('dialog',{name:'Pure Sauna'}).isVisible(),true);
  await page.evaluate(()=>window.ritualFailWrites=false);await page.getByRole('button',{name:'Start Ritual',exact:true}).click();await page.clock.runFor(1000);
  await page.getByRole('button',{name:'End Ritual',exact:true}).click();await page.getByRole('button',{name:'End & review',exact:true}).click();
  await page.evaluate(()=>window.ritualFailWrites=true);await page.getByRole('button',{name:'Save visit',exact:true}).click();assert.equal(await page.evaluate(()=>db.visits.length),0);assert.equal(await page.evaluate(()=>db.guidedRitual.phase),'review');
  await page.evaluate(()=>window.ritualFailWrites=false);await page.getByRole('button',{name:'Save visit',exact:true}).click();assert.equal(await page.evaluate(()=>db.visits.length),1);
});
