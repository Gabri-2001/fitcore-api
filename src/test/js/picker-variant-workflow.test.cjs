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
        'Press de banca inclinado');
    assert.equal(variantTitle(base, variant('default', 'Press plano con barra', 'FLAT','BARBELL')),
        'Press de banca plano');
    assert.equal(variantTitle(base, variant('smith', 'Press de banca inclinado en Smith', 'INCLINE','SMITH_MACHINE')),
        'Press de banca inclinado en Smith');
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
    assert.match(extract('function renderSessionExerciseResults()', 'function renderSessionExerciseConfig()'), /FitCoreVariantUI\.variantTitle\(exercise, variant\)/);
    assert.match(extract('function exerciseEditor(', 'function closePlanRowMenus('), /FitCoreVariantUI\.variantTitle\(base, variant\)/);
    assert.match(source, /const exerciseName = variant \? FitCoreVariantUI\.variantTitle\(base, variant\)/);
});

test('se conserva variante específica, botón accesible y ajustes en el panel antes de añadir', () => {
    const helperSection = extract('function renderVariantConfiguratorFields(', 'async function openPlanAdvancedConfigDialog(');
    const variants = [
        variant('default', 'Press plano con barra', 'FLAT','BARBELL'),
        variant('incline', 'Press inclinado con mancuernas', 'INCLINE','DUMBBELL')
    ];
    const context = {
        state:{pickerConfigOpen:false, pickerConfigMoreOpen:false, sessionPicker:{configuration:{variantCode:'incline'}}},
        FitCoreVariantUI:{variantTitle},
        planPrimaryVariantKeys:new Set(['equipment','benchAngle','gripType','gripWidth']),
        orderedVariantsForExercise:()=>variants,
        defaultVariantForExercise:()=>variants[0],
        configurationFromVariant:v=>({variantCode:v.code,equipment:v.equipment,benchAngle:v.benchAngle}),
        resolveVariantForExercise:(exercise, configuration)=>({
            selectedVariant: variants.find(v=>v.code===configuration.variantCode)||variants[0],
            candidates:variants,
            controls:[{key:'equipment',label:'Equipamiento',values:['BARBELL','DUMBBELL'],selected:configuration.equipment||'DUMBBELL',empty:[]}]
        }),
        variantConfigurationChips:v=>[v.equipment,v.benchAngle],
        exerciseThumb:()=>'<span>PR</span>',
        escapeHtml:v=>String(v??'').replaceAll('&','&amp;').replaceAll('<','&lt;'),
        variantValue:(_,v)=>v,
        friendly:v=>v,
        $:()=>({disabled:null})
    };
    vm.createContext(context);
    vm.runInContext(helperSection, context);
    const container = {innerHTML:''};
    context.renderPlanSimpleExerciseConfig(container, base);
    assert.match(container.innerHTML,/data-picker-toggle-config/);
    assert.match(container.innerHTML,/Press de banca inclinado/);
    assert.match(container.innerHTML,/Press inclinado con mancuernas/);
    assert.equal(context.state.sessionPicker.configuration.variantCode,'incline');
    context.state.pickerConfigOpen = true;
    context.renderPlanSimpleExerciseConfig(container, base);
    assert.match(container.innerHTML,/data-picker-variant-field="equipment"/);
    assert.match(container.innerHTML,/data-picker-variant-code/);
    assert.match(container.innerHTML,/data-picker-reset-default/);
    assert.equal(context.state.sessionPicker.configuration.variantCode,'incline');
});

test('el editor posterior reutiliza los mismos controles sin alterar los códigos', () => {
    const advanced = extract('function renderPlanAdvancedConfig(', 'function closePlanAdvancedConfig(');
    assert.match(advanced, /renderVariantConfiguratorFields\(controls, candidates, selectedVariant/);
    assert.match(advanced, /data-plan-advanced-field/);
    assert.match(advanced, /data-plan-advanced-variant-code/);
    const events = extract("$('session-exercise-config').addEventListener('change',e=>", "$('plan-advanced-config-form').addEventListener('submit'");
    assert.match(events, /data-picker-toggle-config/);
    assert.match(events, /data-picker-variant-field/);
    assert.match(events, /data-picker-variant-code/);
});
