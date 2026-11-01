// Authored for the authorized testing batch; not run during implementation.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
const source=html.split('// BEGIN GUIDED RITUAL CORE\n')[1].split('// END GUIDED RITUAL CORE')[0];
const context=vm.createContext({structuredClone,Date,Math,Object,Number,Set,Error});
vm.runInContext(source,context);
const R=context.OloRituals;
let serial=0;
const uuid=()=>`step-${++serial}`;
const create=preset=>R.create(preset,'ritual-session',uuid);
const plain=value=>JSON.parse(JSON.stringify(value));

test('four immutable presets have the requested sequence and planned durations',()=>{
  assert.deepEqual(plain(R.templates.map(t=>[t.id,t.steps.length,R.plannedMs(t)])),[
    ['mindful-reset',3,1140000],['first-dip',3,630000],['nordic-contrast',6,2130000],['pure-sauna',2,960000]
  ]);
  assert.equal(Object.isFrozen(R.templates),true);
  for(const template of R.templates){assert.equal(Object.isFrozen(template),true);assert.equal(Object.isFrozen(template.steps[0]),true);}
  const copy=create('mindful-reset');copy.steps[0].plannedMs=30000;
  assert.equal(R.templates[0].steps[0].plannedMs,480000);
  assert.equal(copy.phase,'preview');assert.equal(copy.runningSince,null);assert.equal(copy.startedAt,null);
});
test('timestamp timing survives JSON recovery and excludes every paused segment',()=>{
  let s=R.transition(create('pure-sauna'),'start',1000);
  assert.equal(R.elapsed(s,121000),120000);
  s=R.transition(s,'pause',121000);assert.equal(R.elapsed(s,900000),120000);
  s=R.transition(JSON.parse(JSON.stringify(s)),'resume',1000000);
  assert.equal(R.elapsed(s,1030000),150000);
  s=R.transition(s,'complete',1030000);
  assert.equal(s.steps[0].actualMs,150000);assert.equal(s.steps[0].recordedMs,150000);
  assert.deepEqual(plain(s.steps[0].segments),[{startedAt:1000,endedAt:121000},{startedAt:1000000,endedAt:1030000}]);
  assert.equal(s.cursor,1);assert.equal(s.runningSince,1030000);
});
test('passing zero never advances and actual duration can exceed planned duration',()=>{
  const s=R.transition(create('pure-sauna'),'start',1000);
  assert.equal(R.elapsed(s,601000),600000);assert.equal(s.cursor,0);assert.equal(s.phase,'active');
  const ended=R.transition(s,'end',601000);
  assert.equal(ended.steps[0].plannedMs,480000);assert.equal(ended.steps[0].actualMs,600000);
  assert.equal(ended.steps[0].status,'partial');assert.equal(ended.steps[1].status,'pending');
});
test('cold cannot auto-start or complete before explicit confirmation',()=>{
  let s=R.transition(create('nordic-contrast'),'start',1000);
  s=R.transition(s,'complete',2000);s=R.transition(s,'complete',3000);
  assert.equal(s.steps[s.cursor].activity,'cold');assert.equal(s.awaitingCold,true);
  assert.equal(s.runningSince,null);assert.equal(s.steps[s.cursor].startedAt,null);
  assert.equal(R.elapsed(s,900000),0);
  assert.equal(R.transition(s,'resume',4000).runningSince,null);
  assert.equal(R.transition(s,'complete',4000).cursor,2);
  s=R.transition(s,'confirmCold',5000);assert.equal(s.runningSince,5000);
  assert.equal(R.elapsed(s,35000),30000);
});
test('a customized first cold step also waits; skipping it records no exposure',()=>{
  let s=create('pure-sauna');s.steps[0].activity='cold';s=R.transition(s,'start',1000);
  assert.equal(s.awaitingCold,true);s=R.transition(s,'skip',60000);
  assert.equal(s.steps[0].status,'skipped');assert.equal(s.steps[0].actualMs,0);
  assert.equal(s.steps[0].startedAt,null);assert.equal(R.intervals(s).length,0);
});
test('partial rituals retain actual time in a skipped step and unstarted steps',()=>{
  let s=R.transition(create('mindful-reset'),'start',1000);
  s=R.transition(s,'skip',31000);s=R.transition(s,'end',61000);
  assert.deepEqual(plain(s.steps.map(x=>[x.status,x.actualMs])),[['skipped',30000],['partial',30000],['pending',0]]);
  const record=R.record(s);assert.equal(R.validRecord(record),true);
  assert.equal(R.actualMs(record),60000);assert.equal(R.intervals(record).length,2);
});
test('completed records snapshot plans and preserve measured time through correction',()=>{
  let s=R.transition(create('first-dip'),'start',1000);
  s=R.transition(s,'complete',301000);s=R.transition(s,'complete',601000);s=R.transition(s,'complete',631000);
  const record=R.record(s);assert.equal(R.validRecord(record),true);
  assert.equal(record.steps[2].activity,'coolDown');assert.equal(R.intervals(record)[2].type,'rest');
  s.steps[0].plannedMs=30000;assert.equal(record.steps[0].plannedMs,300000);
  record.steps[0].actualMs=240000;record.steps[0].corrected=true;
  assert.equal(record.steps[0].recordedMs,300000);assert.equal(R.intervals(record)[0].durationMs,240000);
  assert.equal(R.validRecord(JSON.parse(JSON.stringify(record))),true);
});
test('restore uses the session template snapshot and leaves prior session copies intact',()=>{
  const s=create('pure-sauna');s.intention='Rest';s.steps.reverse();s.steps[0].plannedMs=30000;
  const restored=R.restore(s,uuid);
  assert.equal(restored.id,s.id);assert.equal(restored.intention,'Rest');
  assert.deepEqual(plain(restored.steps.map(x=>[x.activity,x.plannedMs])),[['sauna',480000],['rest',480000]]);
  assert.equal(s.steps[0].plannedMs,30000);
});
test('backward clock changes flag uncertainty and never create negative durations',()=>{
  let s=R.transition(create('pure-sauna'),'start',10000);
  s=R.transition(s,'pause',20000);s=R.transition(s,'resume',1000);s=R.transition(s,'end',5000);
  assert.equal(s.steps[0].actualMs,10000);assert.equal(s.steps[0].uncertain,true);
  assert.equal(R.validRecord(R.record(s)),true);
});
test('unknown activities, invalid durations and duplicate step IDs cannot enter saved records',()=>{
  const s=R.record(R.transition(R.transition(create('pure-sauna'),'start',1000),'end',2000));
  s.steps[0].actualMs=-1;assert.equal(R.validRecord(s),false);s.steps[0].actualMs=1000;
  s.steps[0].activity='unknown';assert.equal(R.validRecord(s),false);s.steps[0].activity='sauna';
  s.steps[1].id=s.steps[0].id;assert.equal(R.validRecord(s),false);
});
