// Pruebas de regresión de presentación y selector previo al guardado.
// No se usa API, PostgreSQL, DOM real ni dependencias externas.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const staticDir = path.resolve(__dirname, '../../main/resources/static/fitcore-lab');
const {variantTitle} = require(path.join(staticDir, 'exercise-variant-ui.js'));
const source = fs.readFileSync(path.join(staticDir, 'app.js'), 'utf8');
const html = fs.readFileSync(path.join(staticDir, 'index.html'), 'utf8');

const base = {name: 'Press de banca', code: 'benchPress'};
const variant = (code, name, angle, equipment) => ({
    code, name, exerciseCode: base.code, benchAngle: angle, equipment,
    gripType: 'PRONATED', gripWidth: 'MEDIUM', defaultVariant: code === 'default'
});

function extract(start, end) {
    const i = source.indexOf(start);
    const j = source.indexOf(end, i + start.length);
    assert.ok(i >= 0 && j > i, `No se encontró ${start} / ${end}`);
    return source.slice(i, j);
}

test('las búsquedas generales conservan el nombre del ejercicio base', () => {
    assert.equal(variantTitle(base, null), 'Press de banca');
});

test('press inclinado, plano y Smith tienen título específico coherente', () => {
    assert.equal(variantTitle(base, variant('incline', 'Press inclinado con mancuernas, agarre neutro', 'INCLINE','DUMBBELL')),
        'Press de banca inclinado (≈30–45°)');
    assert.equal(variantTitle(base, variant('default', 'Press plano con barra', 'FLAT','BARBELL')),
        'Press de banca plano');
    assert.equal(variantTitle(base, variant('smith', 'Press de banca inclinado en Smith', 'INCLINE','SMITH_MACHINE')),
        'Press de banca inclinado (≈30–45°) en Smith');
});

test('en otros grupos se utiliza el nombre de la variante, sin nombre base repetido', () => {
    const exercise = {name:'Jalón al pecho', code:'latPulldown'};
    const back = variant('b', 'Jalón al pecho supino, agarre estrecho', 'NOT_APPLICABLE','CABLE');
    assert.equal(variantTitle(exercise, back), 'Jalón al pecho supino');
    assert.equal(variantTitle({name:'Remo con barra'}, {name:'Remo con barra con agarre prono'}),
        'Remo con barra con agarre prono');
});

test('el HTML carga el formateador antes de app.js', () => {
    assert.ok(html.indexOf('exercise-variant-ui.js') > 0);
    assert.ok(html.indexOf('exercise-variant-ui.js') < html.indexOf('src="./app.js"'));
});

test('selector, plan y sesión emplean el mismo nombre visible', () => {
    assert.match(extract('function renderSessionExerciseResults()', 'function renderSessionExerciseConfig()'), /escapeHtml\(title \|\| exercise\.name\)/);
    assert.match(extract('function exerciseEditor(', 'function closePlanRowMenus('), /FitCoreVariantUI\.variantTitle\(base, variant\)/);
    assert.match(source, /const exerciseName = variant \? FitCoreVariantUI\.variantTitle\(base, variant\)/);
});


