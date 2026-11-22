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
test('configure day retains duplicate/delete with confirmation and the card overflow menu',()=>{
 assert.match(modal,/data-plan-edit-duplicate/);
 assert.match(modal,/data-plan-edit-delete/);
 assert.doesNotMatch(modal,/plan-edit-day-management|plan-edit-move-up|plan-edit-move-down/);
 assert.match(app,/function duplicateDayFromSettings\(\)/);
 assert.match(app,/function deleteDayFromSettings\(\)/);
 assert.match(app,/if\(!confirmed\)return;\s*\$\('plan-edit-day-dialog'\)\.close\(\)/);
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

const newStart=html.indexOf('<!-- AÑADIR DÍA · MISMO DISEÑO Y MODOS QUE CONFIGURAR DÍA -->');
const newEnd=html.indexOf('<!-- CONFIGURACIÓN DEL DÍA · DOS MODOS EXCLUYENTES -->',newStart);
const newDayModal=html.slice(newStart,newEnd);

test('add day mirrors configure day with separate automatic and manual panels',()=>{
 assert.ok(newStart>=0&&newEnd>newStart);
 assert.match(newDayModal,/id="plan-new-day-name"/);
 assert.match(newDayModal,/data-plan-new-mode="auto"/);
 assert.match(newDayModal,/data-plan-new-mode="manual"/);
 assert.match(newDayModal,/id="plan-new-auto-panel"/);
 assert.match(newDayModal,/id="plan-new-manual-panel"[^>]+hidden/);
 assert.match(newDayModal,/id="plan-new-day-types"/);
 assert.match(newDayModal,/Añadir día/);
 assert.doesNotMatch(newDayModal,/id="plan-new-day-type"\s+disabled/);
});

test('adding a day keeps the selected manual type and auto flag',()=>{
 assert.match(app,/function updatePlanNewDayTypeMode\(\)/);
 assert.match(app,/function planDayTypeOptions\(inputName, selectedType='FULL_BODY'\)/);
 assert.match(app,/\$\('plan-new-day-auto'\)\.checked=button\.dataset\.planNewMode==='auto'/);
 assert.match(app,/dayTypeManual:!automatic/);
 assert.match(app,/const dayType=automatic\?'FULL_BODY':selected\?\.value/);
 assert.match(app,/addPlanDay\(\{name,dayType,dayTypeManual:!automatic,exercises:\[\]\}\)/);
 assert.match(app,/plan-new-day-form'\)\.addEventListener/);
});

test('configure-day secondary actions preserve edit changes for duplicate and confirm deletion',()=>{
 const duplicate=app.slice(app.indexOf('function duplicateDayFromSettings()'),app.indexOf('function moveSelectedPlanDay('));
 const remove=app.slice(app.indexOf('async function deleteSelectedPlanDay('),app.indexOf('function planPayload()'));
 assert.match(duplicate,/if\(!applyPlanEditDraft\(\)\)return/);
 assert.match(duplicate,/duplicateSelectedPlanDay\(index\)/);
 assert.match(duplicate,/await confirmAction\(/);
 assert.match(remove,/if\(confirmed\)removePlanDayAt\(index\)/);
 assert.match(app,/querySelector\('\[data-plan-edit-duplicate\]'\)/);
 assert.match(app,/querySelector\('\[data-plan-edit-delete\]'\)/);
});

test('new-day dialog uses the compact matching layout on desktops and remains responsive',()=>{
 assert.match(css,/#plan-new-day-dialog\[open\]\{[^}]*width:min\(930px/);
 assert.match(css,/#plan-new-day-dialog \.plan-edit-day-layout\{[^}]*grid-template-columns:minmax\(265px/);
 assert.match(css,/#plan-new-day-dialog \.plan-edit-type-grid\{[^}]*repeat\(4,/);
 assert.match(css,/#plan-new-day-dialog \[hidden\]\{display:none!important;\}/);
 assert.match(css,/#plan-edit-day-dialog \.plan-edit-day-extra-actions/);
 assert.match(css,/@media \(max-width:800px\), \(max-height:560px\)/);
});
