const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const dir=path.resolve(__dirname,'../../main/resources/static/fitcore-lab');
const summary=require(path.join(dir,'plan-session-summary.js'));
const app=fs.readFileSync(path.join(dir,'app.js'),'utf8');
const html=fs.readFileSync(path.join(dir,'index.html'),'utf8');
const css=fs.readFileSync(path.join(dir,'styles.css'),'utf8');

test('empty session remains honest instead of inventing estimated time',()=>{
 const data=summary.summarize([],()=> 'REPETITIONS');
 assert.equal(data.exerciseCount,0);
 assert.equal(data.plannedSets,0);
 assert.equal(data.durationLabel,'—');
});
test('rep-based session uses a plausible time range and only inter-set rests',()=>{
 const data=summary.summarize([{exerciseVariantCode:'press',sets:3,reps:10,restSeconds:90}],
    ()=> 'REPETITIONS');
 assert.equal(data.lowerSeconds,240);
 assert.equal(data.upperSeconds,300);
 assert.equal(data.durationLabel,'≈ 4–5 min');
});
test('time-based exercise uses seconds, never treats target as repetitions',()=>{
 const data=summary.summarize([{exerciseVariantCode:'plank',sets:3,reps:null,
   targetDurationSeconds:60,restSeconds:60}],()=> 'SECONDS');
 assert.equal(data.lowerSeconds,300);
 assert.equal(data.upperSeconds,300);
 assert.equal(data.hasTimedExercise,true);
 assert.equal(data.durationLabel,'≈ 5 min');
});
test('missing targets make estimate partial, not precise',()=>{
 const data=summary.summarize([{sets:2,reps:8,restSeconds:90},
   {sets:3,reps:null,restSeconds:60}],()=> 'REPETITIONS');
 assert.equal(data.plannedSets,5);
 assert.equal(data.missingTargets,true);
 assert.match(data.durationLabel,/\*$/);
});
test('editor reuses existing actions and real muscle activation system',()=>{
 assert.match(html,/id="plan-days-count"/);
 assert.match(html,/id="plan-day-tabs"/);
 assert.match(html,/plan-session-summary\.js/);
 assert.ok(html.indexOf('plan-session-summary.js')<html.indexOf('src="./app.js"'));
 assert.match(app,/data-configure-plan-day/);
 assert.match(app,/data-add-plan-exercise/);
 assert.match(app,/data-select-plan-day/);
 assert.match(app,/plan-exercise-action/);
 assert.match(app,/calculatePlanMuscles\(/);
 assert.match(app,/makePlanMuscleSvg\(result, 'day'\)/);
 assert.match(app,/fitPlanDayMuscleSvg\(svg, stage\)/);
 assert.match(app,/plan-session-duration/);
 assert.match(app,/data-exercise-durationSeconds/);
 assert.match(css,/#view-plans \.plan-editor-layout \{display:grid/);
 assert.match(css,/grid-template-columns:minmax\(0,1\.85fr\) minmax\(300px,1fr\)/);
});
test('no static anatomy or invented values appear in plan summary markup',()=>{
 const block=app.slice(app.indexOf('function renderPlanDays() {'),
   app.indexOf('FITCORE - DRAG AND DROP DE PLANES'));
 assert.match(block,/day\.exercises\.map\(\(exercise,index\)=>exerciseEditor/);
 assert.match(block,/renderPlanMusclePreview\(\)/);
 assert.doesNotMatch(block,/placeholder.*svg.*image/i);
});
