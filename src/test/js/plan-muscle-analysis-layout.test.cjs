'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const base=path.resolve(__dirname,'../../main/resources/static/fitcore-lab');
const html=fs.readFileSync(path.join(base,'index.html'),'utf8');
const app=fs.readFileSync(path.join(base,'app.js'),'utf8');
const css=fs.readFileSync(path.join(base,'styles.css'),'utf8');
const begin=html.indexOf('<!-- ANÁLISIS MUSCULAR DEL PLAN -->');
const end=html.indexOf('</dialog>',begin);
const modal=html.slice(begin,end);

test('muscle analysis preserves IDs and existing day/week interactions',()=>{
 assert.ok(begin>0&&end>begin);
 for(const id of ['plan-muscle-dialog','plan-muscle-day-select','plan-muscle-day-picker',
   'plan-muscle-map','plan-muscle-legend','plan-muscle-analysis-title',
   'plan-muscle-analysis-summary','plan-muscle-analysis-list']){
   assert.ok(modal.includes('id="'+id+'"'),id+' missing');
 }
 assert.match(modal,/data-plan-muscle-scope="day"/);
 assert.match(modal,/data-plan-muscle-scope="week"/);
 assert.match(app,/makePlanMuscleSvg\(result, scope\)/);
 assert.match(app,/calculatePlanMuscles\(\s*scope,\s*index\s*\)/);
});
test('dashboard has real dynamic metrics, not hardcoded illustration numbers',()=>{
 for(const id of ['plan-muscle-stat-exercises','plan-muscle-stat-sets',
   'plan-muscle-stat-muscles']){
   assert.ok(modal.includes('id="'+id+'"'));
   assert.ok(app.includes("'"+id+"').textContent=String("),id+' not bound');
 }
 assert.match(modal,/plan-muscle-figure-main/);
 assert.match(modal,/plan-muscle-figure-sidebar/);
 assert.match(modal,/plan-muscle-target-icon/);
 assert.match(css,/grid-template-columns:minmax\(0,1\.16fr\) minmax\(0,1fr\)/);
 assert.match(css,/@media \(max-width:950px\)/);
});
test('muscle counts do not pose as exclusive percentages',()=>{
 assert.match(app,/item\.estimatedSets \/ max \* 100/);
 assert.match(app,/series eq\./);
 assert.match(modal,/barras comparan cada músculo con el de mayor valor/);
 assert.match(modal,/no son porcentajes del entrenamiento/);
 assert.doesNotMatch(modal,/3 series \(50 %\)|\(≥ 60 % del trabajo\)/);
});
test('primary secondary anatomical semantics and weekly relative intensity remain intact',()=>{
 assert.match(app,/item\.primarySets \+/);
 assert.match(app,/item\.secondarySets \* 0\.5/);
 assert.match(app,/scope === 'week'/);
 assert.match(app,/node\.dataset\.planMuscleLevel/);
 assert.match(app,/node\.dataset\.fitcoreRole = item\.role/);
 assert.match(modal,/Músculos identificados/);
 assert.match(modal,/activación EMG, hipertrofia ni fatiga reales/);
});

test('metric icons describe exercises, planned sets and muscles distinctly',()=>{
 for(const type of ['exercises','sets','muscles']){
   const opening='<div class="plan-muscle-stat" data-stat="'+type+'">';
   const start=modal.indexOf(opening);
   assert.ok(start>0,opening);
   const end=modal.indexOf('</div>',start);
   const block=modal.slice(start,end);
   assert.match(block,/class="plan-muscle-stat-icon"/);
   assert.match(block,/viewBox="0 0 24 24"/);
   assert.match(block,/stroke-width="1\.9"/);
 }
 const beginStats=modal.indexOf('class="plan-muscle-figure-sidebar"');
 const endStats=modal.indexOf('class="plan-muscle-legend-wrap"',beginStats);
 const stats=modal.slice(beginStats,endStats);
 assert.doesNotMatch(stats,/M12 7v5l3 2/); // old clock was not a muscle icon
 assert.match(stats,/M12\.409 13\.017/); // anatomical biceps glyph
 assert.match(stats,/M13 5h8M13 12h8/); // series checklist
 assert.match(stats,/M17\.596 12\.768/); // dumbbell
 assert.match(css,/#plan-muscle-dialog \.plan-muscle-stat-icon/);
 assert.match(css,/#plan-muscle-dialog \.plan-muscle-stat-copy/);
});
