'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'../../main/resources/static/fitcore-lab');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
const css=fs.readFileSync(path.join(root,'styles.css'),'utf8');
const start=html.indexOf('<dialog id="plan-settings-dialog"');
const end=html.indexOf('</dialog>',start);
const modal=html.slice(start,end);

test('plan settings preserves original field and control identifiers',()=>{
 assert.ok(start>0&&end>start);
 for(const id of ['plan-settings-dialog','plan-settings-form','plan-name',
     'plan-description','plan-date','plan-version','plan-load']){
   assert.ok(modal.includes('id="'+id+'"'),'missing '+id);
 }
 assert.match(modal,/type="submit"[^>]*>Aplicar cambios/);
 assert.match(modal,/data-close-plan-settings/);
});
test('configuration layout follows two-column approved mockup',()=>{
 assert.match(modal,/class="plan-settings-heading-icon"/);
 assert.match(modal,/class="plan-settings-body"/);
 assert.match(modal,/class="plan-settings-version-panel"/);
 assert.match(modal,/class="plan-settings-version-note"/);
 assert.match(modal,/plan-settings-save-actions/);
 assert.match(css,/#plan-settings-dialog \.plan-settings-body \{\s*display:grid;grid-template-columns:minmax\(0,1\.1fr\) minmax\(0,\.9fr\)/);
 assert.match(css,/@media \(max-width:720px\)/);
});
test('applying configuration updates draft but cannot create version',()=>{
 const start=app.indexOf("'plan-settings-form').addEventListener('submit'");
 const end=app.indexOf("'plan-load').addEventListener('click'",start);
 const handler=app.slice(start,end);
 assert.ok(start>0);
 assert.match(handler,/renderPlanHeader\(\)/);
 assert.match(handler,/plan-settings-dialog'\)\.close\(\)/);
 assert.doesNotMatch(handler,/savePlan\(/);
 assert.doesNotMatch(handler,/api\(/);
 assert.match(app,/Al guardar el plan se creará la versión/);
 assert.match(app,/Aplicar cambios solo actualiza el borrador/);
});
test('reload confirmation protects unsaved data and respects API failures',()=>{
 const start=app.indexOf("'plan-load').addEventListener('click'");
 const end=app.indexOf("'plan-week-muscles').addEventListener(",start);
 const handler=app.slice(start,end);
 assert.ok(start>0);
 assert.match(handler,/if\(!state\.activePlan\)/);
 assert.match(handler,/await confirmAction\(/);
 assert.match(handler,/if\(!confirmed\)return/);
 assert.match(handler,/if\(loaded\)/);
 assert.match(app,/return false;\s*}\s*}\s*\/\* ========================================\s*FITCORE - ANÁLISIS MUSCULAR DE PLANES/);
});
test('version panel reads current and upcoming version dynamically',()=>{
 const start=app.indexOf('function renderPlanMode()');
 const end=app.indexOf('function fillSessionDays()',start);
 const renderer=app.slice(start,end);
 assert.match(renderer,/state\.activePlan\?\.version/);
 assert.match(renderer,/version\+1:1/);
 assert.doesNotMatch(renderer,/savePlan\(/);
 assert.match(renderer,/plan-settings-version-note/);
 assert.match(renderer,/plan-version-status/);
});