test('el selector permite configurar solo cuando hay variantes alternativas', () => {
    const section = extract('function availablePickerVariants(', 'async function openPlanAdvancedConfigDialog(');
    assert.match(section, /variants\.length > 1/);
    assert.match(section, /data-picker-toggle-config/);
    assert.match(section, /showModal\(\)/);
    assert.match(section, /data-picker-dialog-field/);
    assert.match(section, /renderVariantConfiguratorFields\(controls, candidates, selectedVariant/);
    assert.match(section, /state\.sessionPicker\.configuration = configurationFromVariant\(selectedVariant\)/);
    assert.match(html, /id="picker-variant-dialog"/);
    assert.match(html, /id="picker-variant-apply"/);
    assert.match(html, /data-close-picker-variant/);
});

test('Cancelar deja la selección original y Aplicar confirma el borrador', () => {
    const section = extract('function availablePickerVariants(', 'async function openPlanAdvancedConfigDialog(');
    const nodes = {
        'picker-variant-dialog': {open:false,showModal(){this.open=true;},close(){this.open=false;}},
        'picker-variant-dialog-body': {querySelector(){return null;}},
        'picker-variant-title': {textContent:''},
        'picker-variant-identity': {innerHTML:''},
        'picker-variant-dialog-fields': {innerHTML:''},
        'picker-variant-dialog-result': {innerHTML:''},
        'picker-variant-apply': {disabled:false}
    };
    const context = {
        state: {pickerMode:'plan',pickerGroupCodes:null,pickerDraft:null,
            sessionPicker:{exercise:base,configuration:{variantCode:'default'}}},
        orderedVariantsForExercise: () => [
            variant('default','Press plano con barra','FLAT','BARBELL'),
            variant('incline','Press inclinado con mancuernas','INCLINE','DUMBBELL')
        ],
        configurationFromVariant:v=>({variantCode:v.code,equipment:v.equipment,benchAngle:v.benchAngle}),
        resolveVariantForExercise:(_,config,options)=>({
            controls:[],candidates:options,
            selectedVariant:options.find(v=>v.code===config.variantCode)||options[0]
        }),
        renderVariantConfiguratorFields:()=>'<div>Controles</div>',
        variantConfigurationChips:()=>[],
        exerciseThumb:()=>'<span>PR</span>',
        escapeHtml:String,friendly:String,
        FitCoreVariantUI:{variantTitle},
        renderSessionExerciseConfig:()=>{},renderSessionExerciseResults:()=>{},
        $:id=>nodes[id]
    };
    vm.createContext(context);
    vm.runInContext(section,context);
    context.openPickerVariantDialog();
    context.state.pickerDraft.configuration.variantCode='incline';
    context.closePickerVariantDialog();
    assert.equal(context.state.sessionPicker.configuration.variantCode,'default');
    context.openPickerVariantDialog();
    context.state.pickerDraft.configuration.variantCode='incline';
    context.applyPickerVariantDialog();
    assert.equal(context.state.sessionPicker.configuration.variantCode,'incline');
    assert.equal(context.state.pickerDraft,null);
    assert.equal(nodes['picker-variant-dialog'].open,false);
});


test('el editor posterior reutiliza los mismos controles sin alterar los códigos', () => {
    const advanced = extract('function renderPlanAdvancedConfig(', 'function closePlanAdvancedConfig(');
    assert.match(advanced, /renderVariantConfiguratorFields\(controls, candidates, selectedVariant/);
    assert.match(advanced, /data-plan-advanced-field/);
    assert.match(advanced, /data-plan-advanced-variant-code/);
    const events = extract("$('session-exercise-config').addEventListener('change',e=>", "$('plan-advanced-config-form').addEventListener('submit'");
    assert.match(events, /data-picker-toggle-config/);
    assert.match(events, /data-picker-dialog-field/);
    assert.match(events, /data-picker-dialog-variant-code/);
});

test('fondos con dos ejecuciones muestran selección real aunque no haya controles alternativos', () => {
    const helper = extract('function renderVariantConfiguratorFields(', 'function availablePickerVariants(');
    const variants = [
        {code:'dipBodyweightForwardLean', name:'Fondos inclinados para pecho'},
        {code:'dipBodyweightUpright', name:'Fondos verticales para tríceps'}
    ];
    const context = {
        planPrimaryVariantKeys: new Set(['equipment','gripType','gripWidth','benchAngle']),
        escapeHtml: value => String(value??''),
        variantValue: (_,value) => value
    };
    vm.createContext(context);
    vm.runInContext(helper, context);
    const controls = [{
        key:'benchAngle', label:'Ángulo del banco', selected:'NOT_APPLICABLE',
        values:['NOT_APPLICABLE','UPRIGHT'], empty:['NOT_APPLICABLE']
    }];
    const html = context.renderVariantConfiguratorFields(controls, [variants[0]], variants[0], {
        allVariants:variants,
        exactAttribute:'data-picker-dialog-variant-code'
    });
    assert.match(html,/Tipo de ejecución/);
    assert.match(html,/Fondos inclinados para pecho/);
    assert.match(html,/Fondos verticales para tríceps/);
    assert.doesNotMatch(html,/No hay ajustes principales alternativos/);
});
test('la opción directa tampoco aparece si solo existe una variante', () => {
    const helper = extract('function renderVariantConfiguratorFields(', 'function availablePickerVariants(');
    const context = {planPrimaryVariantKeys:new Set(),escapeHtml:String,variantValue:(_,v)=>v};
    vm.createContext(context);
    vm.runInContext(helper,context);
    const singleton = {code:'crunchBodyweight',name:'Crunch'};
    const html = context.renderVariantConfiguratorFields([], [singleton], singleton, {allVariants:[singleton]});
    assert.doesNotMatch(html,/Variante concreta|Tipo de ejecución|No hay ajustes principales alternativos/);
});

test('posición opcional acorta título y preserva variantes distintas en el catálogo',()=>{
  const UI=require(path.join(staticDir,'exercise-variant-ui.js'));
  const ex={code:'bicepsCurl',name:'Curl de bíceps'};
  const stand={name:'Curl de bíceps de pie con mancuernas',bodyPosition:'STANDING'};
  const seated={name:'Curl de bíceps sentado con mancuernas',bodyPosition:'SEATED'};
  assert.equal(UI.variantTitle(ex,stand),'Curl de bíceps con mancuernas');
  assert.equal(UI.variantTitle(ex,seated),'Curl de bíceps con mancuernas');
  assert.equal(UI.variantTitle(ex,seated,{showPosition:true}),'Curl de bíceps sentado con mancuernas');
  assert.equal(UI.hasOptionalPosition(ex,[stand,seated]),true);
  const leg={code:'legCurl',name:'Curl femoral'};
  assert.equal(UI.variantTitle(leg,{name:'Curl femoral sentado en máquina',bodyPosition:'SEATED'}),
      'Curl femoral sentado en máquina');
});
test('selector de posición muestra Sin especificar y se conecta al configurador',()=>{
  assert.match(source,/function pickerPositionOptions\(/);
  assert.match(source,/Sin especificar/);
  assert.match(source,/data-picker-dialog-position/);
  assert.match(source,/data-picker-position/);
  assert.match(source,/function selectPickerPosition\(/);
});
