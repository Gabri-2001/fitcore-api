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
     [60,'00:01:00'],[3600,'01:00:00'],[3750,'01:02:30'],[86400,'24:00:00']]){
   assert.equal(time.format(seconds),value);
   assert.equal(time.parse(value),seconds);
 }
});
test('invalid time syntax and out-of-range values are rejected',()=>{
 for(const value of ['','00:00','1:02:30','00:00:00x','00:60:00','00:00:60',
   '25:00:00','24:00:01','99:59:59','-1:00:00','abc']){
   assert.equal(time.parse(value),null,value);
 }
 assert.equal(time.isValidGoal('00:00:00'),false);
 assert.equal(time.isValidGoal('00:00:01'),true);
 assert.equal(time.isValidGoal('24:00:00'),true);
 assert.equal(time.format(-1),null);
 assert.equal(time.format(86401),null);
});
test('duration controls step in seconds, handling minute and hour rollovers',()=>{
 assert.equal(time.step('00:00:59',1),'00:01:00');
 assert.equal(time.step('00:59:59',1),'01:00:00');
 assert.equal(time.step('00:01:00',-1),'00:00:59');
 assert.equal(time.step('00:00:01',-1),'00:00:01');
 assert.equal(time.step('24:00:00',1),'24:00:00');
 assert.equal(time.step('00:XX:00',1),null);
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
