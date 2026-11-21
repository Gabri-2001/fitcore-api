const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const staticDir = path.resolve(__dirname, '../../main/resources/static/fitcore-lab');
const {search, matches, normalize, preferred, groupKey, titleFor} =
  require(path.join(staticDir,'exercise-picker-search.js'));
const {variantTitle} = require(path.join(staticDir,'exercise-variant-ui.js'));
const app = fs.readFileSync(path.join(staticDir,'app.js'),'utf8');

const e=(code,name,mainMuscleGroup='BACK')=>({code,name,mainMuscleGroup});
const v=(code,exerciseCode,equipment,name,extras={})=>({
  code,exerciseCode,equipment,name,practicality:'COMMON',active:true,...extras
});
const friendly = code => ({
  BODYWEIGHT:'Peso corporal',BARBELL:'Barra',DUMBBELL:'Mancuernas',
  EZ_BAR:'Barra Z',CABLE:'Polea',SMITH_MACHINE:'Multipower',
  MACHINE_PLATE_LOADED:'Máquina de discos',MACHINE_SELECTORISED:'Máquina de placas',
  BAND:'Banda',PRONATED:'Prono',SUPINATED:'Supino',NEUTRAL:'Neutro',
  MEDIUM:'Media',WIDE:'Ancha',NARROW:'Estrecha',FLAT:'Plano',
  INCLINE:'Inclinado',LOW_INCLINE:'Inclinación baja',
  SEATED:'Sentado',PRONE:'Tumbado',STANDING:'De pie'
}[code] || String(code||''));
const find=(exercises,variants,query='',extra={})=>
  search({exercises,variants,query,friendly,...extra});

const pull=e('pullUp','Dominadas');
const scapularPull=e('scapularPullUp','Dominadas escapulares','SCAPULAR');
const pulls=[
  v('pronMedium','pullUp','BODYWEIGHT','Dominadas pronas con agarre medio',
    {gripType:'PRONATED',gripWidth:'MEDIUM',isDefault:true}),
  v('pronWide','pullUp','BODYWEIGHT','Dominadas pronas con agarre ancho',
    {gripType:'PRONATED',gripWidth:'WIDE'}),
  v('supMedium','pullUp','BODYWEIGHT','Dominadas supinas con agarre medio',
    {gripType:'SUPINATED',gripWidth:'MEDIUM'}),
  v('supNarrow','pullUp','BODYWEIGHT','Dominadas supinas con agarre estrecho',
    {gripType:'SUPINATED',gripWidth:'NARROW'}),
  v('neutralMedium','pullUp','BODYWEIGHT','Dominadas con agarre neutro medio',
    {gripType:'NEUTRAL',gripWidth:'MEDIUM'}),
  v('scapPron','scapularPullUp','BODYWEIGHT','Dominadas escapulares con agarre prono',
    {gripType:'PRONATED',isDefault:true}),
  v('scapNeutral','scapularPullUp','BODYWEIGHT','Dominadas escapulares con agarre neutro',
    {gripType:'NEUTRAL'})
];

const triceps=[
  e('tricepsPushdown','Extensión de tríceps en polea','TRICEPS'),
  e('overheadTricepsExtension','Extensión de tríceps sobre la cabeza','TRICEPS'),
  e('lyingTricepsExtension','Extensión de tríceps tumbado','TRICEPS')
];
const tricepsVariants=[
  v('pushRope','tricepsPushdown','CABLE','Extensión de tríceps en polea con cuerda',
    {attachmentType:'ROPE',isDefault:true}),
  v('pushBar','tricepsPushdown','CABLE','Extensión de tríceps en polea con barra recta',
    {attachmentType:'STRAIGHT_BAR'}),
  v('pushV','tricepsPushdown','CABLE','Extensión de tríceps en polea con barra en V',
    {attachmentType:'V_BAR'}),
  v('overCable','overheadTricepsExtension','CABLE',
    'Extensión de tríceps sobre la cabeza en polea con cuerda',{isDefault:true}),
  v('overEZ','overheadTricepsExtension','EZ_BAR',
    'Extensión de tríceps sobre la cabeza con barra Z'),
  v('overDumb','overheadTricepsExtension','DUMBBELL',
    'Extensión de tríceps sobre la cabeza con mancuerna'),
  v('lieEZ','lyingTricepsExtension','EZ_BAR',
    'Extensión de tríceps tumbado con barra Z',{isDefault:true}),
  v('lieDumb','lyingTricepsExtension','DUMBBELL',
    'Extensión de tríceps tumbado con mancuernas')
];

