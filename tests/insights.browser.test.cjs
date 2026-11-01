const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{chromium}=require('playwright');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
for(const width of [320,390,768,1280])test('Insights derives real metrics, filters dates, preserves data and fits '+width+'px',async t=>{
 const browser=await chromium.launch({headless:true});t.after(()=>browser.close());const page=await browser.newPage({viewport:{width,height:1000},reducedMotion:'reduce'}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',r=>r.request().url()==='http://olo-insights.test/'?r.fulfill({contentType:'text/html',body:html}):r.abort());
 await page.clock.install({time:new Date('2026-10-29T12:00:00')});
 await page.addInitScript(()=>localStorage.setItem('loyly-journal-v1',JSON.stringify({profile:{goal:3,appearance:{dailyIntro:false}},visits:[]})));
 await page.goto('http://olo-insights.test/');
 await page.evaluate(()=>{const mk=(id,date,heat,before,after,response)=>({id,date,source:'manual',intervals:[{type:'sauna',durationMs:heat*60000},{type:'cold',durationMs:120000},{type:'rest',durationMs:300000}],moodBefore:before,moodAfter:after,intention:'Rest',intentionResponse:response});db.visits=[mk('a','2026-10-29',10,2,4,'Yes'),mk('b','2026-10-29',20,4,4,'Somewhat'),mk('c','2026-10-20',30,4,2,'Not today'),mk('d','2026-10-10',40,null,4,null),mk('old','2026-09-01',999,1,5,'Yes'),mk('future','2026-12-01',999,1,5,'Yes')];insightPeriod='fourweeks';nav('insights')});
 const snapshot=await page.evaluate(()=>JSON.stringify(db));
 if([390,1280].includes(width)){await page.addStyleTag({content:'.bottom-nav{visibility:hidden!important}'});for(const area of ['rhythm','feel','ritual']){await page.evaluate(area=>{insightArea=area;renderInsights()},area);await page.locator('#page-insights').screenshot({path:path.join(__dirname,'../../insights-'+area+'-'+width+'.png')})}await page.evaluate(()=>{insightArea='rhythm';renderInsights()})}
 assert.deepEqual(await page.locator('#page-insights .stat-number').allTextContents(),['3','100','8']);
 await page.getByRole('button',{name:'How I feel',exact:true}).click();assert.equal(await page.getByRole('button',{name:'How I feel',exact:true}).getAttribute('aria-pressed'),'true');assert.match(await page.locator('#insightPanel').innerText(),/3 paired mood entries out of 4/);assert.match(await page.locator('#insightPanel').innerText(),/Average before\s+3.3/);assert.match(await page.locator('#insightPanel').innerText(),/Average after\s+3.3/);
 for(const label of ['Felt better','Felt the same','Felt lower'])assert.match(await page.locator('.insight-row').filter({hasText:label}).innerText(),/1 visits/);
 await page.getByRole('button',{name:'My rituals',exact:true}).click();assert.match(await page.locator('.insight-row').filter({hasText:'Median recorded visit time'}).innerText(),/32 min/);assert.match(await page.locator('.insight-row').filter({hasText:'Median sauna round'}).innerText(),/25 min/);assert.match(await page.locator('.insight-row').filter({hasText:'Rest',exact:false}).first().innerText(),/20 min/);
 for(const area of ['My rhythm','How I feel','My rituals']){await page.getByRole('button',{name:area,exact:true}).click();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true)}
 await page.getByRole('button',{name:'Week',exact:true}).click();assert.deepEqual(await page.locator('#page-insights .stat-number').allTextContents(),['1','30','4']);
 await page.getByRole('button',{name:'Year',exact:true}).click();assert.deepEqual(await page.locator('#page-insights .stat-number').allTextContents(),['4','1099','10']);
 await page.evaluate(()=>{insightWeekStart='2026-10-18';insightPeriod='week';insightArea='rhythm';renderInsights()});assert.deepEqual(await page.locator('#page-insights .stat-number').allTextContents(),['1','30','2']);assert.match(await page.locator('#insightPanel').innerText(),/Selected week/);
 await page.getByRole('button',{name:'Day',exact:true}).click();assert.deepEqual(await page.locator('#page-insights .stat-number').allTextContents(),['1','30','4']);
 await page.getByRole('button',{name:'Switch to original Insights',exact:true}).click();assert.equal(await page.getByRole('button',{name:'Switch to experimental Insights',exact:true}).count(),1);assert.match(await page.locator('#page-insights').innerText(),/How you felt/);assert.deepEqual(await page.locator('#page-insights .stat-number').allTextContents(),['100','30','4','+1.0']);
 await page.getByRole('button',{name:'Months',exact:true}).click();await page.getByRole('button',{name:'Switch to experimental Insights',exact:true}).click();assert.equal(await page.locator('#insightPanel').count(),1);
 assert.equal(await page.evaluate(()=>JSON.stringify(db)),snapshot);
 await page.evaluate(()=>{db.visits=[];renderInsights()});for(const area of ['My rhythm','How I feel','My rituals']){await page.getByRole('button',{name:area,exact:true}).click();assert.doesNotMatch(await page.locator('#page-insights').innerText(),/NaN|Infinity/)}
 assert.deepEqual(errors,[]);
 if([390,1280].includes(width)){await page.evaluate(()=>{insightArea='rhythm';renderInsights()});await page.locator('#page-insights').screenshot({path:path.join(__dirname,'../../insights-empty-'+width+'.png')})}
});
