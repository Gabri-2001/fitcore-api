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