test('buscar dominadas muestra solo dos familias reales y no tres agarres',()=>{
  const rows=find([pull,scapularPull],pulls,'dominadas');
  assert.deepEqual(rows.map(x=>x.title),['Dominadas','Dominadas escapulares']);
  assert.equal(rows[0].variantCodes.length,5);
  assert.equal(rows[1].variantCodes.length,2);
  assert.equal(rows[0].variant.code,'pronMedium');
  assert.equal(rows[0].variant.gripType,'PRONATED');
});
test('dominadas supinas preselecciona agarre SUPINATED medio sin reducir opciones',()=>{
  const rows=find([pull,scapularPull],pulls,'dominadas supinas');
  assert.equal(rows.length,1);
  assert.equal(rows[0].title,'Dominadas');
  assert.equal(rows[0].variant.gripType,'SUPINATED');
  assert.equal(rows[0].variant.gripWidth,'MEDIUM');
  assert.equal(rows[0].variantCodes.length,5);
  assert.deepEqual(rows[0].matchingCodes.sort(),['supMedium','supNarrow']);
  assert.match(rows[0].detail,/Coincidencia:/);
});
test('dominadas neutras y agarre prono funcionan con vocabulario natural',()=>{
  assert.equal(find([pull],pulls,'dominadas neutras')[0].variant.code,'neutralMedium');
  assert.equal(find([pull],pulls,'dominadas agarre prono')[0].variant.code,'pronMedium');
  assert.equal(find([pull],pulls,'dominadas supinas',{equipment:'DUMBBELL'}).length,0);
});
test('una consulta de dominadas escapulares no encuentra dominadas normales',()=>{
  assert.deepEqual(find([pull,scapularPull],pulls,'dominadas escapulares')
    .map(x=>x.exercise.code),['scapularPullUp']);
});
test('tríceps devuelve solo tres ejercicios base, material en configuración',()=>{
  const rows=find(triceps,tricepsVariants,'');
  assert.deepEqual(rows.map(x=>x.title),[
    'Extensión de tríceps','Extensión de tríceps sobre la cabeza',
    'Extensión de tríceps tumbado'
  ]);
  assert.deepEqual(rows.map(x=>x.variantCodes.length),[3,3,2]);
  assert.ok(rows.every(row=>!row.title.includes('polea')&&!row.title.includes('barra Z')));
});
test('consulta de tríceps en polea preselecciona polea y conserva configuraciones',()=>{
  const rows=find(triceps,tricepsVariants,'extension de triceps polea');
  assert.deepEqual(rows.map(x=>x.exercise.code),
    ['tricepsPushdown','overheadTricepsExtension']);
  assert.ok(rows.every(x=>x.variant.equipment==='CABLE'));
  assert.equal(rows[1].variantCodes.length,3);
});
test('consulta con barra Z no duplica tarjetas; encuentra dos extensiones',()=>{
  const rows=find(triceps,tricepsVariants,'triceps barra z');
  assert.deepEqual(rows.map(x=>x.exercise.code),
    ['overheadTricepsExtension','lyingTricepsExtension']);
  assert.ok(rows.every(x=>x.variant.equipment==='EZ_BAR'));
  assert.ok(rows[0].variantCodes.includes('overCable'));
});
test('buscando cuerda o barra en polea la configuración exacta queda preseleccionada',()=>{
  assert.equal(find(triceps,tricepsVariants,'extension triceps cuerda')[0].variant.code,'pushRope');
  assert.equal(find(triceps,tricepsVariants,'extension triceps barra recta')[0].variant.code,'pushBar');
});
test('query de press nunca coincide con prensa, incluso con código interno',()=>{
  const ex=[e('benchPress','Press de banca','CHEST'),e('legPress','Prensa de piernas','QUADRICEPS')];
  const variants=[
    v('incline','benchPress','BARBELL','Press de banca inclinado con barra',{benchAngle:'INCLINE'}),
    v('smith','benchPress','SMITH_MACHINE','Press de banca inclinado en Smith',{benchAngle:'INCLINE'}),
    v('pressHigh','legPress','MACHINE_PLATE_LOADED','Prensa de piernas pies altos')
  ];
  assert.deepEqual(find(ex,variants,'press').map(x=>x.exercise.code),['benchPress']);
  assert.deepEqual(find(ex,variants,'prensa').map(x=>x.exercise.code),['legPress']);
  assert.equal(matches('Prensa de piernas',['press']),false);
});
test('press banca muestra una tarjeta incluso en Smith; consulta específica la preselecciona',()=>{
  const ex=e('benchPress','Press de banca','CHEST');
  const vs=[
    v('flat','benchPress','BARBELL','Press de banca plano con barra',{isDefault:true,benchAngle:'FLAT'}),
    v('incline','benchPress','DUMBBELL','Press inclinado con mancuernas',{benchAngle:'INCLINE'}),
    v('smith','benchPress','SMITH_MACHINE','Press de banca inclinado en Smith',{benchAngle:'INCLINE'})
  ];
  const rows=find([ex],vs,'press de banca');
  assert.equal(rows.length,1);
  assert.equal(rows[0].variant.code,'flat');
  assert.equal(rows[0].variantCodes.length,3);
  const requested=find([ex],vs,'press inclinado smith');
  assert.equal(requested.length,1);
  assert.equal(requested[0].variant.code,'smith');
  assert.equal(requested[0].title,'Press de banca');
});
test('no genera un mensaje de una sola configuración',()=>{
  const ex=e('crunch','Crunch abdominal','CORE');
  const vs=[v('single','crunch','BODYWEIGHT','Crunch abdominal')];
  const found=find([ex],vs);
  assert.equal(found.length,1);
  assert.doesNotMatch(found[0].detail,/1 configuraci/);
});
test('filtro por equipamiento solo decide resultados/preselección, no restringe Configurar',()=>{
  const ex=e('bicepsCurl','Curl de bíceps','BICEPS');
  const vs=[
    v('bar','bicepsCurl','BARBELL','Curl de bíceps con barra',{isDefault:true}),
    v('dumb','bicepsCurl','DUMBBELL','Curl de bíceps con mancuernas'),
    v('cable','bicepsCurl','CABLE','Curl de bíceps en polea')
  ];
  const found=find([ex],vs,'',{equipment:'CABLE'});
  assert.equal(found.length,1);
  assert.equal(found[0].variant.code,'cable');
  assert.deepEqual(found[0].variantCodes,['bar','dumb','cable']);
});
test('jalón unilateral o agarre neutro sigue dentro de la misma familia',()=>{
  const ex=e('latPulldown','Jalón al pecho');
  const vs=[
    v('standard','latPulldown','CABLE','Jalón al pecho prono',{isDefault:true,laterality:'BILATERAL'}),
    v('uni','latPulldown','CABLE','Jalón unilateral al pecho',{laterality:'UNILATERAL'}),
    v('neutral','latPulldown','CABLE','Jalón al pecho neutro',{gripType:'NEUTRAL'})
  ];
  assert.equal(find([ex],vs,'jalon').length,1);
  assert.equal(find([ex],vs,'jalon unilateral')[0].variant.code,'uni');
  assert.equal(find([ex],vs,'jalon neutro')[0].variant.code,'neutral');
});
test('reman juntos remo en máquina, extensión de piernas, glúteos y otros materiales',()=>{
  for(const [code,name] of [
    ['machineRow','Remo en máquina'],['legPress','Prensa de piernas'],
    ['hipThrust','Hip thrust'],['overheadPress','Press de hombros'],
    ['legExtension','Extensión de piernas']]) {
    const ex=e(code,name);
    const variants=[
      v(code+'Bar',code,'BARBELL',name+' con barra',{isDefault:true}),
      v(code+'Dumb',code,'DUMBBELL',name+' con mancuernas'),
      v(code+'Smith',code,'SMITH_MACHINE',name+' en Smith')
    ];
    const all=find([ex],variants,name);
    assert.equal(all.length,1,code);
    assert.equal(all[0].variantCodes.length,3,code);
    assert.equal(find([ex],variants,name+' mancuernas')[0].variant.equipment,'DUMBBELL',code);
  }
});
test('curl femoral sentado/tumbado se preselecciona pero no se desdobla',()=>{
  const ex=e('legCurl','Curl femoral','HAMSTRINGS');
  const vs=[
    v('seated','legCurl','MACHINE_SELECTORISED','Curl femoral sentado',{bodyPosition:'SEATED',isDefault:true}),
    v('prone','legCurl','MACHINE_SELECTORISED','Curl femoral tumbado',{bodyPosition:'PRONE'})
  ];
  assert.equal(find([ex],vs,'curl femoral').length,1);
  assert.equal(find([ex],vs,'curl femoral tumbado')[0].variant.code,'prone');
});
test('curl bíceps en banco inclinado o predicador es una familia con variantes',()=>{
  const ex=e('bicepsCurl','Curl de bíceps','BICEPS');
  const vs=[
    v('curlStanding','bicepsCurl','DUMBBELL','Curl de bíceps de pie',{isDefault:true}),
    v('curlIncline','bicepsCurl','DUMBBELL','Curl de bíceps en banco inclinado'),
    v('curlPreacher','bicepsCurl','DUMBBELL','Curl predicador de bíceps con mancuernas')
  ];
  assert.equal(find([ex],vs,'curl').length,1);
  assert.equal(find([ex],vs,'curl predicador')[0].variant.code,'curlPreacher');
});
test('posición de los pies de prensa y peso muerto sumo son ajustes preseleccionables',()=>{
  const leg=e('legPress','Prensa de piernas','QUADRICEPS');
  const dead=e('deadlift','Peso muerto','FULL_BODY');
  const vs=[
    v('high','legPress','MACHINE_PLATE_LOADED','Prensa de piernas pies altos'),
    v('low','legPress','MACHINE_PLATE_LOADED','Prensa de piernas pies bajos'),
    v('conventional','deadlift','BARBELL','Peso muerto convencional',{isDefault:true}),
    v('sumo','deadlift','BARBELL','Peso muerto sumo')
  ];
  assert.equal(find([leg,dead],vs,'prensa').length,1);
  assert.equal(find([leg,dead],vs,'prensa pies altos')[0].variant.code,'high');
  assert.equal(find([leg,dead],vs,'peso muerto sumo')[0].variant.code,'sumo');
});
test('core: rueda y plancha lateral no se duplican por dificultad',()=>{
  const ex=[e('abWheel','Rueda abdominal','CORE'),e('sidePlank','Plancha lateral','CORE')];
  const vs=[
    v('knees','abWheel','AB_WHEEL','Rueda abdominal de rodillas'),
    v('standing','abWheel','AB_WHEEL','Rueda abdominal de pie'),
    v('forearm','sidePlank','BODYWEIGHT','Plancha lateral con antebrazo'),
    v('kneesPlank','sidePlank','BODYWEIGHT','Plancha lateral con rodillas')
  ];
  assert.deepEqual(find(ex,vs).map(x=>x.title),['Rueda abdominal','Plancha lateral']);
});
test('antebrazos: pronación y supinación se preseleccionan sin tarjetas adicionales',()=>{
  const ex=e('forearmRotation','Pronación y supinación de antebrazo','FOREARMS');
  const vs=[
    v('pron','forearmRotation','DUMBBELL','Pronación de antebrazo sentado'),
    v('sup','forearmRotation','DUMBBELL','Supinación de antebrazo sentado')
  ];
  assert.equal(find([ex],vs,'').length,1);
  assert.equal(find([ex],vs,'pronacion')[0].variant.code,'pron');
  assert.equal(find([ex],vs,'supinacion')[0].variant.code,'sup');
  assert.equal(find([ex],vs,'pronacion')[0].variantCodes.length,2);
});
test('escápulas: flexiones en pared/suelo y manguito rotador por material son configuración',()=>{
  const ex=[
    e('scapularPushUp','Flexiones escapulares','SCAPULAR'),
    e('shoulderExternalRotation','Rotación externa de hombro','ROTATOR_CUFF'),
    e('shoulderInternalRotation','Rotación interna de hombro','ROTATOR_CUFF')
  ];
  const vs=[
    v('floor','scapularPushUp','BODYWEIGHT','Flexiones escapulares en suelo'),
    v('wall','scapularPushUp','BODYWEIGHT','Flexiones escapulares en pared'),
    v('extCable','shoulderExternalRotation','CABLE','Rotación externa de hombro en polea'),
    v('extBand','shoulderExternalRotation','BAND','Rotación externa de hombro con banda'),
    v('intBand','shoulderInternalRotation','BAND','Rotación interna de hombro con banda')
  ];
  assert.equal(find(ex,vs,'flexiones escapulares').length,1);
  assert.equal(find(ex,vs,'flexiones escapulares pared')[0].variant.code,'wall');
  assert.deepEqual(find(ex,vs,'rotacion').map(x=>x.exercise.code),
    ['shoulderExternalRotation','shoulderInternalRotation']);
});
test('no inventa opciones ni altera códigos de las variantes',()=>{
  const rows=find([pull,scapularPull,...triceps],[...pulls,...tricepsVariants],'');
  const known=new Set([...pulls,...tricepsVariants].map(v=>v.code));
  assert.ok(rows.every(row=>row.variantCodes.every(code=>known.has(code))));
  assert.ok(rows.every(row=>known.has(row.variant.code)));
  assert.equal(groupKey(pull,pulls[0]),'pullUp');
  assert.equal(titleFor(triceps[0]),'Extensión de tríceps');
  assert.equal(preferred(pulls).code,'pronMedium');
});
test('normaliza tildes y busca por palabras, no por códigos internos',()=>{
  assert.equal(normalize('MÁQUINA'), 'maquina');
  assert.equal(matches('Press de banca',['press','banc']),true);
  assert.equal(matches('Prensa de piernas',['press']),false);
  const ex=e('legPress','Prensa de piernas','QUADRICEPS');
  assert.equal(find([ex],[v('legPressInternal','legPress','MACHINE_PLATE_LOADED','Prensa de piernas')],'legPressInternal').length,0);
});
test('el título específico utilizado tras seleccionar mantiene el ejercicio registrado',()=>{
  assert.equal(variantTitle({name:'Press de banca'}, {
    name:'Press plano con barra',equipment:'BARBELL',benchAngle:'FLAT'
  }), 'Press de banca plano');
});

