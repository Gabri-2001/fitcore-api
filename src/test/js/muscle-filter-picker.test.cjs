'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const dir=path.resolve(__dirname,'../../main/resources/static/fitcore-lab');
const icons=require(path.join(dir,'muscle-picker-icons.js'));
const app=fs.readFileSync(path.join(dir,'app.js'),'utf8');
const html=fs.readFileSync(path.join(dir,'index.html'),'utf8');
const css=fs.readFileSync(path.join(dir,'styles.css'),'utf8');

test('every catalog muscle group has a distinct vector anatomical highlight',()=>{
 const expected=['CHEST','BACK','SHOULDERS','SCAPULAR','ROTATOR_CUFF','BICEPS',
  'TRICEPS','FOREARMS','QUADRICEPS','HAMSTRINGS','GLUTES','ADDUCTORS',
  'CALVES','CORE','NECK','FULL_BODY'];
 assert.deepEqual([...icons.CODES],expected);
 const highlights=[];
 for(const code of expected){
  const svg=icons.icon(code);
  assert.match(svg,/^<svg /);
  assert.match(svg,/viewBox="0 0 64 64"/);
  assert.match(svg,/aria-hidden="true"/);
  assert.match(svg,/<g class="mi-active">/);
  assert.match(svg,/<g class="mi-outline">/);
  highlights.push(svg.match(/<g class="mi-active">([\s\S]*?)<\/g>/)[1]);
 }
 assert.equal(new Set(highlights).size,16);
 assert.match(icons.icon(''),/mi-accent/);
});
test('muscle filter uses custom listbox yet keeps native select as source of truth',()=>{
 assert.match(html,/id="session-muscle-filter-button"/);
 assert.match(html,/id="session-muscle-filter-list"[\s\S]*?role="listbox"/);
 assert.match(html,/id="session-exercise-muscle" class="muscle-filter-native"/);
 assert.match(html,/muscle-picker-icons\.js" defer/);
 assert.ok(html.indexOf('muscle-picker-icons.js')<html.indexOf('app.js'));
 assert.match(app,/function initializeMuscleFilter\(\)/);
 assert.match(app,/initializeMuscleFilter\(\);/);
 assert.match(app,/native\.dispatchEvent\(new Event\('change',\{bubbles:true\}\)\)/);
 assert.match(app,/muscle: \$\('session-exercise-muscle'\)\?\.value \|\| ''/);
 assert.match(css,/\.muscle-filter-option\[aria-selected="true"\]/);
 assert.match(css,/\.muscle-filter-menu\[hidden\]/);
});
test('keyboard and dismiss patterns are preserved in the filter',()=>{
 assert.match(app,/event\.key==='ArrowDown'/);
 assert.match(app,/event\.key==='ArrowUp'/);
 assert.match(app,/event\.key==='Home'/);
 assert.match(app,/event\.key==='End'/);
 assert.match(app,/event\.key==='Escape'/);
 assert.match(app,/event\.key==='Tab'/);
 assert.match(app,/close\(true\)/);
 assert.match(app,/menu\.hidden=true/);
});
test('svg helper never interpolates an unsafe CSS class',()=>{
 assert.throws(()=>icons.icon('CHEST',{className:'x" onload="alert(1)'}),TypeError);
});
