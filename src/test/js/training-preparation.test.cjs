'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const dir=path.resolve(__dirname,'../../main/resources/static/fitcore-lab');
const html=fs.readFileSync(path.join(dir,'index.html'),'utf8');
const app=fs.readFileSync(path.join(dir,'app.js'),'utf8');
const css=fs.readFileSync(path.join(dir,'styles.css'),'utf8');

test('preparing a workout offers free or planned session with a plan-day preview',()=>{
 assert.match(html,/data-session-source="free"/);
 assert.match(html,/data-session-source="plan"/);
 assert.match(html,/id="session-day"/);
 assert.match(html,/id="session-plan-preview"/);
 assert.match(app,/const dayId=fromPlan\?optionalNumber/);
 assert.match(app,/workoutDayId:dayId/);
 assert.match(app,/await loadSessionExercises\(\)/);
});
test('manual workout categories match plan taxonomy except REST',()=>{
 assert.match(html,/data-session-classification="auto"/);
 assert.match(html,/data-session-classification="manual"/);
 assert.match(html,/id="session-manual-types"/);
 assert.match(app,/return enums\.dayTypes\.filter\(type=>type!=='REST'\)/);
 assert.match(app,/trainingDayTypeManual:manual/);
 assert.match(app,/trainingDayType:type\|\|null/);
 assert.match(app,/if\(manual&&\(!type\|\|type==='REST'\)\)/);
 assert.match(html,/id="session-manual-types"[^>]*role="radiogroup"/);
});
test('source selection cannot start an unselected plan day',()=>{
 assert.match(app,/if\(fromPlan&&!linkedDay\)return toast/);
 assert.match(app,/if\(fromPlan&&linkedDay\.dayType==='REST'\)/);
 assert.match(app,/\('session-start'\)\.disabled=!valid/);
});
test('legacy global intensity and hypertrophy category are removed from visible setup',()=>{
 const prep=html.slice(html.indexOf('<aside class="panel session-builder'),html.indexOf('<div class="session-workspace">'));
 assert.match(prep,/class="session-legacy-fields" hidden/);
 assert.match(prep,/id="session-intensity"/);
 assert.match(prep,/id="session-category"/);
 assert.match(prep,/El esfuerzo se registra como RIR y RPE/);
 assert.match(app,/sessionIntensity:'MODERATE'/);
 assert.doesNotMatch(prep,/Categoría\s*<select/);
 assert.doesNotMatch(prep,/Intensidad\s*<select/);
});
test('editing an active session changes muscle classification, not an effort label',()=>{
 assert.match(html,/id="session-edit-auto"/);
 assert.match(html,/id="session-edit-manual-types"/);
 assert.match(app,/function toggleSessionEditManualTypes\(\)/);
 assert.match(app,/trainingDayTypeManual:manual/);
 assert.match(app,/const selectedType=manual\?chosenSessionType/);
 assert.match(app,/return `$\{dateLabel\} · $\{typeLabel\}`/);
});
test('automatic type is inferred only from valid completed classification data',()=>{
 assert.match(app,/async function refreshAutomaticSessionClassification\(\)/);
 assert.match(app,/FitCoreDayClassifier\.classify\(inputs\)/);
 assert.match(app,/if\(result\.provisional\|\|!result\.structure/);
 assert.match(app,/session\.trainingDayTypeManual/);
 assert.match(app,/void refreshAutomaticSessionClassification\(\)/);
});
test('preparation card is responsive and uses shared day icon artwork',()=>{
 assert.match(app,/planDayIcon\(type\)/);
 assert.match(css,/#view-training \.session-preparation-modes/);
 assert.match(css,/#view-training \.session-manual-types/);
 assert.match(css,/@media\(max-width:800px\)/);
});
