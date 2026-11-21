const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const base=path.resolve(__dirname,'../../main/resources/static/fitcore-lab');
const wheel=require(path.join(base,'rest-wheel.js'));
const html=fs.readFileSync(path.join(base,'index.html'),'utf8');
const app=fs.readFileSync(path.join(base,'app.js'),'utf8');
const styles=fs.readFileSync(path.join(base,'styles.css'),'utf8');

test('descanso initially apagado, 5 s increments through 2 min, then 15 s',()=>{
 const values=wheel.options();
 assert.equal(values[0],0);
 assert.deepEqual(values.slice(0,5),[0,5,10,15,20]);
 assert.deepEqual(values.filter(v=>v>=105&&v<=165),[105,110,115,120,135,150,165]);
 assert.equal(values.at(-1),3600);
 assert.ok(values.every((v,i)=>i===0||v>values[i-1]));
});
test('duration is expressed in minutes once threshold is reached',()=>{
 assert.equal(wheel.label(0),'Apagado');
 assert.equal(wheel.label(5),'5 s');
 assert.equal(wheel.label(55),'55 s');
 assert.equal(wheel.label(60),'1 min');
 assert.equal(wheel.label(90),'1 min 30 s');
 assert.equal(wheel.label(120),'2 min');
 assert.equal(wheel.label(135),'2 min 15 s');
});
test('saved historical duration remains available without silent rounding',()=>{
 assert.equal(wheel.options(92).includes(92),true);
 assert.equal(wheel.nearest(92,wheel.options(92)),92);
 assert.equal(wheel.nearest(121),120);
});
test('rest UI reuses modal and existing PATCH persistence',()=>{
 assert.match(html,/id="rest-settings-dialog" class="compact-dialog rest-wheel-dialog"/);
 assert.match(html,/id="rest-wheel-list"/);
 assert.match(html,/id="rest-selected-seconds"/);
 assert.ok(html.indexOf('rest-wheel.js')<html.indexOf('src="./app.js"'));
 assert.match(app,/restWheelSelected/);
 assert.match(app,/updateRestWheelFromScroll/);
 assert.match(app,/workout-sessions\/\$\{state.auth.userId\}\/exercises/);
 assert.match(app,/restSeconds:restWheelSelected|const restSeconds=restWheelSelected/);
 assert.doesNotMatch(html,/id="rest-minutes"|id="rest-seconds"/);
 assert.match(styles,/scroll-snap-type:y mandatory/);
});
test('mobile numeric entry selects prior value and accepts decimal comma',()=>{
 assert.match(app,/inputmode="decimal"/);
 assert.match(app,/inputmode="numeric"/);
 assert.match(app,/input\.select\(\)/);
 assert.match(app,/replace\(',', '\.'\)/);
 assert.match(app,/event.key==='Enter'/);
 assert.match(app,/syncRpeFromRir/);
});
