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
  ['999999','99:99:99'],['9999999','99:99:99'],
  ['12:34:56','12:34:56'],['abc12x34x56x7','12:34:56']
 ];
 for(const [raw,expected] of examples)assert.equal(time.mask(raw),expected);
 assert.equal(time.parse(time.mask('999999')),null,
  '99:99:99 can be entered, but cannot be saved as a real duration');
});
test('mask editing handles typing, pasting, deletion and numeric maximum',()=>{
 const input={value:'00:00:45',setCustomValidity(message){this.error=message;},
  select(){this.selected=true;},setSelectionRange(){}};
 time.beginEdit(input);
 for(const digit of '99999999')time.edit(input,'insert',digit);
 assert.equal(input.value,'99:99:99');
 assert.match(input.error,/99:59:59/);
 time.edit(input,'delete');
 assert.equal(input.value,'09:99:99');
 time.edit(input,'clear');
 time.edit(input,'insert','12:34:56');
 assert.equal(input.value,'12:34:56');
 assert.equal(time.parse(input.value),45296);
 assert.equal(input.error,'');
 time.endEdit(input);
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
