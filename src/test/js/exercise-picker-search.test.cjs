const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const staticDir = fs.existsSync(path.join(__dirname, 'exercise-picker-search.js'))
  ? __dirname
  : path.resolve(__dirname, '../../main/resources/static/fitcore-lab');
const {search, normalize, matches, groupKey} = require(path.join(staticDir,'exercise-picker-search.js'));
const {variantTitle} = require(path.join(staticDir,'exercise-variant-ui.js'));

const exercises = [
  {code:'legPress', name:'Prensa de piernas', mainMuscleGroup:'QUADRICEPS'},
  {code:'hipAbduction', name:'Abducción de cadera en máquina', mainMuscleGroup:'GLUTES'},
  {code:'benchPress', name:'Press de banca', mainMuscleGroup:'CHEST'},
  {code:'machineChestPress', name:'Press de pecho en máquina', mainMuscleGroup:'CHEST'},
  {code:'pullUp', name:'Dominadas', mainMuscleGroup:'BACK'},
  {code:'barbellRow', name:'Remo con barra', mainMuscleGroup:'BACK'}
];
const v=(code,exerciseCode,equipment,benchAngle,name,gripType='PRONATED')=>({code,exerciseCode,equipment,benchAngle,name,gripType,gripWidth:'MEDIUM',practicality:'COMMON',active:true});
const variants = [
  v('legPressMachineHighFeet','legPress','MACHINE_PLATE_LOADED','NOT_APPLICABLE','Prensa de piernas con pies altos'),
  v('abductionMachine','hipAbduction','MACHINE_SELECTORISED','NOT_APPLICABLE','Abducción de cadera'),
  v('benchPressBarbellFlatMediumGrip','benchPress','BARBELL','FLAT','Press plano con barra'),
  v('benchPressBarbellInclineMediumGrip','benchPress','BARBELL','INCLINE','Press de banca inclinado con barra'),
  v('benchPressDumbbellInclineNeutralGrip','benchPress','DUMBBELL','INCLINE','Press inclinado con mancuernas neutro','NEUTRAL'),
  v('benchPressDumbbellInclinePronatedGrip','benchPress','DUMBBELL','INCLINE','Press inclinado con mancuernas prono'),
  v('benchPressSmithInclineMediumGrip','benchPress','SMITH_MACHINE','INCLINE','Press de banca inclinado en Smith'),
  v('chestPressMachineIncline','machineChestPress','MACHINE_PLATE_LOADED','INCLINE','Press de pecho inclinado en máquina'),
  v('pullUpBodyweightPronatedWideGrip','pullUp','BODYWEIGHT','NOT_APPLICABLE','Dominadas pronas con agarre ancho','PRONATED'),
  v('pullUpBodyweightPronatedMediumGrip','pullUp','BODYWEIGHT','NOT_APPLICABLE','Dominadas pronas con agarre medio','PRONATED'),
  v('pullUpBodyweightSupinatedNarrowGrip','pullUp','BODYWEIGHT','NOT_APPLICABLE','Dominadas supinas con agarre estrecho','SUPINATED'),
  v('barbellRowPronatedMediumGrip','barbellRow','BARBELL','NOT_APPLICABLE','Remo con barra prono')
];
const labels = {BARBELL:'Barra',DUMBBELL:'Mancuernas',SMITH_MACHINE:'Multipower',MACHINE_PLATE_LOADED:'Máquina de discos',CABLE:'Polea',BODYWEIGHT:'Peso corporal',PRONATED:'Prono',NEUTRAL:'Neutro',SUPINATED:'Supino',FLAT:'Plano',INCLINE:'Inclinado'};
const friendly=x=>labels[x]||String(x||'');
const find=(query,extra={})=>search({exercises,variants,query,friendly,...extra});