const from=app.indexOf('function renderSessionExerciseResults() {');
const until=app.indexOf('function renderSessionExerciseConfig() {',from);
test('el selector usa una tarjeta por familia y variantes completas, sin recortar Configurar',()=>{
  assert.match(app,/FitCoreExerciseSearch\.search\(/);
  assert.ok(from>=0 && until>from);
  const renderer=app.slice(from,until);
  assert.match(renderer,/escapeHtml\(title \|\| exercise\.name\)/);
  assert.match(renderer,/data-session-variant-code/);
  assert.match(renderer,/matchingCodes/);
  assert.match(app,/state\.pickerGroupCodes = null;/);
  const start=app.indexOf('function availablePickerVariants(exercise) {');
  const end=app.indexOf('function renderPlanSimpleExerciseConfig(',start);
  assert.ok(start>=0 && end>start);
  const helper=app.slice(start,end);
  assert.match(helper,/return all;/);
  assert.doesNotMatch(helper,/filter\(variant => group\.includes/);
});
test('una búsqueda distinta invalida la selección anterior',()=>{
  const renderer=app.slice(from,until);
  const nodes={
    'session-exercise-results':{innerHTML:''},
    'session-exercise-count':{textContent:''},
    'session-add-exercise':{disabled:false}
  };
  const state={
    exercises:[pull,scapularPull],variants:pulls,
    sessionPicker:{exercise:pull,configuration:{variantCode:'pronMedium'}},
    pickerConfigOpen:true,pickerConfigMoreOpen:true
  };
  const context={
    state,$:id=>nodes[id],
    filteredSessionExercises:()=>find([pull],pulls,'dominadas supinas'),
    renderSessionExerciseConfig:()=>{nodes['session-add-exercise'].disabled=!state.sessionPicker.exercise;},
    exerciseThumb:()=>'<span>DO</span>',escapeHtml:String,friendly
  };
  vm.createContext(context);
  vm.runInContext(renderer,context);
  context.renderSessionExerciseResults();
  assert.equal(state.sessionPicker.exercise,null);
  assert.equal(nodes['session-add-exercise'].disabled,true);
});
test('la variante específica se muestra como dato de selección, no como título duplicado',()=>{
  const renderer=app.slice(from,until);
  const nodes={
    'session-exercise-results':{innerHTML:''},
    'session-exercise-count':{textContent:''}
  };
  const found=find([pull],pulls,'dominadas supinas');
  const context={
    state:{exercises:[pull],variants:pulls,
      sessionPicker:{exercise:pull,configuration:{variantCode:'supMedium'}}},
    $:id=>nodes[id],filteredSessionExercises:()=>found,
    renderSessionExerciseConfig:()=>{throw new Error('No se debe resetear');},
    exerciseThumb:()=>'<span>DO</span>',escapeHtml:String,friendly
  };
  vm.createContext(context);
  vm.runInContext(renderer,context);
  context.renderSessionExerciseResults();
  assert.match(nodes['session-exercise-results'].innerHTML,/>Dominadas<\/strong>/);
  assert.doesNotMatch(nodes['session-exercise-results'].innerHTML,/Dominadas supinas<\/strong>/);
  assert.match(nodes['session-exercise-results'].innerHTML,/data-session-variant-code="supMedium"/);
  assert.match(nodes['session-exercise-results'].innerHTML,/aria-pressed="true"/);
});

test('press incluye su sinónimo press francés y prioriza nombres de press',()=>{
  const tr=e('lyingTricepsExtension','Extensión de tríceps tumbado','TRICEPS');
  const press=e('benchPress','Press de banca','CHEST');
  const vs=[v('tr','lyingTricepsExtension','EZ_BAR','Extensión tumbada con barra Z'),
            v('p','benchPress','BARBELL','Press de banca plano')];
  assert.deepEqual(find([tr,press],vs,'press').map(x=>x.exercise.code),
    ['benchPress','lyingTricepsExtension']);
  assert.deepEqual(find([tr,press],vs,'press francés').map(x=>x.exercise.code),['lyingTricepsExtension']);
});
test('curl de bíceps de pie y sentado se encuentran en la misma familia',()=>{
  const ex=e('bicepsCurl','Curl de bíceps','BICEPS');
  const vs=[v('standing','bicepsCurl','DUMBBELL','Curl de bíceps de pie con mancuernas',{bodyPosition:'STANDING'}),
            v('seated','bicepsCurl','DUMBBELL','Curl de bíceps sentado con mancuernas',{bodyPosition:'SEATED'})];
  assert.equal(find([ex],vs,'curl').length,1);
  assert.equal(find([ex],vs,'curl biceps de pie')[0].variant.code,'standing');
  assert.equal(find([ex],vs,'curl biceps sentado')[0].variant.code,'seated');
});

test('escribir «francés» sin press también localiza la extensión tumbada',()=>{
  const tr=e('lyingTricepsExtension','Extensión de tríceps tumbado','TRICEPS');
  const variants=[v('ez','lyingTricepsExtension','EZ_BAR',
    'Extensión de tríceps tumbado con barra Z')];
  assert.deepEqual(find([tr],variants,'frances').map(x=>x.title),
    ['Extensión de tríceps tumbado']);
});

test('Sin equipamiento incluye flexiones y variante en pared, excluye barras y paralelas',()=>{
 const e=[{code:'scapularPushUp',name:'Flexiones escapulares',mainMuscleGroup:'SCAPULAR'},
  {code:'pullUp',name:'Dominadas',mainMuscleGroup:'BACK'},
  {code:'dip',name:'Fondos en paralelas',mainMuscleGroup:'CHEST'},
  {code:'pushUp',name:'Flexiones',mainMuscleGroup:'CHEST'}];
 const variants=[
  v('floor','scapularPushUp','BODYWEIGHT','Flexiones escapulares en suelo',{requiredFacility:'NONE',isDefault:true}),
  v('wall','scapularPushUp','BODYWEIGHT','Flexiones escapulares en pared',{requiredFacility:'WALL'}),
  v('pull','pullUp','BODYWEIGHT','Dominadas pronas',{requiredFacility:'PULL_UP_BAR'}),
  v('dip','dip','BODYWEIGHT','Fondos',{requiredFacility:'PARALLEL_BARS'}),
  v('push','pushUp','BODYWEIGHT','Flexiones estándar',{requiredFacility:'NONE'})
 ];
 const none=find(e,variants,'',{equipment:'NONE'});
 assert.deepEqual(none.map(x=>x.title),['Flexiones escapulares','Flexiones']);
 assert.deepEqual(none[0].variantCodes,['floor','wall']);
 assert.equal(find(e,variants,'',{equipment:'BODYWEIGHT'}).length,4);
 assert.equal(find(e,variants,'flexiones escapulares pared',{equipment:'NONE'})[0].variant.code,'wall');
});

test('plan distingue tiempo vs repeticiones según la unidad del catálogo',()=>{
 assert.match(app,/function exerciseDefaultUnit\(/);
 assert.match(app,/plan-picker-duration-label/);
 assert.match(app,/targetDurationSeconds=readPositiveInteger/);
 assert.match(app,/targetDurationSeconds:e.targetDurationSeconds/);
});
