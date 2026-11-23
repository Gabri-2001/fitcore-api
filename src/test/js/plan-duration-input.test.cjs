const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const base=path.resolve(__dirname,'../../main/resources/static/fitcore-lab');
const time=require(path.join(base,'plan-duration-input.js'));
const app=fs.readFileSync(path.join(base,'app.js'),'utf8');
const html=fs.readFileSync(path.join(base,'index.html'),'utf8');
const css=fs.readFileSync(path.join(base,'styles.css'),'utf8');

test('time goals format and parse as HH:MM:SS with seconds storage',()=>{
 for(const [seconds,value] of [[0,'00:00:00'],[1,'00:00:01'],[45,'00:00:45'],
     [60,'00:01:00'],[3600,'01:00:00'],[3750,'01:02:30'],[86400,'24:00:00'],[359999,'99:59:59']]){
   assert.equal(time.format(seconds),value);
   assert.equal(time.parse(value),seconds);
 }
});
test('invalid time syntax and out-of-range values are rejected',()=>{
 for(const value of ['','00:00','1:02:30','00:00:00x','00:60:00','00:00:60',
   '99:60:00','99:99:99','100:00:00','-1:00:00','abc']){
   assert.equal(time.parse(value),null,value);
 }
 assert.equal(time.isValidGoal('00:00:00'),false);
 assert.equal(time.isValidGoal('00:00:01'),true);
 assert.equal(time.isValidGoal('24:00:00'),true);
 assert.equal(time.format(-1),null);
 assert.equal(time.format(time.MAX_SECONDS+1),null);
});
test('duration controls step in seconds, handling minute and hour rollovers',()=>{
 assert.equal(time.step('00:00:59',1),'00:01:00');
 assert.equal(time.step('00:59:59',1),'01:00:00');
 assert.equal(time.step('00:01:00',-1),'00:00:59');
 assert.equal(time.step('00:00:01',-1),'00:00:01');
 assert.equal(time.step('99:59:59',1),'99:59:59');
 assert.equal(time.step('24:00:00',1),'24:00:01');
 assert.equal(time.step('00:XX:00',1),null);
});
test('input mask accepts only six digits and inserts separators without typing them',()=>{
 assert.equal(time.MAX_DIGITS,6);
 const examples=[
  ['','00:00:00'],['1','00:00:01'],['12','00:00:12'],
  ['123','00:01:23'],['1234','00:12:34'],
  ['12345','01:23:45'],['123456','12:34:56'],
  ['999999','99:59:59'],['9999999','99:59:59'],
  ['12:34:56','12:34:56'],['abc12x34x56x7','12:34:56']
 ];
 for(const [raw,expected] of examples)assert.equal(time.mask(raw),expected);
 assert.equal(time.parse(time.mask('999999')),time.MAX_SECONDS,
  'Typed values must never exceed the maximum valid duration');
 assert.equal(time.mask('606060'),'60:59:59');
 assert.equal(time.mask('005960'),'00:59:59');
});
test('mask editing handles typing, pasting, deletion and numeric maximum',()=>{
 const input={value:'00:00:45',setCustomValidity(message){this.error=message;},
  select(){this.selected=true;},setSelectionRange(){}};
 time.beginEdit(input);
 for(const digit of '99999999')time.edit(input,'insert',digit);
 assert.equal(input.value,'99:59:59');
 assert.equal(input.error,'');
 time.edit(input,'delete');
 assert.equal(input.value,'09:59:59');
 time.edit(input,'clear');
 time.edit(input,'insert','12:34:56');
 assert.equal(input.value,'12:34:56');
 assert.equal(time.parse(input.value),45296);
 assert.equal(input.error,'');
 time.endEdit(input);
});
test('press-and-hold steps immediately, repeats, and stops cleanly',()=>{
 let id=0;const tasks=new Map();
 const clock={
  setTimeout(fn,ms){const k=++id;tasks.set(k,{fn,ms,type:'timeout'});return k;},
  clearTimeout(k){tasks.delete(k);},
  setInterval(fn,ms){const k=++id;tasks.set(k,{fn,ms,type:'interval'});return k;},
  clearInterval(k){tasks.delete(k);}
 };
 const tick=type=>{const entry=[...tasks].find(([,task])=>task.type===type);
  assert.ok(entry,type+' should be scheduled');
  if(type==='timeout')tasks.delete(entry[0]);
  entry[1].fn();};
 let seconds=10;
 const button={dataset:{step:'1'}};
 const hold=time.createHoldController(()=>{seconds++;return seconds<13;},{clock});
 hold.start(button);
 assert.equal(seconds,11);
 assert.ok(hold.isActive(button));
 tick('timeout');
 assert.equal(seconds,12);
 tick('interval');
 assert.equal(seconds,13);
 assert.ok(!hold.isActive(button));
 assert.equal(tasks.size,0);
 hold.start(button); // new gesture
 assert.equal(seconds,14);
 hold.stop();
 assert.equal(tasks.size,0);
 assert.ok(!hold.isActive(button));
});
test('browser-style timers do not throw illegal invocation when held',()=>{
 const vm=require('node:vm');
 const tasks=new Map();
 let nextId=0;
 const schedule=(fn,type)=>{
  const id=++nextId;
  tasks.set(id,{fn,type});
  return id;
 };
 const clock={
  setTimeout:function(fn){'use strict';assert.equal(this,undefined);return schedule(fn,'timeout');},
  clearTimeout:function(id){'use strict';assert.equal(this,undefined);tasks.delete(id);},
  setInterval:function(fn){'use strict';assert.equal(this,undefined);return schedule(fn,'interval');},
  clearInterval:function(id){'use strict';assert.equal(this,undefined);tasks.delete(id);}
 };
 const context={...clock};
 vm.runInNewContext(fs.readFileSync(path.join(base,'plan-duration-input.js'),'utf8'),context);
 let count=0;
 const target={};
 const controller=context.FitCoreDurationInput.createHoldController(()=>{count++;return true;});
 controller.start(target);
 assert.equal(count,1);
 const timeout=[...tasks].find(([,value])=>value.type==='timeout');
 assert.ok(timeout,'the browser delay must be scheduled');
 tasks.delete(timeout[0]);
 timeout[1].fn();
 assert.equal(count,2);
 const interval=[...tasks].find(([,value])=>value.type==='interval');
 assert.ok(interval,'continuous repetition must start');
 interval[1].fn();
 assert.equal(count,3);
 controller.stop();
 assert.equal(tasks.size,0);
});
test('delegated pointer controls continue stepping while held and stop on release',()=>{
 let nextId=0;
 const timers=new Map();
 const clock={
  setTimeout(fn,delay){const id=++nextId;timers.set(id,{fn,delay,repeat:false});return id;},
  clearTimeout(id){timers.delete(id);},
  setInterval(fn,delay){const id=++nextId;timers.set(id,{fn,delay,repeat:true});return id;},
  clearInterval(id){timers.delete(id);}
 };
 const listeners=()=>new Map();
 const listen=(target,name,handler)=>{
  if(!target.handlers.has(name))target.handlers.set(name,[]);
  target.handlers.get(name).push(handler);
 };
 const fire=(target,name,event={})=>
  (target.handlers.get(name)||[]).forEach(fn=>fn(event));
 const win={handlers:listeners(),addEventListener(name,fn){listen(win,name,fn);}};
 const doc={handlers:listeners(),hidden:false,defaultView:win,
  addEventListener(name,fn){listen(doc,name,fn);}};
 const root={handlers:listeners(),ownerDocument:doc,
  addEventListener(name,fn){listen(root,name,fn);},
  contains(button){return button===btn;}};
 const btn={captures:new Set(),
  closest(selector){return selector.includes('durationSeconds')?this:null;},
  setPointerCapture(id){this.captures.add(id);},
  hasPointerCapture(id){return this.captures.has(id);},
  releasePointerCapture(id){this.captures.delete(id);}};
 let count=0;
 const binder=time.bindHoldButtons(root,()=>{count++;return true;},{clock});
 const event={target:btn,button:0,isPrimary:true,pointerId:3,
  preventDefault(){this.prevented=true;}};
 fire(root,'pointerdown',event);
 assert.ok(event.prevented);
 assert.ok(btn.captures.has(3));
 assert.equal(count,1);
 const runTimer=type=>{
  const entry=[...timers].find(([,timer])=>timer.repeat===type);
  assert.ok(entry,'expected '+(type?'interval':'delay'));
  if(!type)timers.delete(entry[0]);
  entry[1].fn();
 };
 runTimer(false);
 assert.equal(count,2);
 runTimer(true);
 runTimer(true);
 assert.equal(count,4);
 fire(doc,'pointerup',{pointerId:3});
 assert.equal(timers.size,0);
 assert.equal(btn.captures.size,0);
 assert.ok(!binder.isActive());
 // A fresh press can run again without stale click-consumption markers.
 fire(root,'pointerdown',{...event,pointerId:4});
 assert.equal(count,5);
 fire(doc,'pointercancel',{pointerId:4});
 assert.equal(timers.size,0);
});
test('both plan editor and exercise picker use HH:MM:SS without changing API seconds',()=>{
 assert.match(html,/plan-duration-input\.js/);
 assert.match(html,/id="plan-picker-duration" type="text"/);
 assert.match(html,/placeholder="00:00:00"/);
 assert.match(app,/function planTimedStepper\(seconds\)/);
 assert.match(app,/data-exercise-durationSeconds type="text"/);
 assert.match(app,/FitCoreDurationInput\.parse\(durationField\.value\)/);
 assert.match(app,/targetDurationSeconds=seconds/);
 assert.match(app,/targetDurationSeconds:e\.targetDurationSeconds/);
 assert.match(app,/FitCoreDurationInput\.step\(input\.value/);
 assert.ok(app.includes('function bindPlanDurationMask()'));
 assert.ok(app.includes('FitCoreDurationInput.beginEdit(event.target)'));
 assert.ok(app.includes("FitCoreDurationInput.edit(input,'insert'"));
 assert.ok(app.includes('bindPlanDurationMask();'));
 assert.ok(app.includes("FitCoreDurationInput.bindHoldButtons($('plan-days'),stepPlanDuration)"));
 assert.ok(app.includes('if(event.detail===0)stepPlanDuration(button)'));
 assert.ok(app.includes("if(next===input.value)return false"));
 assert.match(css,/plan-time-stepper/);
});
test('consolidated classification badge does not appear for manual or provisional days',()=>{
 const fn=app.slice(app.indexOf('function consolidatedDayBadge(day){'),
    app.indexOf('function planDayLabel(day){'));
 assert.match(fn,/dayTypeManual!==false/);
 assert.match(fn,/classification\.provisional/);
 assert.match(fn,/!day\.classification\.structure/);
 assert.match(app,/plan-day-type-slot/);
});