test('press es una palabra distinta de prensa (sin mirar legPress interno)',()=>{
  const rows=find('press');
  assert.ok(rows.some(x=>x.exercise.code==='benchPress'));
  assert.ok(!rows.some(x=>x.exercise.code==='legPress'));
  assert.ok(!rows.some(x=>x.exercise.code==='hipAbduction'));
  assert.deepEqual(find('prensa').map(x=>x.exercise.code),['legPress']);
});
test('busqueda general mantiene un resultado por ejercicio base',()=>{
  const rows=find('press de banca');
  assert.equal(rows.length,2);
  assert.deepEqual(rows.map(row=>row.title),['Press de banca','Press de banca en Smith']);
  assert.equal(rows[0].kind,'modality');
  assert.equal(rows[0].variantCodes.length,4);
});
test('press inclinado agrupa barra y mancuernas; Smith y máquina por separado',()=>{
  const rows=find('press inclinado');
  assert.equal(rows.length,3);
  assert.equal(rows[0].kind,'modality');
  const groups=rows.map(r=>({base:r.exercise.code,equipment:r.variant.equipment,n:r.variantCodes.length}));
  assert.ok(groups.some(g=>g.base==='benchPress'&&g.equipment==='BARBELL'&&g.n===4));
  assert.ok(groups.some(g=>g.base==='benchPress'&&g.equipment==='SMITH_MACHINE'&&g.n===1));
  assert.ok(groups.some(g=>g.base==='machineChestPress'&&g.n===1));
});
test('si se filtra por mancuernas sigue siendo una sola modalidad inclinada',()=>{
  const rows=find('press inclinado',{equipment:'DUMBBELL'});
  assert.equal(rows.length,1);
  assert.equal(rows[0].variant.equipment,'DUMBBELL');
  assert.equal(rows[0].variantCodes.length,2);
});
test('filtro general de equipamiento agrupa y preselecciona variante compatible',()=>{
  const rows=find('',{equipment:'SMITH_MACHINE'});
  assert.equal(rows.length,1);
  assert.equal(rows[0].kind,'modality');
  assert.equal(rows[0].variant.equipment,'SMITH_MACHINE');
});
test('dominadas agrupa agarres relevantes sin duplicar anchuras',()=>{
  const rows=find('dominadas agarre');
  assert.equal(rows.length,2);
  assert.ok(rows.some(row=>row.title==='Dominadas pronas'));
  assert.ok(rows.some(row=>row.title==='Dominadas supinas'));
  assert.ok(rows.every(row=>row.variantCodes.length>=1));
  const byGrip = variants.filter(v=>v.exerciseCode==='pullUp').map(v=>groupKey(exercises[4],v));
  assert.equal(new Set(byGrip).size,2);
});
test('coincidencias basadas en palabras admiten tildes y prefijos pero no subcadenas',()=>{
  assert.equal(normalize('MÁQUINA'), 'maquina');
  assert.equal(matches('Press de banca', ['pres']), true);
  assert.equal(matches('Prensa', ['press']), false);
  assert.equal(matches('Press de banca', ['press','banc']), true);
});
test('los titulos distinguen Smith y conservan el formato para mancuernas',()=>{
  const bench=exercises[2];
  assert.equal(variantTitle(bench,variants[3]),'Press de banca inclinado (≈30–45°)');
  assert.equal(variantTitle(bench,variants[6]),'Press de banca inclinado (≈30–45°) en Smith');
});
test('la busqueda no inventa variantes y nunca cambia codigos',()=>{
  const rows=find('press inclinado');
  const all=new Set(variants.map(x=>x.code));
  assert.ok(rows.every(row=>row.variantCodes.every(code=>all.has(code))));
  assert.ok(rows.every(row=>!row.variant||row.variantCodes.includes(row.variant.code)));
});

