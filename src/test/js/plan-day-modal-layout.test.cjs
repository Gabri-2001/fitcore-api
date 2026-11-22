'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'../../main/resources/static/fitcore-lab');
const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const css=fs.readFileSync(path.join(root,'styles.css'),'utf8');
const start=html.indexOf('<!-- CONFIGURACIÓN DEL DÍA · DOS MODOS EXCLUYENTES -->');
const end=html.indexOf('<!-- ANÁLISIS MUSCULAR DEL PLAN -->',start);
const modal=html.slice(start,end);

test('configure-day modal has a name and two mutually exclusive classification panels',()=>{
 assert.ok(start>0&&end>start);
 assert.match(modal,/id="plan-edit-day-name"/);
 assert.match(modal,/data-plan-edit-mode="auto"/);
 assert.match(modal,/data-plan-edit-mode="manual"/);
 assert.match(modal,/id="plan-edit-auto-panel"/);
 assert.match(modal,/id="plan-edit-manual-panel"[^>]+hidden/);
 assert.match(modal,/id="plan-edit-day-types"/);
 assert.match(modal,/id="plan-edit-classification-preview"/);
 assert.match(modal,/Aplicar cambios/);
});
test('administration is not in the modal, with duplicate/delete in the day-card menu',()=>{
 assert.doesNotMatch(modal,/plan-edit-day-management|plan-edit-duplicate|plan-edit-delete|plan-edit-move-up|plan-edit-move-down/);
 assert.match(app,/data-plan-day-actions/);
 assert.match(app,/data-day-menu-action="duplicate"/);
 assert.match(app,/data-day-menu-action="delete"/);
 assert.match(app,/duplicateSelectedPlanDay\(index\)/);
 assert.match(app,/deleteSelectedPlanDay\(index\)/);
});
test('both classification modes are independently controlled and preserve manual preference',()=>{
 const handler=app.slice(app.indexOf('function updatePlanEditTypeMode()'),app.indexOf('function applyPlanEditDraft()'));
 assert.match(handler,/automatic\?'auto':'manual'/);
 assert.match(handler,/plan-edit-auto-panel/);
 assert.match(handler,/plan-edit-manual-panel/);
 assert.match(handler,/input\.disabled=automatic/);
 assert.match(app,/day\.dayTypeManual=!automatic/);
 assert.match(app,/plan-edit-day-auto'\)\.checked=day\.dayTypeManual===false/);
});
test('day drag-and-drop orders card shells and retains keyboard-accessible menu buttons',()=>{
 assert.match(app,/class="plan-day-tab-shell"/);
 assert.match(app,/class="plan-day-actions-trigger"/);
 assert.match(app,/isDay \? '\.plan-day-tab-shell' : '\.exercise-editor'/);
 assert.match(app,/\? 'planDayIndex'/);
 assert.match(app,/aria-haspopup="menu"/);
 assert.match(app,/role="menu"/);
});
test('desktop modal has a bounded two-column layout and reserves overflow for small screens',()=>{
 assert.match(css,/#plan-edit-day-dialog\[open\] \{[^}]*width:min\(930px/);
 assert.match(css,/#plan-edit-day-dialog \.plan-edit-day-layout \{[^}]*grid-template-columns:minmax\(265px/);
 assert.match(css,/#plan-edit-day-dialog \.plan-edit-type-grid \{grid-template-columns:repeat\(4,/);
 assert.match(css,/@media \(max-width:800px\), \(max-height:560px\)/);
 assert.match(css,/#plan-edit-day-dialog \[hidden\] \{display:none!important;\}/);
});
