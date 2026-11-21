const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const dir=path.resolve(__dirname,'../../main/resources/static/fitcore-lab');
const helper=require(path.join(dir,'exercise-progress-ui.js'));
const app=fs.readFileSync(path.join(dir,'app.js'),'utf8');
const html=fs.readFileSync(path.join(dir,'index.html'),'utf8');
const row=(date,mode,other)=>({date,loadMode:mode, ...other});

test('only real, comparable modalities are offered',()=>{
  const history=[
    row('2026-11-01','BODYWEIGHT',{reps:10}),
    row('2026-11-03','WEIGHTED',{reps:8,addedWeightKg:10}),
    row('2026-11-05','ASSISTED',{reps:12,assistanceWeightKg:15}),
    row('2026-11-08','EXTERNAL_LOAD',{reps:5,weight:80,volume:400,estimatedOneRepMax:93.3})
  ];
  const ids=helper.available(history).map(x=>x.id);
  assert.ok(ids.includes('repsBody'));
  assert.ok(ids.includes('added'));
  assert.ok(ids.includes('assistance'));
  assert.ok(ids.includes('oneRepMax'));
  const body=helper.chartData(history,'repsBody');
  assert.deepEqual(body.points.map(x=>x.value),[10]);
  const added=helper.chartData(history,'added');
  assert.deepEqual(added.points.map(x=>x.value),[10]);
  assert.deepEqual(helper.chartData(history,'oneRepMax').points.map(x=>x.value),[93.3]);
});
test('timed exercise has seconds, not a fictitious one-rep max',()=>{
 const history=[row('2026-11-01','BODYWEIGHT',{durationSeconds:45}),
   row('2026-11-08','BODYWEIGHT',{durationSeconds:75})];
 const ids=helper.available(history).map(x=>x.id);
 assert.deepEqual(ids,['seconds']);
 const chart=helper.chartData(history,'seconds');
 assert.deepEqual(chart.points.map(x=>x.value),[45,75]);
 assert.match(chart.svg,/polyline/);
});
test('assistance reduction is considered an improvement in the chart',()=>{
 const rows=[row('2026-11-01','ASSISTED',{assistanceWeightKg:25}),
  row('2026-11-08','ASSISTED',{assistanceWeightKg:15})];
 const chart=helper.chartData(rows,'assistance');
 assert.equal(chart.spec.lowerBetter,true);
 assert.deepEqual(chart.points.map(x=>x.value),[25,15]);
});
test('zero-length chart and null metrics are safe',()=>{
 assert.deepEqual(helper.available([]),[]);
 assert.equal(helper.chartData([],'seconds').points.length,0);
 assert.equal(helper.chartData([], 'madeup'),null);
 assert.deepEqual(helper.points([{date:'2026-10-01',weight:null}],helper.specs.find(x=>x.id==='weight')),[]);
});
test('UI only fetches per-variant completed history',()=>{
 assert.match(html,/id="exercise-progress-family"/);
 assert.match(html,/id="exercise-progress-variant"/);
 assert.match(html,/id="exercise-progress-chart"/);
 assert.ok(html.indexOf('exercise-progress-ui.js')<html.indexOf('src="./app.js"'));
 assert.match(app,/progress\/exercise-variants\//);
 assert.match(app,/FitCoreProgressUI\.chartData/);
 assert.match(app,/FitCoreProgressUI\.available/);
});
