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
    assert.match(section, /state\.sessionPicker\.configuration = \{\.\.\.configurationFromVariant\(selectedVariant\)/);
    assert.match(html, /id="picker-variant-dialog"/);
    assert.match(html, /id="picker-variant-apply"/);
    assert.match(html, /data-close-picker-variant/);
});

test('Cancelar deja la selección original y Aplicar confirma el borrador', () => {
    const section = extract('function availablePickerVariants(', 'async function openPlanAdvancedConfigDialog(');
    const nodes = {
        'picker-variant-dialog': {
            open:false, style:{values:{},setProperty(key,value){this.values[key]=value;}},
            showModal(){this.open=true;},close(){this.open=false;}
        },
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
        variantConfigFields:[
            {key:'equipment',always:true,empty:[]},
            {key:'benchAngle',empty:['NOT_APPLICABLE']}
        ],
        planPrimaryVariantKeys:new Set(['equipment','gripType','gripWidth','benchAngle']),
        configurationFromVariant:v=>({variantCode:v.code,equipment:v.equipment,benchAngle:v.benchAngle}),
        resolveVariantForExercise:(_,config,options)=>({
            controls:[],candidates:options,
            selectedVariant:options.find(v=>v.code===config.variantCode)||options[0]
        }),
        renderVariantConfiguratorFields:()=>'<div>Controles</div>',
        pickerPositionOptions:()=>'',
        pickerVariantTitle:(exercise,variant)=>variantTitle(exercise,variant),
        variantConfigurationChips:()=>[],
        exerciseThumb:()=>'<span>PR</span>',
        escapeHtml:String,friendly:String,
        FitCoreVariantUI:{variantTitle,hasOptionalPosition:()=>false,optionalPosition:()=>false},
        renderSessionExerciseConfig:()=>{},renderSessionExerciseResults:()=>{},
        $:id=>nodes[id]
    };
    vm.createContext(context);
    vm.runInContext(section,context);
    context.openPickerVariantDialog();
    const modalHeight=nodes['picker-variant-dialog'].style.values['--picker-variant-height-desktop'];
    assert.match(modalHeight,/^\\d+px$/);
    assert.ok(Number.parseInt(modalHeight,10)>=610);
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
  const simple = extract('function renderPlanSimpleExerciseConfig(', 'function openPickerVariantDialog(');
  assert.doesNotMatch(simple,/data-picker-position/);
  assert.match(source,/data-picker-dialog-position/);
  assert.match(source,/function selectPickerPosition\(/);
});

test('curl de concentración se presenta como curl de bíceps sentado sin cambiar el código',()=>{
    const exercise={code:'bicepsCurl',name:'Curl de bíceps'};
    const variant={code:'bicepsCurlDumbbellConcentrationSeated',
        name:'Curl de concentración sentado con mancuerna',
        bodyPosition:'SEATED',equipment:'DUMBBELL'};
    assert.equal(variantTitle(exercise,variant),'Curl de bíceps sentado');
    assert.equal(variant.code,'bicepsCurlDumbbellConcentrationSeated');
    assert.equal(variantTitle(exercise,variant,{showPosition:true}),'Curl de bíceps sentado');
});
test('posición corporal solo se edita en Configurar; no en el resumen del plan',()=>{
    const simple=extract('function renderPlanSimpleExerciseConfig(', 'function openPickerVariantDialog(');
    const modal=extract('function renderPickerVariantDialog(', 'function closePickerVariantDialog(');
    assert.doesNotMatch(simple,/pickerPositionOptions\(/);
    assert.doesNotMatch(simple,/data-picker-position/);
    assert.match(modal,/pickerPositionOptions\(/);
    assert.match(modal,/data-picker-dialog-position/);
    assert.match(source,/hideBodyPosition: preference === 'UNSPECIFIED'/);
});

test('posición opcional queda dentro de Más ajustes técnicos, debajo del material',()=>{
  const helper=extract('function renderVariantConfiguratorFields(', 'function availablePickerVariants(');
  const ctx={
    planPrimaryVariantKeys:new Set(['equipment','gripType','gripWidth','benchAngle']),
    escapeHtml:String,
    variantValue:(_,value)=>value
  };
  vm.createContext(ctx);
  vm.runInContext(helper,ctx);
  const controls=[
    {key:'equipment',label:'Material o equipo',values:['DUMBBELL','BARBELL'],selected:'DUMBBELL',empty:[]},
    {key:'supportType',label:'Tipo de apoyo',values:['FREE','BENCH_SUPPORTED'],selected:'FREE',empty:[]},
    {key:'bodyPosition',label:'Posición corporal',values:['STANDING','SEATED'],selected:'SEATED',empty:[]}
  ];
  const position='<label>Posición corporal<select data-picker-dialog-position><option value="UNSPECIFIED">Sin especificar</option><option value="STANDING">De pie</option><option value="SEATED">Sentado</option></select></label>';
  const output=ctx.renderVariantConfiguratorFields(controls,[],null,{
    hideBodyPosition:true,
    extraTechnicalFields:[position],
    allVariants:[]
  });
  const start=output.indexOf('<details class="plan-advanced-more"');
  const end=output.indexOf('</details>',start);
  const technical=output.slice(start,end);
  assert.ok(output.indexOf('Material o equipo')<start);
  assert.match(technical,/Más ajustes técnicos <small>\(2\)<\/small>/);
  assert.match(technical,/data-picker-dialog-position/);
  assert.match(technical,/Tipo de apoyo/);
  assert.ok(technical.indexOf('data-picker-dialog-position')<technical.indexOf('Tipo de apoyo'));
  assert.equal((output.match(/Posición corporal/g)||[]).length,1);
  assert.doesNotMatch(output.slice(0,start),/Posición corporal/);
});

test('si solo existe ajuste de postura, el apartado técnico se conserva (1)',()=>{
  const helper=extract('function renderVariantConfiguratorFields(', 'function availablePickerVariants(');
  const ctx={planPrimaryVariantKeys:new Set(['equipment']),escapeHtml:String,variantValue:(_,v)=>v};
  vm.createContext(ctx);
  vm.runInContext(helper,ctx);
  const output=ctx.renderVariantConfiguratorFields([],[],null,{
    extraTechnicalFields:['<label>Posición corporal<select data-picker-dialog-position></select></label>'],
    allVariants:[]
  });
  assert.match(output,/Más ajustes técnicos <small>\(1\)<\/small>/);
  assert.match(output,/<div class="plan-advanced-extra-fields"><label>Posición corporal/);
  assert.doesNotMatch(output,/<details[^>]+open>/);
});

test('el diálogo no muestra postura como ajuste principal',()=>{
  const modal=extract('function renderPickerVariantDialog(', 'function closePickerVariantDialog(');
  assert.match(modal,/extraTechnicalFields: optionalPosition/);
  assert.match(modal,/pickerPositionOptions\(/);
  assert.doesNotMatch(modal,/pickerPositionOptions\([\s\S]*?\) \+\s*renderVariantConfiguratorFields/);
  assert.match(modal,/hideBodyPosition:optionalPosition/);
});

test('cambiar repetidamente postura conserva Más ajustes técnicos abierto hasta cerrarlo',()=>{
    const start = source.indexOf("    $('picker-variant-dialog-body').addEventListener('change', event => {");
    const end = source.indexOf("    $('picker-variant-reset').addEventListener('click'",start);
    assert.ok(start>0 && end>start,'No se encontró el listener del configurador');
    const listener=source.slice(start,end);
    let change;
    let renderCount=0;
    const details={open:true};
    const draft={
        moreOpen:false,
        configuration:{variantCode:'stand',_positionPreference:'UNSPECIFIED'}
    };
    const exercise={code:'bicepsCurl',name:'Curl de bíceps'};
    const state={
        pickerDraft:draft,
        sessionPicker:{exercise}
    };
    const ctx={
        state,
        $:id=>id==='picker-variant-dialog-body'?
            {addEventListener:(type,callback)=>{if(type==='change')change=callback;}}:
            {querySelector:()=>({...details, focus:()=>{}})},
        availablePickerVariants:()=>[
            {code:'stand',bodyPosition:'STANDING'},
            {code:'sit',bodyPosition:'SEATED'}
        ],
        selectPickerPosition:(_,variants,configuration,value)=>({
            ...configuration,
            variantCode:value==='SEATED'?'sit':'stand',
            _positionPreference:value
        }),
        renderPickerVariantDialog:()=>{renderCount++;details.open=draft.moreOpen;},
        configurationFromVariant:v=>({variantCode:v.code})
    };
    vm.createContext(ctx);
    vm.runInContext(listener,ctx);
    assert.equal(typeof change,'function');

    // La primera selección ya debe preservar «abierto», no solo los campos
    // que pasan por data-picker-dialog-field.
    for(const value of ['STANDING','SEATED','UNSPECIFIED','SEATED']) {
        details.open=true;
        change({target:{closest:selector=>
            selector==='[data-picker-dialog-position]'?{value}:null}});
        assert.equal(draft.moreOpen,true);
        assert.equal(details.open,true);
        assert.equal(draft.configuration._positionPreference,value);
    }
    // Cambiar otro ajuste técnico tampoco debe cerrarlo.
    details.open=true;
    change({target:{closest:selector=>
        selector==='[data-picker-dialog-field]'?
            {dataset:{pickerDialogField:'supportType'},value:'FREE'}:null}});
    assert.equal(details.open,true);
    assert.equal(draft.configuration.supportType,'FREE');
    // Si el usuario lo ha cerrado expresamente, debe permanecer cerrado.
    details.open=false;
    change({target:{closest:selector=>
        selector==='[data-picker-dialog-position]'?{value:'STANDING'}:null}});
    assert.equal(draft.moreOpen,false);
    assert.equal(details.open,false);
    assert.equal(renderCount,6);
});
