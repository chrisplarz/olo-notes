const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm'),fs=require('node:fs');
const html=fs.readFileSync('index.html','utf8');
function setup(saved=null){
 const c=vm.createContext({structuredClone,Date,Math,Object,Number,Set,Error});
 vm.runInContext(html.split('// BEGIN GUIDED RITUAL CORE\n')[1].split('// END GUIDED RITUAL CORE')[0],c);
 vm.runInContext(`let db={guidedRitual:${JSON.stringify(saved)}};let writes=0,serial=0;const id=()=>String(++serial);const renderSessionArea=()=>{},guidedFocus=()=>{},guidedRenderFocus=()=>{};const guidedFresh=()=>true;const persist=()=>{writes++;return true};const esc=s=>s,icon=()=>'',guidedHeading=()=>'',guidedThumb=()=>'',guidedTime=()=>'';`,c);
 const ui=html.split('// BEGIN GUIDED RITUAL UI')[1];
 for(const name of ['guidedCurrent','guidedSlot','guidedCommit','chooseGuidedPreset','guidedAdjust','guidedField','startGuidedRitual']){
 const start=ui.indexOf('function '+name+'('),end=ui.indexOf('\nfunction ',start+1);vm.runInContext(ui.slice(start,end),c);
 }
 vm.runInContext("let guidedPreview=null,guidedEditHidden=false,guidedShowList=false,guidedRecovery=false;",c);return c;
}
test('preview and adjustments never persist; returning preserves original draft and reopening always works',()=>{
 const c=setup({phase:'preview',name:'Legacy preview'});
 const before=vm.runInContext('JSON.stringify(db)',c);
 for(let i=0;i<4;i++){
 vm.runInContext("chooseGuidedPreset('mindful-reset');guidedAdjust(0,30000);guidedField('intention','Rest');",c);
 assert.equal(vm.runInContext('guidedCurrent().phase',c),'preview');
 vm.runInContext('guidedPreview=null;guidedShowList=true',c);
 assert.equal(vm.runInContext('guidedCurrent()',c),null);
 assert.equal(vm.runInContext('JSON.stringify(db)',c),before);
 assert.equal(vm.runInContext('writes',c),0);
 }
});
test('explicit Start Ritual persists the actual session and clears preview',()=>{
 const c=setup();vm.runInContext("chooseGuidedPreset('pure-sauna');startGuidedRitual()",c);
 assert.equal(vm.runInContext('writes',c),1);
 assert.equal(vm.runInContext('guidedPreview',c),null);
 assert.equal(vm.runInContext('db.guidedRitual.phase',c),'active');
});