const appPath = path.resolve(staticDir, 'app.js');
if (fs.existsSync(appPath)) {
  const vm = require('node:vm');
  const app = fs.readFileSync(appPath, 'utf8');
  const from = app.indexOf('function renderSessionExerciseResults() {');
  const until = app.indexOf('function renderSessionExerciseConfig() {', from);
  test('los resultados usan el buscador agrupado y no la búsqueda heredada', () => {
    assert.match(app, /FitCoreExerciseSearch\.search\(/);
    assert.ok(from >= 0 && until > from);
  });
  if (from >= 0 && until > from) {
    const renderer = app.slice(from, until);
    test('cambiar de búsqueda limpia una selección obsoleta y desactiva Añadir', () => {
      const nodes = {
        'session-exercise-results': {innerHTML:''},
        'session-exercise-count': {textContent:''},
        'session-add-exercise': {disabled:false}
      };
      const state = {
        exercises, variants,
        sessionPicker: {exercise: exercises[1], configuration:{variantCode:'abductionMachine'}},
        pickerConfigOpen:true, pickerConfigMoreOpen:true
      };
      const context = {
        state,
        $: id => nodes[id],
        filteredSessionExercises: () => find('press inclinado'),
        renderSessionExerciseConfig: () => {nodes['session-add-exercise'].disabled = !state.sessionPicker.exercise;},
        friendly,
        variantConfigurationChips: () => [],
        exerciseThumb: () => 'PR',
        escapeHtml: x => String(x ?? ''),
        FitCoreVariantUI: {variantTitle}
      };
      vm.createContext(context);
      vm.runInContext(renderer, context);
      vm.runInContext('renderSessionExerciseResults()', context);
      assert.equal(state.sessionPicker.exercise, null);
      assert.equal(nodes['session-add-exercise'].disabled, true);
      assert.equal(state.pickerConfigOpen, false);
      assert.equal(state.pickerConfigMoreOpen, false);
    });
    test('configuración escogida dentro de una modalidad agrupada sigue válida', () => {
      const nodes = {
        'session-exercise-results': {innerHTML:''},
        'session-exercise-count': {textContent:''},
        'session-add-exercise': {disabled:false}
      };
      const state = {
        exercises, variants,
        sessionPicker: {exercise: exercises[2], configuration:{variantCode:'benchPressDumbbellInclineNeutralGrip'}},
        pickerConfigOpen:true, pickerConfigMoreOpen:false
      };
      const context = {
        state, $: id => nodes[id],
        filteredSessionExercises: () => find('press inclinado'),
        renderSessionExerciseConfig: () => {throw Error('No debe invalidarse');},
        friendly, variantConfigurationChips: () => [], exerciseThumb: () => 'PR',
        escapeHtml: x => String(x ?? ''), FitCoreVariantUI: {variantTitle}
      };
      vm.createContext(context);
      vm.runInContext(renderer, context);
      vm.runInContext('renderSessionExerciseResults()', context);
      assert.equal(state.sessionPicker.configuration.variantCode,'benchPressDumbbellInclineNeutralGrip');
      assert.match(nodes['session-exercise-results'].innerHTML,/aria-pressed="true"/);
    });
  }
}

test('inclinación ligera queda dentro de la modalidad; no crea otra tarjeta',()=>{
  const low={...variants[3],code:'benchPressBarbellLowInclineGrip',name:'Press con inclinación ligera',benchAngle:'LOW_INCLINE'};
  const smith={...variants[6],code:'benchPressSmithLowInclineGrip',name:'Press con inclinación ligera en Smith',benchAngle:'LOW_INCLINE'};
  const rows=search({exercises,variants:[...variants,low,smith],query:'press inclinado',friendly});
  assert.equal(rows.length,3);
  assert.ok(rows.some(x=>x.variantCodes.includes(low.code)));
  assert.ok(rows.some(x=>x.variantCodes.includes(smith.code)));
  assert.ok(rows.every(x=>!x.title.includes('ligera')));
});

test('las tarjetas de press muestran solo título, material y configuraciones', () => {
    const rows=find('press inclinado');
    assert.ok(rows.some(row => row.title === 'Press de banca inclinado'));
    assert.ok(rows.every(row => !row.title.includes('(barra o mancuernas)')));
    assert.ok(rows.every(row => !row.detail.includes('Ángulos aprox.')));
    assert.ok(rows.every(row => !row.detail.includes('°')));
});

test('la búsqueda no anuncia una configuración única',()=>{
  const rows=find('press inclinado');
  const machine=rows.find(row=>row.exercise.code==='machineChestPress');
  assert.ok(machine);
  assert.equal(machine.variantCodes.length,1);
  assert.ok(!machine.detail.includes('1 configuración'));
  assert.equal(machine.detail,'Máquina de discos');
  assert.ok(rows.some(row=>row.variantCodes.length>1 && row.detail.includes('configuraciones')));
});

test('espalda: jalón unilateral separado del jalón bilateral',()=>{
  const base={code:'latPulldown',name:'Jalón al pecho',mainMuscleGroup:'BACK'};
  const a=v('latSeated','latPulldown','CABLE','NOT_APPLICABLE','Jalón al pecho prono');
  a.laterality='BILATERAL';
  const b=v('latUnilateral','latPulldown','CABLE','NOT_APPLICABLE','Jalón unilateral en polea');
  b.laterality='UNILATERAL';
  const rows=search({exercises:[base],variants:[a,b],friendly,query:''});
  assert.deepEqual(rows.map(x=>x.title),['Jalón al pecho','Jalón unilateral en polea']);
  assert.ok(rows.every(x=>x.variantCodes.length===1));
});
test('espalda: remos en máquina de discos y selectorizada son modalidades distintas',()=>{
  const base={code:'machineRow',name:'Remo en máquina',mainMuscleGroup:'BACK'};
  const a=v('loaded','machineRow','MACHINE_PLATE_LOADED','NOT_APPLICABLE','Remo con discos');
  const b=v('selector','machineRow','MACHINE_SELECTORISED','NOT_APPLICABLE','Remo selectorizado');
  const rows=search({exercises:[base],variants:[a,b],friendly,query:'remo'});
  assert.deepEqual(rows.map(x=>x.title),['Remo en máquina de discos','Remo en máquina selectorizada']);
});
test('hombros: press y elevación lateral solo se dividen por equipamiento',()=>{
  const bases=[{code:'overheadPress',name:'Press militar',mainMuscleGroup:'SHOULDERS'},
    {code:'lateralRaise',name:'Elevación lateral',mainMuscleGroup:'SHOULDERS'}];
  const variants=[
    v('ohBar','overheadPress','BARBELL','NOT_APPLICABLE','Press militar barra'),
    v('ohDumbSeat','overheadPress','DUMBBELL','NOT_APPLICABLE','Press de hombros sentado mancuernas'),
    v('ohDumbStand','overheadPress','DUMBBELL','NOT_APPLICABLE','Press de hombros de pie mancuernas'),
    v('ohSmith','overheadPress','SMITH_MACHINE','NOT_APPLICABLE','Press de hombros Smith'),
    v('latDumb','lateralRaise','DUMBBELL','NOT_APPLICABLE','Elevación lateral mancuernas'),
    v('latCable','lateralRaise','CABLE','NOT_APPLICABLE','Elevación lateral polea')
  ];
  const rows=search({exercises:bases,variants,friendly,query:'',muscle:'SHOULDERS'});
  assert.equal(rows.length,5);
  assert.equal(rows.find(x=>x.title==='Press de hombros con mancuernas')?.variantCodes.length,2);
  assert.ok(rows.some(x=>x.title==='Elevaciones laterales en polea'));
});

test('bíceps: modalidades por equipamiento sin duplicar curl sentado, inclinado o predicador',()=>{
  const base={code:'bicepsCurl',name:'Curl de bíceps',mainMuscleGroup:'BICEPS'};
  const a=v('dbStanding','bicepsCurl','DUMBBELL','NOT_APPLICABLE','Curl de bíceps de pie con mancuernas','SUPINATED');
  const b=v('dbIncline','bicepsCurl','DUMBBELL','INCLINE','Curl de bíceps inclinado con mancuernas','SUPINATED');
  const c=v('dbPreacher','bicepsCurl','DUMBBELL','NOT_APPLICABLE','Curl predicador con mancuernas','SUPINATED');
  const d=v('bar','bicepsCurl','BARBELL','NOT_APPLICABLE','Curl de bíceps con barra','SUPINATED');
  const e=v('ez','bicepsCurl','EZ_BAR','NOT_APPLICABLE','Curl de bíceps con barra Z','SUPINATED');
  const rows=search({exercises:[base],variants:[a,b,c,d,e],friendly,query:'curl'});
  assert.equal(rows.length,3);
  assert.equal(rows.find(x=>x.title==='Curl de bíceps con mancuernas')?.variantCodes.length,3);
  assert.ok(rows.some(x=>x.title==='Curl de bíceps con barra Z'));
  const preacher=search({exercises:[base],variants:[a,b,c,d,e],friendly,query:'curl predicador'});
  assert.equal(preacher.length,1);
  assert.equal(preacher[0].title,'Curl de bíceps predicador con mancuernas');
  assert.equal(preacher[0].variant.code,'dbPreacher');
});
test('tríceps: cuerda, barra y asa en polea son configuraciones, no tres tarjetas',()=>{
  const base={code:'tricepsPushdown',name:'Extensión de tríceps en polea',mainMuscleGroup:'TRICEPS'};
  const a=v('rope','tricepsPushdown','CABLE','NOT_APPLICABLE','Extensión de tríceps con cuerda');
  const b=v('bar','tricepsPushdown','CABLE','NOT_APPLICABLE','Extensión de tríceps con barra recta');
  const c=v('single','tricepsPushdown','CABLE','NOT_APPLICABLE','Extensión unilateral de tríceps en polea');
  const rows=search({exercises:[base],variants:[a,b,c],friendly,query:'tríceps'});
  assert.equal(rows.length,1);
  assert.equal(rows[0].title,'Extensión de tríceps en polea');
  assert.equal(rows[0].variantCodes.length,3);
  const unilateral=search({exercises:[base],variants:[a,b,c],friendly,query:'unilateral'});
  assert.equal(unilateral.length,1);
  assert.equal(unilateral[0].matchingCodes.length,1);
  assert.equal(unilateral[0].variant.code,'single');
});
test('tríceps: extensión sobre la cabeza separa polea de mancuernas y barra Z',()=>{
  const base={code:'overheadTricepsExtension',name:'Extensión de tríceps sobre la cabeza',mainMuscleGroup:'TRICEPS'};
  const a=v('rope','overheadTricepsExtension','CABLE','NOT_APPLICABLE','Extensión sobre la cabeza en polea');
  const b=v('db','overheadTricepsExtension','DUMBBELL','NOT_APPLICABLE','Extensión sobre la cabeza con mancuernas');
  const c=v('ez','overheadTricepsExtension','EZ_BAR','NOT_APPLICABLE','Extensión sobre la cabeza con barra Z');
  const rows=search({exercises:[base],variants:[a,b,c],friendly,query:'',muscle:'TRICEPS'});
  assert.deepEqual(rows.map(x=>x.title),[
    'Extensión de tríceps sobre la cabeza en polea',
    'Extensión de tríceps sobre la cabeza con mancuernas',
    'Extensión de tríceps sobre la cabeza con barra Z'
  ]);
});

test('piernas: prensa con pies altos o bajos sigue siendo una sola modalidad',()=>{
  const e={code:'legPress',name:'Prensa de piernas',mainMuscleGroup:'QUADRICEPS'};
  const x=v('mid','legPress','MACHINE_PLATE_LOADED','NOT_APPLICABLE','Prensa de piernas pies medios');
  const y=v('high','legPress','MACHINE_PLATE_LOADED','NOT_APPLICABLE','Prensa de piernas pies altos');
  const z=v('single','legPress','MACHINE_PLATE_LOADED','NOT_APPLICABLE','Prensa de piernas unilateral');
  const w=v('selector','legPress','MACHINE_SELECTORISED','NOT_APPLICABLE','Prensa en máquina selectorizada');
  const rows=search({exercises:[e],variants:[x,y,z,w],query:'prensa',friendly});
  assert.equal(rows.length,2);
  assert.equal(rows.find(r=>r.title==='Prensa de piernas en máquina de discos').variantCodes.length,3);
  assert.ok(rows.every(r=>!r.detail.includes('1 configuración')));
});
test('piernas: la sentadilla búlgara se encuentra dentro de la modalidad mancuerna',()=>{
  const e={code:'splitSquat',name:'Sentadilla dividida',mainMuscleGroup:'QUADRICEPS'};
  const x=v('bulgarian','splitSquat','DUMBBELL','NOT_APPLICABLE','Sentadilla búlgara con mancuernas');
  const y=v('standard','splitSquat','DUMBBELL','NOT_APPLICABLE','Sentadilla dividida con mancuernas');
  const rows=search({exercises:[e],variants:[x,y],query:'sentadilla bulgara',friendly});
  assert.equal(rows.length,1);
  assert.equal(rows[0].title,'Sentadilla búlgara con mancuernas');
  assert.equal(rows[0].matchingCodes.length,1);
  assert.equal(rows[0].variantCodes.length,2);
});
test('glúteos: hip thrust por equipamiento sin multiplicar configuraciones de apoyo',()=>{
  const e={code:'hipThrust',name:'Hip thrust',mainMuscleGroup:'GLUTES'};
  const variants=[
    v('bar','hipThrust','BARBELL','FLAT','Hip thrust con barra'),
    v('smith','hipThrust','SMITH_MACHINE','FLAT','Hip thrust en multipower'),
    v('machine','hipThrust','MACHINE_PLATE_LOADED','FLAT','Hip thrust en máquina')
  ];
  const rows=search({exercises:[e],variants,query:'hip thrust',friendly});
  assert.deepEqual(rows.map(r=>r.title),[
    'Hip thrust con barra','Hip thrust en Smith','Hip thrust en máquina de discos'
  ]);
});
test('aductores: aducción se filtra por ADDUCTORS, no glúteos',()=>{
  const ex={code:'hipAdduction',name:'Aducción de cadera',mainMuscleGroup:'ADDUCTORS'};
  const v1=v('adduction','hipAdduction','MACHINE_SELECTORISED','NOT_APPLICABLE','Aducción de cadera en máquina');
  assert.equal(search({exercises:[ex],variants:[v1],query:'',muscle:'GLUTES',friendly}).length,0);
  const found=search({exercises:[ex],variants:[v1],query:'',muscle:'ADDUCTORS',friendly});
  assert.equal(found.length,1);
  assert.equal(found[0].detail,'Máquina de discos' === friendly('MACHINE_SELECTORISED') ? 'Máquina de discos' : String('MACHINE_SELECTORISED'));
});

test('isquiotibiales: curl femoral sentado y tumbado tienen tarjetas distintas',()=>{
  const ex={code:'legCurl',name:'Curl femoral',mainMuscleGroup:'HAMSTRINGS'};
  const s=v('seated','legCurl','MACHINE_SELECTORISED','NOT_APPLICABLE','Curl femoral sentado');
  const u=v('seatedOneLeg','legCurl','MACHINE_SELECTORISED','NOT_APPLICABLE','Curl femoral sentado unilateral');
  const p=v('prone','legCurl','MACHINE_SELECTORISED','NOT_APPLICABLE','Curl femoral tumbado');
  s.bodyPosition='SEATED';u.bodyPosition='SEATED';p.bodyPosition='PRONE';
  const found=search({exercises:[ex],variants:[s,u,p],query:'curl femoral',friendly});
  assert.equal(found.length,2);
  assert.deepEqual(found.map(x=>x.title),[
    'Curl femoral sentado en máquina selectorizada',
    'Curl femoral tumbado en máquina selectorizada'
  ]);
  assert.equal(found[0].variantCodes.length,2);
});
test('isquiotibiales: peso muerto rumano sin duplicar por unilateralidad',()=>{
  const ex={code:'romanianDeadlift',name:'Peso muerto rumano',mainMuscleGroup:'HAMSTRINGS'};
  const b=v('bar','romanianDeadlift','BARBELL','NOT_APPLICABLE','Peso muerto rumano con barra');
  const d=v('dumb','romanianDeadlift','DUMBBELL','NOT_APPLICABLE','Peso muerto rumano con mancuernas');
  const u=v('dumbSingle','romanianDeadlift','DUMBBELL','NOT_APPLICABLE','Peso muerto rumano unilateral con mancuernas');
  const found=search({exercises:[ex],variants:[b,d,u],query:'peso muerto rumano',friendly});
  assert.deepEqual(found.map(x=>x.title),['Peso muerto rumano con barra','Peso muerto rumano con mancuernas']);
  assert.equal(found[1].variantCodes.length,2);
});
test('gemelos: separar elevaciones de pie y sentadas y prensa, nunca cada apoyo',()=>{
  const bases=[
    {code:'standingCalfRaise',name:'Elevación de gemelos de pie',mainMuscleGroup:'CALVES'},
    {code:'seatedCalfRaise',name:'Elevación de gemelos sentado',mainMuscleGroup:'CALVES'},
    {code:'calfPressLegPress',name:'Elevación de gemelos en prensa',mainMuscleGroup:'CALVES'}
  ];
  const a=v('standing','standingCalfRaise','BODYWEIGHT','NOT_APPLICABLE','Elevación gemelos de pie');
  const b=v('unilateral','standingCalfRaise','BODYWEIGHT','NOT_APPLICABLE','Elevación gemelos de pie unilateral');
  const c=v('seated','seatedCalfRaise','MACHINE_PLATE_LOADED','NOT_APPLICABLE','Elevación gemelos sentado');
  const d=v('press','calfPressLegPress','MACHINE_PLATE_LOADED','NOT_APPLICABLE','Elevación gemelos prensa');
  const found=search({exercises:bases,variants:[a,b,c,d],query:'gemelos',friendly});
  assert.equal(found.length,3);
  assert.equal(found[0].variantCodes.length,2);
  assert.ok(found.some(x=>x.title==='Elevación de gemelos en prensa en máquina de discos'));
});
test('peso muerto convencional se puede localizar bajo FULL_BODY',()=>{
  const ex={code:'deadlift',name:'Peso muerto',mainMuscleGroup:'FULL_BODY'};
  const a=v('conventional','deadlift','BARBELL','NOT_APPLICABLE','Peso muerto convencional con barra');
  const b=v('sumo','deadlift','BARBELL','NOT_APPLICABLE','Peso muerto sumo con barra');
  a.stanceType='CONVENTIONAL';b.stanceType='SUMO';
  assert.equal(search({exercises:[ex],variants:[a,b],query:'peso muerto',muscle:'HAMSTRINGS',friendly}).length,0);
  const found=search({exercises:[ex],variants:[a,b],query:'peso muerto',muscle:'FULL_BODY',friendly});
  assert.equal(found.length,1);
  assert.equal(found[0].variantCodes.length,2);
  assert.equal(search({exercises:[ex],variants:[a,b],query:'sumo',friendly})[0].title,'Peso muerto sumo con barra');
});

test('core: Pallof y woodchopper son patrones separados y no mezclan configuraciones',()=>{
  const base=[
    {code:'pallofPress',name:'Press Pallof',mainMuscleGroup:'CORE'},
    {code:'woodchopper',name:'Giro diagonal (woodchopper)',mainMuscleGroup:'CORE'}
  ];
  const a=v('pallofCable','pallofPress','CABLE','NOT_APPLICABLE','Press Pallof de pie en polea');
  const b=v('pallofKneeling','pallofPress','CABLE','NOT_APPLICABLE','Press Pallof medio arrodillado');
  const c=v('woodHigh','woodchopper','CABLE','NOT_APPLICABLE','Giro diagonal arriba abajo en polea');
  const d=v('woodLow','woodchopper','CABLE','NOT_APPLICABLE','Giro diagonal abajo arriba en polea');
  const found=search({exercises:base,variants:[a,b,c,d],query:'',muscle:'CORE',friendly});
  assert.equal(found.length,2);
  assert.equal(found[0].title,'Press Pallof en polea');
  assert.equal(found[1].title,'Giro diagonal en polea');
  assert.deepEqual(found.map(x=>x.variantCodes.length),[2,2]);
});
test('core: silla romana y suspendido separados; rodillas y piernas en Configurar',()=>{
  const ex={code:'legRaise',name:'Elevación de piernas',mainMuscleGroup:'CORE'};
  const h=v('h','legRaise','BODYWEIGHT','NOT_APPLICABLE','Elevación de rodillas colgado');
  const c=v('c','legRaise','BODYWEIGHT','NOT_APPLICABLE','Elevación de rodillas en silla romana');
  const d=v('d','legRaise','BODYWEIGHT','NOT_APPLICABLE','Elevación de piernas en silla romana');
  h.supportType='FREE';c.supportType='MACHINE_SUPPORTED';d.supportType='MACHINE_SUPPORTED';
  const found=search({exercises:[ex],variants:[h,c,d],query:'elevacion',friendly});
  assert.equal(found.length,2);
  assert.equal(found[0].title,'Elevación de piernas colgado');
  assert.equal(found[1].title,'Elevación de piernas en silla romana');
  assert.equal(found[1].variantCodes.length,2);
});
test('core: las planchas no crean tarjetas por dificultad ni anuncian configuración única',()=>{
  const ex={code:'sidePlank',name:'Plancha lateral',mainMuscleGroup:'CORE'};
  const a=v('straight','sidePlank','BODYWEIGHT','NOT_APPLICABLE','Plancha lateral sobre antebrazo');
  const b=v('knees','sidePlank','BODYWEIGHT','NOT_APPLICABLE','Plancha lateral con rodillas apoyadas');
  const found=search({exercises:[ex],variants:[a,b],query:'plancha lateral',friendly});
  assert.equal(found.length,1);
  assert.equal(found[0].variantCodes.length,2);
  assert.equal(found[0].title,'Plancha lateral');
  assert.ok(!found[0].detail.includes('1 configuración'));
});

test('antebrazo: flexión y extensión de muñeca son familias distintas',()=>{
  const es=[
    {code:'wristCurl',name:'Flexión de muñeca',mainMuscleGroup:'FOREARMS'},
    {code:'wristExtension',name:'Extensión de muñeca',mainMuscleGroup:'FOREARMS'}];
  const xs=[
    v('flexBar','wristCurl','BARBELL','NOT_APPLICABLE','Flexión de muñeca con barra'),
    v('flexOne','wristCurl','DUMBBELL','NOT_APPLICABLE','Flexión unilateral de muñeca con mancuerna'),
    v('extBar','wristExtension','BARBELL','NOT_APPLICABLE','Extensión de muñeca con barra')];
  const out=search({exercises:es,variants:xs,query:'',muscle:'FOREARMS',friendly});
  assert.equal(out.length,3);
  assert.deepEqual(out.map(x=>x.title),[
    'Flexión de muñeca con barra','Flexión de muñeca con mancuernas','Extensión de muñeca con barra']);
  assert.ok(out.every(x=>!x.detail.includes('1 configuración')));
  assert.equal(search({exercises:es,variants:xs,query:'',muscle:'BICEPS',friendly}).length,0);
});
test('antebrazo: pronación y supinación se buscan por nombre, sin alterar códigos',()=>{
  const e={code:'forearmRotation',name:'Pronación y supinación de antebrazo',mainMuscleGroup:'FOREARMS'};
  const a=v('pronDumb','forearmRotation','DUMBBELL','NOT_APPLICABLE','Pronación de antebrazo sentado con mancuerna');
  const b=v('supDumb','forearmRotation','DUMBBELL','NOT_APPLICABLE','Supinación de antebrazo sentado con mancuerna');
  const c=v('pronBand','forearmRotation','BAND','NOT_APPLICABLE','Pronación de antebrazo con banda');
  const d=v('supBand','forearmRotation','BAND','NOT_APPLICABLE','Supinación de antebrazo con banda');
  const all=[a,b,c,d];
  const out=search({exercises:[e],variants:all,query:'pronacion',friendly});
  assert.equal(out.length,2);
  assert.ok(out.every(x=>x.title.startsWith('Pronación')));
  assert.ok(out.every(x=>x.matchingCodes.every(code=>code.startsWith('pron'))));
  assert.ok(out.every(x=>x.variantCodes.length===2));
  const reverse=search({exercises:[e],variants:all,query:'supinacion',friendly});
  assert.equal(reverse.length,2);
  assert.ok(reverse.every(x=>x.matchingCodes.every(code=>code.startsWith('sup'))));
});
test('antebrazo: paseo unilateral configura el mismo material que bilateral',()=>{
  const e={code:'farmerCarry',name:'Paseo del granjero',mainMuscleGroup:'FOREARMS'};
  const a=v('bilateral','farmerCarry','DUMBBELL','NOT_APPLICABLE','Paseo del granjero con mancuernas');
  const b=v('suitcase','farmerCarry','DUMBBELL','NOT_APPLICABLE','Paseo de maleta unilateral con mancuerna');
  const c=v('trap','farmerCarry','TRAP_BAR','NOT_APPLICABLE','Paseo del granjero con barra hexagonal');
  const out=search({exercises:[e],variants:[a,b,c],query:'',friendly});
  assert.equal(out.length,2);
  assert.equal(out[0].title,'Paseo del granjero con mancuernas');
  assert.equal(out[0].variantCodes.length,2);
  assert.equal(out[1].title,'Paseo del granjero con barra hexagonal');
});
test('antebrazo: rodillo agrupa sentidos y suspensión agrupa agarres',()=>{
  const es=[
    {code:'wristRoller',name:'Rodillo de muñeca',mainMuscleGroup:'FOREARMS'},
    {code:'deadHang',name:'Suspensión en barra',mainMuscleGroup:'FOREARMS'}];
  const xs=[
    v('flex','wristRoller','WRIST_ROLLER','NOT_APPLICABLE','Rodillo de muñeca flexión'),
    v('ext','wristRoller','WRIST_ROLLER','NOT_APPLICABLE','Rodillo de muñeca extensión'),
    v('prono','deadHang','BODYWEIGHT','NOT_APPLICABLE','Suspensión en barra agarre prono'),
    v('neutro','deadHang','BODYWEIGHT','NOT_APPLICABLE','Suspensión en barra agarre neutro')];
  const out=search({exercises:es,variants:xs,query:'',friendly});
  assert.deepEqual(out.map(x=>x.title),['Rodillo de muñeca','Suspensión en barra']);
  assert.deepEqual(out.map(x=>x.variantCodes.length),[2,2]);
  assert.ok(out.every(x=>x.variantCodes.every(code=>xs.some(v=>v.code===code))));
});

test('V28: escapulares separan pared y suelo, pero agrupan las rodillas',()=>{
  const e={code:'scapularPushUp',name:'Flexiones escapulares',mainMuscleGroup:'SCAPULAR'};
  const a=v('standard','scapularPushUp','BODYWEIGHT','NOT_APPLICABLE','Flexiones escapulares en suelo');
  const b=v('knees','scapularPushUp','BODYWEIGHT','NOT_APPLICABLE','Flexiones escapulares con rodillas');
  const c=v('wall','scapularPushUp','BODYWEIGHT','NOT_APPLICABLE','Flexiones escapulares en pared');
  a.bodyPosition='PRONE';b.bodyPosition='PRONE';c.bodyPosition='STANDING';
  const rows=search({exercises:[e],variants:[a,b,c],query:'flexiones escapulares',muscle:'SCAPULAR',friendly});
  assert.deepEqual(rows.map(x=>x.title),['Flexiones escapulares en suelo','Flexiones escapulares en pared']);
  assert.deepEqual(rows.map(x=>x.variantCodes.length),[2,1]);
  assert.ok(rows.every(x=>!x.detail.includes('1 configuración')));
});
test('V28: rotación interna y externa son dos familias y el equipamiento es modalidad',()=>{
  const es=[
    {code:'shoulderExternalRotation',name:'Rotación externa de hombro',mainMuscleGroup:'ROTATOR_CUFF'},
    {code:'shoulderInternalRotation',name:'Rotación interna de hombro',mainMuscleGroup:'ROTATOR_CUFF'}];
  const a=v('extCable','shoulderExternalRotation','CABLE','NOT_APPLICABLE','Rotación externa de hombro en polea');
  const b=v('extAbducted','shoulderExternalRotation','CABLE','NOT_APPLICABLE','Rotación externa con brazo separado en polea');
  const c=v('extBand','shoulderExternalRotation','BAND','NOT_APPLICABLE','Rotación externa de hombro con banda');
  const d=v('intCable','shoulderInternalRotation','CABLE','NOT_APPLICABLE','Rotación interna de hombro en polea');
  const rows=search({exercises:es,variants:[a,b,c,d],query:'',muscle:'ROTATOR_CUFF',friendly});
  assert.equal(rows.length,3);
  assert.deepEqual(rows.map(x=>x.title),['Rotación externa de hombro en polea','Rotación externa de hombro con banda','Rotación interna de hombro en polea']);
  assert.equal(rows[0].variantCodes.length,2);
  const onlyInternal=search({exercises:es,variants:[a,b,c,d],query:'rotacion interna',muscle:'ROTATOR_CUFF',friendly});
  assert.deepEqual(onlyInternal.map(x=>x.exercise.code),['shoulderInternalRotation']);
});
test('V28: Y en banco y sin carga son modalidades y face pull sigue siendo hombros',()=>{
  const es=[
    {code:'proneYRaise',name:'Elevación en Y',mainMuscleGroup:'SCAPULAR'},
    {code:'facePull',name:'Face pull',mainMuscleGroup:'SHOULDERS'}];
  const a=v('dumb','proneYRaise','DUMBBELL','INCLINE','Elevación en Y con mancuernas');
  const b=v('body','proneYRaise','BODYWEIGHT','NOT_APPLICABLE','Elevación en Y sin carga');
  const c=v('face','facePull','CABLE','NOT_APPLICABLE','Face pull con cuerda');
  const scaps=search({exercises:es,variants:[a,b,c],query:'',muscle:'SCAPULAR',friendly});
  assert.deepEqual(scaps.map(x=>x.title),['Elevación en Y con mancuernas','Elevación en Y']);
  assert.equal(search({exercises:es,variants:[a,b,c],query:'',muscle:'SHOULDERS',friendly}).length,1);
});
test('V28: retracción escapular en polea es distinta de remo sentado normal',()=>{
  const es=[
    {code:'scapularRetraction',name:'Retracción escapular con brazos extendidos',mainMuscleGroup:'SCAPULAR'},
    {code:'seatedCableRow',name:'Remo sentado en polea',mainMuscleGroup:'BACK'}];
  const a=v('scap','scapularRetraction','CABLE','NOT_APPLICABLE','Retracción escapular con brazos extendidos en polea');
  const b=v('row','seatedCableRow','CABLE','NOT_APPLICABLE','Remo sentado en polea');
  const rows=search({exercises:es,variants:[a,b],query:'',muscle:'SCAPULAR',friendly});
  assert.equal(rows.length,1);
  assert.equal(rows[0].title,'Retracción escapular con brazos extendidos en polea');
});
